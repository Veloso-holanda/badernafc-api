import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfiguracoesGeraisController } from './configuracoes-gerais.controller';
import { ConfiguracoesGeraisService } from './configuracoes-gerais.service';
import {
  ConfiguracoesGerais,
  ConfiguracoesGeraisSchema,
} from './schemas/configuracoes-gerais.schema';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConfiguracoesGerais.name, schema: ConfiguracoesGeraisSchema },
      { name: Usuario.name, schema: UsuarioSchema },
    ]),
  ],
  controllers: [ConfiguracoesGeraisController],
  providers: [ConfiguracoesGeraisService],
  exports: [ConfiguracoesGeraisService],
})
export class ConfiguracoesGeraisModule {}
