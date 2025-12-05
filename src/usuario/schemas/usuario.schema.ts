import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UsuarioDocument = Usuario & Document;

@Schema()
export class Usuario {
    @Prop({required: true, enum:['usuario', 'admin']})
    tipo: string;

    @Prop({ required: true })
    nome: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop()
    foto?: string;

    @Prop({ required: true , default: true})
    status_ativo: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);