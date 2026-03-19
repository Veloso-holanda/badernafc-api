import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinanceiroController } from './financeiro.controller';
import { FinanceiroService } from './financeiro.service';
import { Despesa, DespesaSchema } from './schemas/despesa.schema';
import {
  CicloMensal,
  CicloMensalSchema,
} from '../ciclo-mensal/schemas/ciclo-mensal.schema';
import { Partida, PartidaSchema } from '../partidas/schemas/partida.schema';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema';
import { ConfiguracoesGeraisModule } from '../configuracoes-gerais/configuracoes-gerais.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Despesa.name, schema: DespesaSchema },
      { name: CicloMensal.name, schema: CicloMensalSchema },
      { name: Partida.name, schema: PartidaSchema },
      { name: Usuario.name, schema: UsuarioSchema },
    ]),
    ConfiguracoesGeraisModule,
  ],
  controllers: [FinanceiroController],
  providers: [FinanceiroService],
})
export class FinanceiroModule {}
