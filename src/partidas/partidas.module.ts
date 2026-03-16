import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PartidasController } from './partidas.controller';
import { PartidasService } from './partidas.service';
import { Partida, PartidaSchema } from './schemas/partida.schema';
import { CicloMensalModule } from '../ciclo-mensal/ciclo-mensal.module';
import { JogadoresModule } from '../jogadores/jogadores.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Partida.name, schema: PartidaSchema }]),
    CicloMensalModule,
    JogadoresModule,
  ],
  controllers: [PartidasController],
  providers: [PartidasService],
  exports: [PartidasService],
})
export class PartidasModule {}
