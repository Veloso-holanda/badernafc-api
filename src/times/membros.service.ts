import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Membro,
  MembroDocument,
  MembroPapel,
} from './schemas/membro.schema.js';

@Injectable()
export class MembrosService {
  private readonly logger = new Logger(MembrosService.name);

  constructor(
    @InjectModel(Membro.name) private membroModel: Model<MembroDocument>,
  ) {}

  async buscarPorTime(timeId: string): Promise<Membro[]> {
    this.logger.debug(`Buscando membros do time | timeId: ${timeId}`);
    return this.membroModel
      .find({ time: new Types.ObjectId(timeId), ativo: true })
      .populate('usuario')
      .populate('jogador')
      .exec();
  }

  async buscarMembroPorUsuarioETime(
    usuarioId: string,
    timeId: string,
  ): Promise<Membro | null> {
    return this.membroModel
      .findOne({
        time: new Types.ObjectId(timeId),
        usuario: new Types.ObjectId(usuarioId),
        ativo: true,
      })
      .exec();
  }

  async atualizarPapel(
    timeId: string,
    membroId: string,
    papel: MembroPapel,
  ): Promise<Membro> {
    this.logger.log(
      `Atualizando papel do membro | membroId: ${membroId} | papel: ${papel}`,
    );
    const membro = await this.membroModel
      .findOne({
        _id: membroId,
        time: new Types.ObjectId(timeId),
        ativo: true,
      })
      .exec();

    if (!membro) {
      throw new NotFoundException('Membro não encontrado');
    }

    membro.papel = papel;
    return membro.save();
  }

  async remover(timeId: string, membroId: string): Promise<Membro> {
    this.logger.log(
      `Removendo membro | membroId: ${membroId} | timeId: ${timeId}`,
    );
    const membro = await this.membroModel
      .findOne({
        _id: membroId,
        time: new Types.ObjectId(timeId),
        ativo: true,
      })
      .exec();

    if (!membro) {
      throw new NotFoundException('Membro não encontrado');
    }

    membro.ativo = false;
    return membro.save();
  }
}
