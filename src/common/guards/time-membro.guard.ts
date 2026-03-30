import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Membro, MembroDocument } from '../../times/schemas/membro.schema.js';
import {
  Usuario,
  UsuarioDocument,
} from '../../usuarios/schemas/usuario.schema.js';

@Injectable()
export class TimeMembroGuard implements CanActivate {
  constructor(
    @InjectModel(Membro.name) private membroModel: Model<MembroDocument>,
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const firebaseUid = request.user?.uid;
    const timeId = request.params?.timeId;

    if (!firebaseUid) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (!timeId) {
      throw new ForbiddenException('Time não especificado');
    }

    const usuario = await this.usuarioModel.findOne({ firebaseUid }).exec();
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const membro = await this.membroModel
      .findOne({
        time: new Types.ObjectId(timeId),
        usuario: usuario._id,
        ativo: true,
      })
      .exec();

    if (!membro) {
      throw new ForbiddenException('Você não é membro deste time');
    }

    request.membro = membro;
    request.usuario = usuario;

    return true;
  }
}
