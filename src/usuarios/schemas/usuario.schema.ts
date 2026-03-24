import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UsuarioDocument = HydratedDocument<Usuario>;

export enum UsuarioPerfil {
  ADMIN = 'admin',
  USUARIO = 'usuario',
}

@Schema({ timestamps: true })
export class Usuario {
  @Prop({ required: true, unique: true })
  firebaseUid: string;

  @Prop({ required: true })
  nome: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  fotoUrl: string;

  @Prop()
  telefone: string;

  @Prop({ type: String, enum: UsuarioPerfil, default: UsuarioPerfil.USUARIO })
  perfil: UsuarioPerfil;

  @Prop({ type: Types.ObjectId, ref: 'Jogador', default: null })
  jogador: Types.ObjectId;

  @Prop({ default: true })
  ativo: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
