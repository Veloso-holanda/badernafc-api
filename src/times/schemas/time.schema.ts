import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TimeDocument = HydratedDocument<Time>;

@Schema({ timestamps: true })
export class Time {
  @Prop({ required: true })
  nome: string;

  @Prop()
  descricao: string;

  @Prop()
  logoUrl: string;

  @Prop({ required: true, unique: true })
  codigoConvite: string;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  criador: Types.ObjectId;

  @Prop({ default: true })
  ativo: boolean;
}

export const TimeSchema = SchemaFactory.createForClass(Time);
