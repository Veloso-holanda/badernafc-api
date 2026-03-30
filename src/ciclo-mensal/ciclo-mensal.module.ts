import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CicloMensalController } from './ciclo-mensal.controller';
import { CicloMensalService } from './ciclo-mensal.service';
import { CicloMensal, CicloMensalSchema } from './schemas/ciclo-mensal.schema';
import { Partida, PartidaSchema } from '../partidas/schemas/partida.schema';
import { ConfiguracoesGeraisModule } from '../configuracoes-gerais/configuracoes-gerais.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CicloMensal.name, schema: CicloMensalSchema },
      { name: Partida.name, schema: PartidaSchema },
    ]),
    ConfiguracoesGeraisModule,
    CommonModule,
  ],
  controllers: [CicloMensalController],
  providers: [CicloMensalService],
  exports: [CicloMensalService],
})
export class CicloMensalModule {}
