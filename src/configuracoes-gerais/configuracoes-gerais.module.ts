import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfiguracoesGeraisController } from './configuracoes-gerais.controller';
import { ConfiguracoesGeraisService } from './configuracoes-gerais.service';
import {
  ConfiguracoesGerais,
  ConfiguracoesGeraisSchema,
} from './schemas/configuracoes-gerais.schema';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConfiguracoesGerais.name, schema: ConfiguracoesGeraisSchema },
    ]),
    CommonModule,
  ],
  controllers: [ConfiguracoesGeraisController],
  providers: [ConfiguracoesGeraisService],
  exports: [ConfiguracoesGeraisService],
})
export class ConfiguracoesGeraisModule {}
