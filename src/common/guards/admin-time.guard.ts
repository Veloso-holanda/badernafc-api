import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { MembroPapel } from '../../times/schemas/membro.schema.js';

@Injectable()
export class AdminTimeGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const membro = request.membro;

    if (!membro || membro.papel !== MembroPapel.ADMIN) {
      throw new ForbiddenException('Acesso restrito a administradores do time');
    }

    return true;
  }
}
