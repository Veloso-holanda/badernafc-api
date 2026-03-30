import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Partida,
  PartidaDocument,
  PartidaStatus,
} from './schemas/partida.schema';
import { CicloMensalService } from '../ciclo-mensal/ciclo-mensal.service';
import { JogadoresService } from '../jogadores/jogadores.service';
import { ConfiguracoesGeraisService } from '../configuracoes-gerais/configuracoes-gerais.service';

@Injectable()
export class PartidasService {
  private readonly logger = new Logger(PartidasService.name);

  constructor(
    @InjectModel(Partida.name) private partidaModel: Model<PartidaDocument>,
    private readonly cicloMensalService: CicloMensalService,
    private readonly jogadoresService: JogadoresService,
    private readonly configuracoesGeraisService: ConfiguracoesGeraisService,
  ) {}

  async buscarTodos(timeId: string): Promise<Partida[]> {
    this.logger.log(`Buscando partidas do time: ${timeId}`);
    return this.partidaModel
      .find({ time: new Types.ObjectId(timeId) })
      .populate('cicloMensal')
      .populate('jogadores.jogador')
      .populate('listaEspera')
      .populate('timesSorteados.jogadores')
      .populate('timesSorteados.goleiro')
      .exec();
  }

  async buscarPorId(timeId: string, id: string): Promise<Partida> {
    this.logger.debug(`Buscando partida | id: ${id} | time: ${timeId}`);
    const partida = await this.partidaModel
      .findOne({ _id: id, time: new Types.ObjectId(timeId) })
      .populate('cicloMensal')
      .populate('jogadores.jogador')
      .populate('listaEspera')
      .populate('timesSorteados.jogadores')
      .populate('timesSorteados.goleiro')
      .exec();
    if (!partida) {
      this.logger.warn(`Partida nao encontrada | id: ${id}`);
      throw new NotFoundException('Partida não encontrada');
    }
    return partida;
  }

  async buscarPorCiclo(
    timeId: string,
    cicloMensalId: string,
  ): Promise<Partida[]> {
    this.logger.log(
      `Buscando partidas do ciclo: ${cicloMensalId} | time: ${timeId}`,
    );
    return this.partidaModel
      .find({
        time: new Types.ObjectId(timeId),
        cicloMensal: new Types.ObjectId(cicloMensalId),
      })
      .populate('jogadores.jogador')
      .populate('listaEspera')
      .populate('timesSorteados.jogadores')
      .populate('timesSorteados.goleiro')
      .exec();
  }

  private atualizarStatusAutomatico(partida: any, agora: Date): PartidaStatus {
    if (
      partida.status === PartidaStatus.AGENDADA &&
      agora >= new Date(partida.aberturaLista)
    ) {
      return PartidaStatus.ABERTA;
    }
    if (
      partida.status === PartidaStatus.ABERTA &&
      agora >= new Date(partida.fechamentoMensalistas)
    ) {
      return PartidaStatus.ABERTA_DIARISTAS;
    }
    return partida.status;
  }

