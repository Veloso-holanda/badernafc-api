import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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

  @Prop()
  apelido: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  fotoUrl: string;

  @Prop()
  telefone: string;

  @Prop({ type: String, enum: UsuarioPerfil, default: UsuarioPerfil.USUARIO })
  perfil: UsuarioPerfil;

  @Prop({ default: true })
  ativo: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
