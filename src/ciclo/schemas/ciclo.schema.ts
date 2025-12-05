import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CicloDocument = Ciclo & Document;

@Schema({ timestamps: {createdAt: 'criado_em'}})
export class Ciclo {
    @Prop({required: true})
    nome: string;

    @Prop({required: true})
    dataInicio: Date;

    @Prop({required: true})
    dataFim: Date;

    @Prop({required: true})
    quantidadePartidas: number;

    @Prop({required: true, min: 0})
    valorCampo: number;

    @Prop({default: 20})
    quantidadeJogadores: number;

    @Prop()
}