  async confirmarPresenca(
    timeId: string,
    partidaId: string,
    jogadorId: string,
  ): Promise<Partida> {
    this.logger.log(
      `Confirmando presenca | partida: ${partidaId} | jogador: ${jogadorId} | time: ${timeId}`,
    );
    const partida = await this.buscarPorId(timeId, partidaId);
    const agora = new Date();

    if (agora < new Date(partida.aberturaLista)) {
      throw new BadRequestException(
        'Lista ainda não está aberta para confirmação',
      );
    }

    if (
      partida.status === PartidaStatus.SORTEADA ||
      partida.status === PartidaStatus.FINALIZADA
    ) {
      throw new BadRequestException('Partida não está aberta para confirmação');
    }

    const novoStatus = this.atualizarStatusAutomatico(partida, agora);
    if (novoStatus !== partida.status) {
      await this.partidaModel.findByIdAndUpdate(partidaId, {
        status: novoStatus,
      });
    }

    const jaConfirmado = partida.jogadores.some(
      (j) =>
        j.jogador['_id']?.toString() === jogadorId ||
        j.jogador?.toString() === jogadorId,
    );
    if (jaConfirmado) {
      throw new BadRequestException('Jogador já confirmado nesta partida');
    }

    const jaEmEspera = partida.listaEspera.some(
      (id) => id.toString() === jogadorId,
    );
    if (jaEmEspera) {
      throw new BadRequestException('Jogador já está na lista de espera');
    }

    const jogador = await this.jogadoresService.buscarPorId(timeId, jogadorId);

    if (jogador.goleiro) {
      throw new BadRequestException(
        'Goleiros não participam da lista de presença',
      );
    }

    const ciclo = await this.cicloMensalService.buscarPorId(
      timeId,
      partida.cicloMensal['_id']?.toString() || partida.cicloMensal.toString(),
    );

    const ehMensalista = ciclo.mensalistas.some(
      (m) => m.jogador.toString() === jogadorId,
    );

    const statusAtual = novoStatus;

    // Fase ABERTA: só mensalistas confirmam, diaristas vão pra espera
    if (statusAtual === PartidaStatus.ABERTA) {
      if (!ehMensalista) {
        this.logger.log(
          `Diarista enviado para lista de espera (fase mensalistas) | jogador: ${jogadorId}`,
        );
        await this.partidaModel.findByIdAndUpdate(partidaId, {
          $push: { listaEspera: new Types.ObjectId(jogadorId) },
        });
        return this.buscarPorId(timeId, partidaId);
      }
    }

    // Fase ABERTA_DIARISTAS: mensalistas NÃO podem mais confirmar
    if (statusAtual === PartidaStatus.ABERTA_DIARISTAS) {
      if (ehMensalista) {
        throw new BadRequestException(
          'Período de confirmação para mensalistas encerrado',
        );
      }
    }

    // Lista cheia → espera
    if (partida.jogadores.length >= partida.limiteJogadores) {
      this.logger.log(
        `Lista cheia, jogador enviado para espera | jogador: ${jogadorId}`,
      );
      await this.partidaModel.findByIdAndUpdate(partidaId, {
        $push: { listaEspera: new Types.ObjectId(jogadorId) },
      });
      return this.buscarPorId(timeId, partidaId);
    }

    await this.partidaModel.findByIdAndUpdate(partidaId, {
      $push: {
        jogadores: {
          jogador: new Types.ObjectId(jogadorId),
          nota: jogador.nivel,
          mensalista: ehMensalista,
          confirmadoEm: agora,
        },
      },
    });

    this.logger.log(
      `Presenca confirmada | partida: ${partidaId} | jogador: ${jogadorId} | mensalista: ${ehMensalista}`,
    );
    return this.buscarPorId(timeId, partidaId);
  }

  async promoverDaListaEspera(
    timeId: string,
    partidaId: string,
    jogadorId: string,
  ): Promise<Partida> {
    this.logger.log(
      `Promovendo da lista de espera | partida: ${partidaId} | jogador: ${jogadorId}`,
    );
    const partida = await this.buscarPorId(timeId, partidaId);

    if (partida.jogadores.length >= partida.limiteJogadores) {
      throw new BadRequestException('Lista de jogadores cheia');
    }

    const naEspera = partida.listaEspera.some(
      (id) => id.toString() === jogadorId,
    );
    if (!naEspera) {
      throw new BadRequestException('Jogador não está na lista de espera');
    }

    const jogador = await this.jogadoresService.buscarPorId(timeId, jogadorId);

    const ciclo = await this.cicloMensalService.buscarPorId(
      timeId,
      partida.cicloMensal['_id']?.toString() || partida.cicloMensal.toString(),
    );
    const ehMensalista = ciclo.mensalistas.some(
      (m) => m.jogador.toString() === jogadorId,
    );

    await this.partidaModel.findByIdAndUpdate(partidaId, {
      $pull: { listaEspera: new Types.ObjectId(jogadorId) },
      $push: {
        jogadores: {
          jogador: new Types.ObjectId(jogadorId),
          nota: jogador.nivel,
          mensalista: ehMensalista,
          confirmadoEm: new Date(),
        },
      },
    });

    return this.buscarPorId(timeId, partidaId);
  }

  async removerJogador(
    timeId: string,
    partidaId: string,
    jogadorId: string,
  ): Promise<Partida> {
    this.logger.log(
      `Removendo jogador da partida | partida: ${partidaId} | jogador: ${jogadorId}`,
    );
    await this.partidaModel.findOneAndUpdate(
      { _id: partidaId, time: new Types.ObjectId(timeId) },
      {
        $pull: {
          jogadores: { jogador: new Types.ObjectId(jogadorId) },
          listaEspera: new Types.ObjectId(jogadorId),
        },
      },
    );
    return this.buscarPorId(timeId, partidaId);
  }

