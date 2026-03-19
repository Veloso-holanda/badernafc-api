import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Usuario,
  UsuarioDocument,
  UsuarioPerfil,
} from '../../usuarios/schemas/usuario.schema';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const firebaseUid = request.user?.uid;

    if (!firebaseUid) {
      throw new ForbiddenException('Acesso restrito a administradores');
    }

    const usuario = await this.usuarioModel.findOne({ firebaseUid }).exec();

    if (!usuario || usuario.perfil !== UsuarioPerfil.ADMIN) {
      throw new ForbiddenException('Acesso restrito a administradores');
    }

    return true;
  }
}
