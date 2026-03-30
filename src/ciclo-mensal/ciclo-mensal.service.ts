import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CicloMensal,
  CicloMensalDocument,
  CicloMensalStatus,
} from './schemas/ciclo-mensal.schema';
import { CriarCicloMensalDto } from './dto/criar-ciclo-mensal.dto';
import { AtualizarCicloMensalDto } from './dto/atualizar-ciclo-mensal.dto';
import { Partida, PartidaDocument } from '../partidas/schemas/partida.schema';
import { ConfiguracoesGeraisService } from '../configuracoes-gerais/configuracoes-gerais.service';

@Injectable()
export class CicloMensalService {
  private readonly logger = new Logger(CicloMensalService.name);

  constructor(
    @InjectModel(CicloMensal.name)
    private cicloMensalModel: Model<CicloMensalDocument>,
    @InjectModel(Partida.name)
    private partidaModel: Model<PartidaDocument>,
    private readonly configuracoesGeraisService: ConfiguracoesGeraisService,
  ) {}

  private calcularDatasPartidas(
    dataInicial: Date,
    dataFinal: Date,
    diaSemana: number,
  ): Date[] {
    const datas: Date[] = [];
    const atual = new Date(dataInicial);

    while (atual < dataFinal) {
      if (atual.getDay() === diaSemana) {
        datas.push(new Date(atual));
      }
      atual.setDate(atual.getDate() + 1);
    }

    return datas;
  }

  private calcularAberturaLista(
    dataPartida: Date,
    horario: string,
    antecedenciaHoras: number,
  ): Date {
    const [horas, minutos] = horario.split(':').map(Number);
    const horarioPartida = new Date(dataPartida);
    horarioPartida.setHours(horas, minutos, 0, 0);
    return new Date(
      horarioPartida.getTime() - antecedenciaHoras * 60 * 60 * 1000,
    );
  }

  private calcularFechamentoMensalistas(
    dataPartida: Date,
    horario: string,
    tempoLimiteHoras: number,
  ): Date {
    const [horas, minutos] = horario.split(':').map(Number);
    const horarioPartida = new Date(dataPartida);
    horarioPartida.setHours(horas, minutos, 0, 0);
    return new Date(
      horarioPartida.getTime() - tempoLimiteHoras * 60 * 60 * 1000,
    );
  }

  private async verificarFechamentoLazy(
    ciclo: CicloMensalDocument,
  ): Promise<CicloMensalDocument> {
    if (
      ciclo.status === CicloMensalStatus.ATIVO &&
      new Date() > new Date(ciclo.dataFinal)
    ) {
      ciclo.status = CicloMensalStatus.FECHADO;
      await ciclo.save();
      this.logger.log(`Ciclo fechado automaticamente | id: ${ciclo['_id']}`);
    }
    return ciclo;
  }

  async criar(
    timeId: string,
    criarCicloMensalDto: CriarCicloMensalDto,
  ): Promise<CicloMensal> {
    this.logger.log(
      `Criando ciclo mensal | time: ${timeId} | dataInicial: ${criarCicloMensalDto.dataInicial}`,
    );

    const cicloAtivo = await this.cicloMensalModel
      .findOne({
        time: new Types.ObjectId(timeId),
        status: CicloMensalStatus.ATIVO,
      })
      .exec();

    if (cicloAtivo) {
      if (new Date() > new Date(cicloAtivo.dataFinal)) {
        cicloAtivo.status = CicloMensalStatus.FECHADO;
        await cicloAtivo.save();
      } else {
        throw new BadRequestException(
          'Já existe um ciclo mensal ativo para este time. Feche o ciclo atual antes de criar outro.',
        );
      }
    }

    const config = await this.configuracoesGeraisService.buscar(timeId);

    const dataInicial = new Date(criarCicloMensalDto.dataInicial);
    const dataFinal = new Date(dataInicial);
    dataFinal.setMonth(dataFinal.getMonth() + 1);

    const datasPartidas = this.calcularDatasPartidas(
      dataInicial,
      dataFinal,
      config.diaFutebol,
    );

    this.logger.log(
      `Partidas a gerar: ${datasPartidas.length} | diaFutebol: ${config.diaFutebol} | horario: ${config.horaFutebol}`,
    );

    const valorMensalidade =
      criarCicloMensalDto.valorMensalidade ?? config.valorMensalista;
    const valorDiaria = criarCicloMensalDto.valorDiaria ?? config.diaria;

    const mensalistasIds = criarCicloMensalDto.mensalistas ?? [];
    const mensalistas = mensalistasIds.map((id) => ({
      jogador: new Types.ObjectId(id),
      pago: false,
    }));

    const ciclo = new this.cicloMensalModel({
      time: new Types.ObjectId(timeId),
      dataInicial,
      dataFinal,
      quantidadePartidas: datasPartidas.length,
      status: CicloMensalStatus.ATIVO,
      valorMensalidade,
      valorDiaria,
      mensalistas,
    });

    const cicloSalvo = await ciclo.save();
    this.logger.log(
      `Ciclo mensal criado | id: ${cicloSalvo['_id']} | mensalistas: ${mensalistas.length}`,
    );

    const limiteJogadores = config.jogadoresPorTime * config.quantidadeTimes;

    const partidas = datasPartidas.map((data) => ({
      time: new Types.ObjectId(timeId),
      cicloMensal: cicloSalvo['_id'],
      data,
      horario: config.horaFutebol,
      aberturaLista: this.calcularAberturaLista(
        data,
        config.horaFutebol,
        config.antecedenciaAberturaLista,
      ),
      fechamentoMensalistas: this.calcularFechamentoMensalistas(
        data,
        config.horaFutebol,
        config.tempoLimiteMensalistas,
      ),
      limiteJogadores,
    }));

    await this.partidaModel.insertMany(partidas);
    this.logger.log(
      `${partidas.length} partidas geradas para o ciclo ${cicloSalvo['_id']}`,
    );

    return cicloSalvo;
  }

