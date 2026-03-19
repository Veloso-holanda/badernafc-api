import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CicloMensalDocument = HydratedDocument<CicloMensal>;

@Schema({ timestamps: true })
export class CicloMensal {
  @Prop({ required: true })
  dataInicial: Date;

  @Prop({ required: true })
  dataFinal: Date;

  @Prop({ required: true })
  quantidadePartidas: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Jogador' }], default: [] })
  mensalistas: Types.ObjectId[];
}

export const CicloMensalSchema = SchemaFactory.createForClass(CicloMensal);
