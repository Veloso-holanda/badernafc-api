import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TimesController } from './times.controller.js';
import { TimesService } from './times.service.js';
import { MembrosService } from './membros.service.js';
import { Time, TimeSchema } from './schemas/time.schema.js';
import { Membro, MembroSchema } from './schemas/membro.schema.js';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema.js';
import {
  ConfiguracoesGerais,
  ConfiguracoesGeraisSchema,
} from '../configuracoes-gerais/schemas/configuracoes-gerais.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Time.name, schema: TimeSchema },
      { name: Membro.name, schema: MembroSchema },
      { name: Usuario.name, schema: UsuarioSchema },
      { name: ConfiguracoesGerais.name, schema: ConfiguracoesGeraisSchema },
    ]),
  ],
  controllers: [TimesController],
  providers: [TimesService, MembrosService],
  exports: [TimesService, MembrosService],
})
export class TimesModule {}