  async atualizarNota(
    timeId: string,
    partidaId: string,
    jogadorId: string,
    nota: number,
  ): Promise<Partida> {
    this.logger.log(
      `Atualizando nota | partida: ${partidaId} | jogador: ${jogadorId} | nota: ${nota}`,
    );
    const resultado = await this.partidaModel.findOneAndUpdate(
      {
        _id: partidaId,
        time: new Types.ObjectId(timeId),
        'jogadores.jogador': new Types.ObjectId(jogadorId),
      },
      { $set: { 'jogadores.$.nota': nota } },
      { new: true },
    );

    if (!resultado) {
      throw new NotFoundException('Jogador não encontrado nesta partida');
    }

    return this.buscarPorId(timeId, partidaId);
  }

  async marcarPagamentoDiarista(
    timeId: string,
    partidaId: string,
    jogadorId: string,
    pago: boolean,
  ): Promise<Partida> {
    this.logger.log(
      `Marcando pagamento diarista | partida: ${partidaId} | jogador: ${jogadorId} | pago: ${pago}`,
    );
    const partida = await this.buscarPorId(timeId, partidaId);

    const jogadorNaPartida = partida.jogadores.find(
      (j) =>
        j.jogador['_id']?.toString() === jogadorId ||
        j.jogador?.toString() === jogadorId,
    );

    if (!jogadorNaPartida) {
      throw new NotFoundException('Jogador não encontrado nesta partida');
    }

    if (jogadorNaPartida.mensalista) {
      throw new BadRequestException(
        'Jogador é mensalista, pagamento é via ciclo mensal',
      );
    }

    await this.partidaModel.findOneAndUpdate(
      {
        _id: partidaId,
        time: new Types.ObjectId(timeId),
        'jogadores.jogador': new Types.ObjectId(jogadorId),
      },
      { $set: { 'jogadores.$.pago': pago } },
    );

    return this.buscarPorId(timeId, partidaId);
  }

  async sortear(timeId: string, partidaId: string): Promise<Partida> {
    this.logger.log(
      `Sorteando times | partida: ${partidaId} | time: ${timeId}`,
    );
    const partida = await this.buscarPorId(timeId, partidaId);

    if (
      partida.status !== PartidaStatus.ABERTA &&
      partida.status !== PartidaStatus.ABERTA_DIARISTAS
    ) {
      throw new BadRequestException(
        'Partida precisa estar com lista aberta para realizar o sorteio',
      );
    }

    const config = await this.configuracoesGeraisService.buscar(timeId);
    const totalNecessario = config.jogadoresPorTime * config.quantidadeTimes;

    if (partida.jogadores.length < totalNecessario) {
      throw new BadRequestException(
        `São necessários pelo menos ${totalNecessario} jogadores para o sorteio (${config.quantidadeTimes} times de ${config.jogadoresPorTime}). Atualmente há ${partida.jogadores.length}.`,
      );
    }

    // Agrupar jogadores por nota
    const porNota: Map<number, any[]> = new Map();
    for (const jp of partida.jogadores) {
      const nota = jp.nota;
      if (!porNota.has(nota)) porNota.set(nota, []);
      porNota.get(nota)!.push(jp);
    }

    // Validar distribuição: cada nível precisa ter >= quantidadeTimes jogadores
    const niveisInsuficientes: string[] = [];
    for (let nivel = 1; nivel <= 5; nivel++) {
      const quantidade = porNota.get(nivel)?.length ?? 0;
      if (quantidade > 0 && quantidade < config.quantidadeTimes) {
        niveisInsuficientes.push(
          `Nível ${nivel}★: ${quantidade} jogador(es), precisa de pelo menos ${config.quantidadeTimes}`,
        );
      }
    }

    if (niveisInsuficientes.length > 0) {
      throw new BadRequestException(
        `Distribuição de notas não permite sorteio equilibrado. Ajuste as notas da partida antes de sortear.\n${niveisInsuficientes.join('\n')}`,
      );
    }

    // Embaralhar (Fisher-Yates)
    const embaralhar = (arr: any[]) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    // Inicializar times
    const nomesTimes = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const times: { jogadores: any[]; somaEstrelas: number }[] = [];
    for (let i = 0; i < config.quantidadeTimes; i++) {
      times.push({ jogadores: [], somaEstrelas: 0 });
    }

    // Distribuir por nível: 1 de cada nível por time
    const jogadoresUsados = new Set<string>();

    for (let nivel = 1; nivel <= 5; nivel++) {
      const jogadoresNivel = porNota.get(nivel) ?? [];
      if (jogadoresNivel.length === 0) continue;

      embaralhar(jogadoresNivel);

      for (
        let t = 0;
        t < config.quantidadeTimes && t < jogadoresNivel.length;
        t++
      ) {
        const jp = jogadoresNivel[t];
        const jogadorId =
          jp.jogador['_id']?.toString() || jp.jogador.toString();
        times[t].jogadores.push(new Types.ObjectId(jogadorId));
        times[t].somaEstrelas += nivel;
        jogadoresUsados.add(jogadorId);
      }
    }

    // Distribuir excedentes equilibrando soma de estrelas
    const excedentes = partida.jogadores.filter((jp) => {
      const jogadorId = jp.jogador['_id']?.toString() || jp.jogador.toString();
      return !jogadoresUsados.has(jogadorId);
    });

    embaralhar(excedentes);

    for (const jp of excedentes) {
      if (times.every((t) => t.jogadores.length >= config.jogadoresPorTime)) {
        break;
      }
      // Encontrar time com menor soma e que ainda tem vaga
      const timeAlvo = times
        .filter((t) => t.jogadores.length < config.jogadoresPorTime)
        .sort((a, b) => a.somaEstrelas - b.somaEstrelas)[0];

      if (timeAlvo) {
        const jogadorId =
          jp.jogador['_id']?.toString() || jp.jogador.toString();
        timeAlvo.jogadores.push(new Types.ObjectId(jogadorId));
        timeAlvo.somaEstrelas += jp.nota;
      }
    }

    const timesSorteados = times.map((t, i) => ({
      nome: `Time ${nomesTimes[i]}`,
      jogadores: t.jogadores,
      goleiro: null,
      somaEstrelas: t.somaEstrelas,
    }));

    await this.partidaModel.findByIdAndUpdate(partidaId, {
      timesSorteados,
      status: PartidaStatus.SORTEADA,
    });

    this.logger.log(
      `Sorteio realizado | partida: ${partidaId} | ${config.quantidadeTimes} times`,
    );
    return this.buscarPorId(timeId, partidaId);
  }

