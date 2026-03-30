import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type JogadorDocument = HydratedDocument<Jogador>;

@Schema({ timestamps: true })
export class Jogador {
  @Prop({ type: Types.ObjectId, ref: 'Time', required: true, index: true })
  time: Types.ObjectId;

  @Prop({ required: true })
  nome: string;

  @Prop()
  apelido: string;

  @Prop({ required: true, min: 1, max: 5 })
  nivel: number;

  @Prop({ required: true })
  codigoVincular: string;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', default: null })
  usuario: Types.ObjectId;

  @Prop()
  email: string;

  @Prop()
  telefone: string;

  @Prop({ default: false })
  vinculado: boolean;

  @Prop({ default: '' })
  avatarUrl: string;

  @Prop({ default: false })
  goleiro: boolean;
}

export const JogadorSchema = SchemaFactory.createForClass(Jogador);

JogadorSchema.index({ time: 1, codigoVincular: 1 }, { unique: true });
