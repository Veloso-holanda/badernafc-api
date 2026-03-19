import {
  Injectable,
  BadRequestException,
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

@Injectable()
export class PartidasService {
  constructor(
    @InjectModel(Partida.name) private partidaModel: Model<PartidaDocument>,
    private readonly cicloMensalService: CicloMensalService,
    private readonly jogadoresService: JogadoresService,
  ) {}

  async buscarTodos(): Promise<Partida[]> {
    return this.partidaModel
      .find()
      .populate('cicloMensal')
      .populate('jogadores.jogador')
      .populate('listaEspera')
      .exec();
  }

  async buscarPorId(id: string): Promise<Partida> {
    const partida = await this.partidaModel
      .findById(id)
      .populate('cicloMensal')
      .populate('jogadores.jogador')
      .populate('listaEspera')
      .exec();
    if (!partida) {
      throw new NotFoundException('Partida não encontrada');
    }
    return partida;
  }

  async buscarPorCiclo(cicloMensalId: string): Promise<Partida[]> {
    return this.partidaModel
      .find({ cicloMensal: new Types.ObjectId(cicloMensalId) })
      .populate('jogadores.jogador')
      .populate('listaEspera')
      .exec();
  }

  async confirmarPresenca(
    partidaId: string,
    jogadorId: string,
  ): Promise<Partida> {
    const partida = await this.buscarPorId(partidaId);
    const agora = new Date();

    // Verifica se a lista ja esta aberta
    if (agora < new Date(partida.aberturaLista)) {
      throw new BadRequestException(
        'Lista ainda não está aberta para confirmação',
      );
    }

    // Verifica se a lista ja fechou
    if (agora >= new Date(partida.fechamentoLista)) {
      throw new BadRequestException('Lista já está fechada');
    }

    if (
      partida.status === PartidaStatus.FECHADA ||
      partida.status === PartidaStatus.SORTEADA ||
      partida.status === PartidaStatus.FINALIZADA
    ) {
      throw new BadRequestException('Partida não está aberta para confirmação');
    }

    // Se a partida ainda esta aguardando mas ja passou da abertura, muda pra aberta
    if (partida.status === PartidaStatus.AGUARDANDO) {
      await this.partidaModel.findByIdAndUpdate(partidaId, {
        status: PartidaStatus.ABERTA,
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

    const jogador = await this.jogadoresService.buscarPorId(jogadorId);

    const ciclo = await this.cicloMensalService.buscarPorId(
      partida.cicloMensal['_id']?.toString() || partida.cicloMensal.toString(),
    );

    const ehMensalista = ciclo.mensalistas.some(
      (id) => id.toString() === jogadorId,
    );

    // Antes das 18h no dia da partida, so mensalistas podem confirmar
    // Diaristas vao pra lista de espera
    const ehDiaPartida =
      agora.toDateString() === new Date(partida.data).toDateString();
    if (ehDiaPartida && agora.getHours() < 18 && !ehMensalista) {
      await this.partidaModel.findByIdAndUpdate(partidaId, {
        $push: { listaEspera: new Types.ObjectId(jogadorId) },
      });
      return this.buscarPorId(partidaId);
    }

    // Lista cheia: diarista vai pra espera, mensalista erro
    if (partida.jogadores.length >= partida.limiteJogadores) {
      if (!ehMensalista) {
        await this.partidaModel.findByIdAndUpdate(partidaId, {
          $push: { listaEspera: new Types.ObjectId(jogadorId) },
        });
        return this.buscarPorId(partidaId);
      }
      throw new BadRequestException('Lista de jogadores cheia');
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

    return this.buscarPorId(partidaId);
  }

  async promoverDaListaEspera(
    partidaId: string,
    jogadorId: string,
  ): Promise<Partida> {
    const partida = await this.buscarPorId(partidaId);

    if (partida.jogadores.length >= partida.limiteJogadores) {
      throw new BadRequestException('Lista de jogadores cheia');
    }

    const naEspera = partida.listaEspera.some(
      (id) => id.toString() === jogadorId,
    );
    if (!naEspera) {
      throw new BadRequestException('Jogador não está na lista de espera');
    }

    const jogador = await this.jogadoresService.buscarPorId(jogadorId);

    await this.partidaModel.findByIdAndUpdate(partidaId, {
      $pull: { listaEspera: new Types.ObjectId(jogadorId) },
      $push: {
        jogadores: {
          jogador: new Types.ObjectId(jogadorId),
          nota: jogador.nivel,
          mensalista: false,
          confirmadoEm: new Date(),
        },
      },
    });

    return this.buscarPorId(partidaId);
  }

  async removerJogador(partidaId: string, jogadorId: string): Promise<Partida> {
    await this.partidaModel.findByIdAndUpdate(partidaId, {
      $pull: {
        jogadores: { jogador: new Types.ObjectId(jogadorId) },
        listaEspera: new Types.ObjectId(jogadorId),
      },
    });
    return this.buscarPorId(partidaId);
  }

  async atualizarNota(
    partidaId: string,
    jogadorId: string,
    nota: number,
  ): Promise<Partida> {
    const resultado = await this.partidaModel.findOneAndUpdate(
      {
        _id: partidaId,
        'jogadores.jogador': new Types.ObjectId(jogadorId),
      },
      { $set: { 'jogadores.$.nota': nota } },
      { new: true },
    );

    if (!resultado) {
      throw new NotFoundException('Jogador não encontrado nesta partida');
    }

    return this.buscarPorId(partidaId);
  }

  async fecharLista(partidaId: string): Promise<Partida> {
    const partida = await this.partidaModel
      .findByIdAndUpdate(
        partidaId,
        { status: PartidaStatus.FECHADA },
        { new: true },
      )
      .exec();
    if (!partida) {
      throw new NotFoundException('Partida não encontrada');
    }
    return this.buscarPorId(partidaId);
  }

  async marcarPagamentoDiarista(
    partidaId: string,
    jogadorId: string,
    pago: boolean,
  ): Promise<Partida> {
    const partida = await this.buscarPorId(partidaId);

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
        'jogadores.jogador': new Types.ObjectId(jogadorId),
      },
      { $set: { 'jogadores.$.pago': pago } },
    );

    return this.buscarPorId(partidaId);
  }

  async remover(id: string): Promise<Partida> {
    const partida = await this.partidaModel.findByIdAndDelete(id).exec();
    if (!partida) {
      throw new NotFoundException('Partida não encontrada');
    }
    return partida;
  }
}
