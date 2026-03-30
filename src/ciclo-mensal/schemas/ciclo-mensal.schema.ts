import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CicloMensalDocument = HydratedDocument<CicloMensal>;

export enum CicloMensalStatus {
  ATIVO = 'ativo',
  FECHADO = 'fechado',
}

@Schema({ _id: false })
export class MensalistaCiclo {
  @Prop({ type: Types.ObjectId, ref: 'Jogador', required: true })
  jogador: Types.ObjectId;

  @Prop({ default: false })
  pago: boolean;
}

export const MensalistaCicloSchema =
  SchemaFactory.createForClass(MensalistaCiclo);

@Schema({ timestamps: true })
export class CicloMensal {
  @Prop({ type: Types.ObjectId, ref: 'Time', required: true, index: true })
  time: Types.ObjectId;

  @Prop({ required: true })
  dataInicial: Date;

  @Prop({ required: true })
  dataFinal: Date;

  @Prop({ required: true })
  quantidadePartidas: number;

  @Prop({
    type: String,
    enum: CicloMensalStatus,
    default: CicloMensalStatus.ATIVO,
  })
  status: CicloMensalStatus;

  @Prop({ required: true, min: 0 })
  valorMensalidade: number;

  @Prop({ required: true, min: 0 })
  valorDiaria: number;

  @Prop({ type: [MensalistaCicloSchema], default: [] })
  mensalistas: MensalistaCiclo[];
}

export const CicloMensalSchema = SchemaFactory.createForClass(CicloMensal);
