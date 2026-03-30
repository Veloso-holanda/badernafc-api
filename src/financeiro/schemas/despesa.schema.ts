import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DespesaDocument = HydratedDocument<Despesa>;

@Schema({ timestamps: true })
export class Despesa {
  @Prop({ type: Types.ObjectId, ref: 'Time', required: true, index: true })
  time: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CicloMensal', required: true })
  cicloMensal: Types.ObjectId;

  @Prop({ required: true })
  descricao: string;

  @Prop({ required: true, min: 0 })
  valor: number;

  @Prop({ default: () => new Date() })
  data: Date;
}

export const DespesaSchema = SchemaFactory.createForClass(Despesa);
