import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MembroDocument = HydratedDocument<Membro>;

export enum MembroPapel {
  ADMIN = 'admin',
  MEMBRO = 'membro',
}

@Schema({ timestamps: true })
export class Membro {
  @Prop({ type: Types.ObjectId, ref: 'Time', required: true })
  time: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Jogador', default: null })
  jogador: Types.ObjectId;

  @Prop({ type: String, enum: MembroPapel, default: MembroPapel.MEMBRO })
  papel: MembroPapel;

  @Prop({ default: true })
  ativo: boolean;
}

export const MembroSchema = SchemaFactory.createForClass(Membro);

MembroSchema.index({ time: 1, usuario: 1 }, { unique: true });
