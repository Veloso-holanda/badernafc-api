import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Membro, MembroSchema } from '../times/schemas/membro.schema';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema';
import { TimeMembroGuard } from './guards/time-membro.guard';
import { AdminTimeGuard } from './guards/admin-time.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Membro.name, schema: MembroSchema },
      { name: Usuario.name, schema: UsuarioSchema },
    ]),
  ],
  providers: [TimeMembroGuard, AdminTimeGuard],
  exports: [TimeMembroGuard, AdminTimeGuard, MongooseModule],
})
export class CommonModule {}
