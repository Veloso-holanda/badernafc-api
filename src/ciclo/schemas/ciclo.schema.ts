import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CicloDocument = Ciclo & Document;

@Schema({ timestamps: {createdAt: 'criado_em',updatedAt: 'atualizado_em'}})
export class Ciclo {
    @Prop({required: true})
    nome: string;

    @Prop({required: true})
    dataInicio: Date;

    @Prop({required: true})
    dataFim: Date;

    @Prop({required: true, min: 1})
    quantidadePartidas: number;

    @Prop({required: true, min: 0})
    valorCampo: number;

    @Prop({default: 20, min: 1})
    quantidadeJogadores: number;

    @Prop({required: true, enum: ['aberto', 'fechado', 'encerrado']})
    status: string;

    @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Jogador' }],
    validate: {
      validator: function(array: any[]) {
        return array.length <= this.quantidadeJogadores;
      },
      message: 'Número de mensalistas excede o limite'
    },
    default: []
  })
  mensalistas: MongooseSchema.Types.ObjectId[];
}

export const CicloSchema = SchemaFactory.createForClass(Ciclo);

// Virtuals
CicloSchema.virtual('completo').get(function() {
  return this.mensalistas.length === this.quantidadeJogadores;
});

CicloSchema.virtual('valorMensalidade').get(function() {
  return this.quantidadeJogadores > 0 
    ? this.valorCampo / this.quantidadeJogadores 
    : 0;
});

CicloSchema.virtual('vagasRestantes').get(function() {
  return this.quantidadeJogadores - this.mensalistas.length;
});

CicloSchema.set('toJSON', { virtuals: true });
CicloSchema.set('toObject', { virtuals: true });