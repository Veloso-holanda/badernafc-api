import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CicloMensal,
  CicloMensalDocument,
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

  private calcularAberturaLista(dataPartida: Date): Date {
    const abertura = new Date(dataPartida);
    abertura.setDate(abertura.getDate() - 1);
    abertura.setHours(0, 0, 0, 0);
    return abertura;
  }

  private calcularFechamentoLista(dataPartida: Date, horario: string): Date {
    const [horas, minutos] = horario.split(':').map(Number);
    const fechamento = new Date(dataPartida);
    fechamento.setHours(horas - 1, minutos, 0, 0);
    return fechamento;
  }

  async criar(criarCicloMensalDto: CriarCicloMensalDto): Promise<CicloMensal> {
    this.logger.log(`Criando ciclo mensal | dataInicial: ${criarCicloMensalDto.dataInicial}`);
    const config = await this.configuracoesGeraisService.buscar();

    const dataInicial = new Date(criarCicloMensalDto.dataInicial);
    const dataFinal = new Date(dataInicial);
    dataFinal.setMonth(dataFinal.getMonth() + 1);

    const datasPartidas = this.calcularDatasPartidas(
      dataInicial,
      dataFinal,
      config.diaFutebol,
    );

    this.logger.log(`Partidas a gerar: ${datasPartidas.length} | diaFutebol: ${config.diaFutebol} | horario: ${config.horaFutebol}`);

    const ciclo = new this.cicloMensalModel({
      dataInicial,
      dataFinal,
      quantidadePartidas: datasPartidas.length,
      mensalistas: criarCicloMensalDto.mensalistas ?? [],
    });

    const cicloSalvo = await ciclo.save();
    this.logger.log(`Ciclo mensal criado | id: ${cicloSalvo['_id']} | mensalistas: ${ciclo.mensalistas.length}`);

    const partidas = datasPartidas.map((data) => ({
      cicloMensal: cicloSalvo['_id'],
      data,
      horario: config.horaFutebol,
      aberturaLista: this.calcularAberturaLista(data),
      fechamentoLista: this.calcularFechamentoLista(data, config.horaFutebol),
    }));

    await this.partidaModel.insertMany(partidas);
    this.logger.log(`${partidas.length} partidas geradas para o ciclo ${cicloSalvo['_id']}`);

    return cicloSalvo;
  }

  async buscarTodos(): Promise<CicloMensal[]> {
    this.logger.log('Buscando todos os ciclos mensais');
    return this.cicloMensalModel.find().populate('mensalistas').exec();
  }

  async buscarPorId(id: string): Promise<CicloMensal> {
    this.logger.debug(`Buscando ciclo mensal por id: ${id}`);
    const ciclo = await this.cicloMensalModel
      .findById(id)
      .populate('mensalistas')
      .exec();
    if (!ciclo) {
      this.logger.warn(`Ciclo mensal nao encontrado | id: ${id}`);
      throw new NotFoundException('Ciclo mensal não encontrado');
    }
    return ciclo;
  }

  async buscarAtual(): Promise<CicloMensal> {
    this.logger.log('Buscando ciclo mensal atual');
    const agora = new Date();
    const ciclo = await this.cicloMensalModel
      .findOne({
        dataInicial: { $lte: agora },
        dataFinal: { $gte: agora },
      })
      .populate('mensalistas')
      .exec();
    if (!ciclo) {
      this.logger.warn('Nenhum ciclo mensal ativo encontrado');
      throw new NotFoundException('Nenhum ciclo mensal ativo');
    }
    this.logger.log(`Ciclo atual encontrado | id: ${ciclo['_id']}`);
    return ciclo;
  }

  async atualizar(
    id: string,
    atualizarCicloMensalDto: AtualizarCicloMensalDto,
  ): Promise<CicloMensal> {
    this.logger.log(`Atualizando ciclo mensal | id: ${id} | campos: ${Object.keys(atualizarCicloMensalDto).join(', ')}`);
    const ciclo = await this.cicloMensalModel
      .findByIdAndUpdate(id, atualizarCicloMensalDto, { new: true })
      .populate('mensalistas')
      .exec();
    if (!ciclo) {
      this.logger.warn(`Ciclo mensal nao encontrado para atualizar | id: ${id}`);
      throw new NotFoundException('Ciclo mensal não encontrado');
    }
    return ciclo;
  }

  async remover(id: string): Promise<CicloMensal> {
    this.logger.log(`Removendo ciclo mensal | id: ${id}`);
    const ciclo = await this.cicloMensalModel.findByIdAndDelete(id).exec();
    if (!ciclo) {
      this.logger.warn(`Ciclo mensal nao encontrado para remover | id: ${id}`);
      throw new NotFoundException('Ciclo mensal não encontrado');
    }
    await this.partidaModel
      .deleteMany({ cicloMensal: new Types.ObjectId(id) })
      .exec();
    this.logger.log(`Ciclo mensal removido com partidas | id: ${id}`);
    return ciclo;
  }
}