  async refazerSorteio(timeId: string, partidaId: string): Promise<Partida> {
    this.logger.log(`Refazendo sorteio | partida: ${partidaId}`);
    const partida = await this.buscarPorId(timeId, partidaId);

    if (partida.status !== PartidaStatus.SORTEADA) {
      throw new BadRequestException(
        'Partida precisa estar sorteada para refazer o sorteio',
      );
    }

    await this.partidaModel.findByIdAndUpdate(partidaId, {
      timesSorteados: [],
      status: PartidaStatus.ABERTA_DIARISTAS,
    });

    return this.sortear(timeId, partidaId);
  }

  async definirGoleiros(
    timeId: string,
    partidaId: string,
    goleiros: { timeIndex: number; goleiroId: string }[],
  ): Promise<Partida> {
    this.logger.log(`Definindo goleiros | partida: ${partidaId}`);
    const partida = await this.buscarPorId(timeId, partidaId);

    if (partida.status !== PartidaStatus.SORTEADA) {
      throw new BadRequestException(
        'Partida precisa estar sorteada para definir goleiros',
      );
    }

    for (const g of goleiros) {
      if (g.timeIndex < 0 || g.timeIndex >= partida.timesSorteados.length) {
        throw new BadRequestException(
          `Índice de time inválido: ${g.timeIndex}`,
        );
      }

      await this.partidaModel.findOneAndUpdate(
        {
          _id: partidaId,
          time: new Types.ObjectId(timeId),
        },
        {
          $set: {
            [`timesSorteados.${g.timeIndex}.goleiro`]: new Types.ObjectId(
              g.goleiroId,
            ),
          },
        },
      );
    }

    return this.buscarPorId(timeId, partidaId);
  }

  async finalizar(timeId: string, partidaId: string): Promise<Partida> {
    this.logger.log(`Finalizando partida | id: ${partidaId}`);
    const partida = await this.partidaModel
      .findOneAndUpdate(
        { _id: partidaId, time: new Types.ObjectId(timeId) },
        { status: PartidaStatus.FINALIZADA },
        { new: true },
      )
      .exec();
    if (!partida) {
      throw new NotFoundException('Partida não encontrada');
    }
    return this.buscarPorId(timeId, partidaId);
  }

  async remover(timeId: string, id: string): Promise<Partida> {
    this.logger.log(`Removendo partida | id: ${id} | time: ${timeId}`);
    const partida = await this.partidaModel
      .findOneAndDelete({ _id: id, time: new Types.ObjectId(timeId) })
      .exec();
    if (!partida) {
      this.logger.warn(`Partida nao encontrada para remover | id: ${id}`);
      throw new NotFoundException('Partida não encontrada');
    }
    this.logger.log(`Partida removida | id: ${id}`);
    return partida;
  }
}
