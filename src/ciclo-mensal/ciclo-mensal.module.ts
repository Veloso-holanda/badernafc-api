import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CicloMensalController } from './ciclo-mensal.controller';
import { CicloMensalService } from './ciclo-mensal.service';
import { CicloMensal, CicloMensalSchema } from './schemas/ciclo-mensal.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CicloMensal.name, schema: CicloMensalSchema },
    ]),
  ],
  controllers: [CicloMensalController],
  providers: [CicloMensalService],
  exports: [CicloMensalService],
})
export class CicloMensalModule {}