  async buscarTodos(timeId: string): Promise<CicloMensal[]> {
    this.logger.log(`Buscando ciclos mensais do time: ${timeId}`);
    return this.cicloMensalModel
      .find({ time: new Types.ObjectId(timeId) })
      .populate('mensalistas.jogador')
      .exec();
  }

  async buscarPorId(timeId: string, id: string): Promise<CicloMensal> {
    this.logger.debug(`Buscando ciclo mensal | id: ${id} | time: ${timeId}`);
    const ciclo = await this.cicloMensalModel
      .findOne({ _id: id, time: new Types.ObjectId(timeId) })
      .populate('mensalistas.jogador')
      .exec();
    if (!ciclo) {
      this.logger.warn(`Ciclo mensal nao encontrado | id: ${id}`);
      throw new NotFoundException('Ciclo mensal não encontrado');
    }
    await this.verificarFechamentoLazy(ciclo);
    return ciclo;
  }

  async buscarAtual(timeId: string): Promise<CicloMensal> {
    this.logger.log(`Buscando ciclo mensal atual do time: ${timeId}`);
    const agora = new Date();
    const ciclo = await this.cicloMensalModel
      .findOne({
        time: new Types.ObjectId(timeId),
        status: CicloMensalStatus.ATIVO,
        dataInicial: { $lte: agora },
        dataFinal: { $gte: agora },
      })
      .populate('mensalistas.jogador')
      .exec();
    if (!ciclo) {
      this.logger.warn(
        `Nenhum ciclo mensal ativo encontrado | time: ${timeId}`,
      );
      throw new NotFoundException('Nenhum ciclo mensal ativo');
    }
    await this.verificarFechamentoLazy(ciclo);
    this.logger.log(`Ciclo atual encontrado | id: ${ciclo['_id']}`);
    return ciclo;
  }

  async atualizar(
    timeId: string,
    id: string,
    atualizarCicloMensalDto: AtualizarCicloMensalDto,
  ): Promise<CicloMensal> {
    this.logger.log(`Atualizando ciclo mensal | id: ${id} | time: ${timeId}`);

    const dadosAtualizar: any = {};

    if (atualizarCicloMensalDto.valorMensalidade !== undefined) {
      dadosAtualizar.valorMensalidade =
        atualizarCicloMensalDto.valorMensalidade;
    }
    if (atualizarCicloMensalDto.valorDiaria !== undefined) {
      dadosAtualizar.valorDiaria = atualizarCicloMensalDto.valorDiaria;
    }
    if (atualizarCicloMensalDto.mensalistas !== undefined) {
      dadosAtualizar.mensalistas = atualizarCicloMensalDto.mensalistas.map(
        (id) => ({
          jogador: new Types.ObjectId(id),
          pago: false,
        }),
      );
    }

    const ciclo = await this.cicloMensalModel
      .findOneAndUpdate(
        { _id: id, time: new Types.ObjectId(timeId) },
        dadosAtualizar,
        { new: true },
      )
      .populate('mensalistas.jogador')
      .exec();
    if (!ciclo) {
      this.logger.warn(
        `Ciclo mensal nao encontrado para atualizar | id: ${id}`,
      );
      throw new NotFoundException('Ciclo mensal não encontrado');
    }
    return ciclo;
  }

  async marcarPagamentoMensalista(
    timeId: string,
    id: string,
    jogadorId: string,
    pago: boolean,
  ): Promise<CicloMensal> {
    this.logger.log(
      `Marcando pagamento mensalista | ciclo: ${id} | jogador: ${jogadorId} | pago: ${pago}`,
    );

    const resultado = await this.cicloMensalModel
      .findOneAndUpdate(
        {
          _id: id,
          time: new Types.ObjectId(timeId),
          'mensalistas.jogador': new Types.ObjectId(jogadorId),
        },
        { $set: { 'mensalistas.$.pago': pago } },
        { new: true },
      )
      .populate('mensalistas.jogador')
      .exec();

    if (!resultado) {
      throw new NotFoundException('Ciclo mensal ou mensalista não encontrado');
    }

    return resultado;
  }

  async remover(timeId: string, id: string): Promise<CicloMensal> {
    this.logger.log(`Removendo ciclo mensal | id: ${id} | time: ${timeId}`);
    const ciclo = await this.cicloMensalModel
      .findOneAndDelete({ _id: id, time: new Types.ObjectId(timeId) })
      .exec();
    if (!ciclo) {
      this.logger.warn(`Ciclo mensal nao encontrado para remover | id: ${id}`);
      throw new NotFoundException('Ciclo mensal não encontrado');
    }
    await this.partidaModel
      .deleteMany({
        cicloMensal: new Types.ObjectId(id),
        time: new Types.ObjectId(timeId),
      })
      .exec();
    this.logger.log(`Ciclo mensal removido com partidas | id: ${id}`);
    return ciclo;
  }
}
