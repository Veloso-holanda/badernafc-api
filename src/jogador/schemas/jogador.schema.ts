import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JogadorDocument = Jogador & Document;

@Schema({ timestamps: {createdAt: 'criado_em', updatedAt: 'atualizado_em'}})
export class Jogador {
  @Prop({ required: true, trim: true})
  nome: string;  

  @Prop()
  apelido?: string;

  @Prop()
  foto?: string;

  @Prop({required:true, enum:['jogador','goleiro']})
  posicao: string;

  @Prop({required:true, min:1, max:5})
  nivel: number;

  @Prop({required: true, enum:['ativo','inativo'], default: 'ativo'})
  status: string;
}

export const JogadorSchema = SchemaFactory.createForClass(Jogador);