import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PartidaDocument = HydratedDocument<Partida>;

export enum PartidaStatus {
  AGUARDANDO = 'aguardando',
  ABERTA = 'aberta',
  FECHADA = 'fechada',
  SORTEADA = 'sorteada',
  FINALIZADA = 'finalizada',
}

@Schema({ _id: false })
export class JogadorPartida {
  @Prop({ type: Types.ObjectId, ref: 'Jogador', required: true })
  jogador: Types.ObjectId;

  @Prop({ required: true })
  nota: number;

  @Prop({ required: true, default: false })
  mensalista: boolean;

  @Prop({ default: null })
  confirmadoEm: Date;

  @Prop({ required: true, default: false })
  pago: boolean;
}

export const JogadorPartidaSchema =
  SchemaFactory.createForClass(JogadorPartida);

@Schema({ timestamps: true })
export class Partida {
  @Prop({ type: Types.ObjectId, ref: 'CicloMensal', required: true })
  cicloMensal: Types.ObjectId;

  @Prop({ required: true })
  data: Date;

  @Prop({ required: true })
  horario: string;

  @Prop({
    type: String,
    enum: PartidaStatus,
    default: PartidaStatus.AGUARDANDO,
  })
  status: PartidaStatus;

  @Prop({ required: true })
  aberturaLista: Date;

  @Prop({ required: true })
  fechamentoLista: Date;

  @Prop({ type: [JogadorPartidaSchema], default: [] })
  jogadores: JogadorPartida[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Jogador' }], default: [] })
  listaEspera: Types.ObjectId[];

  @Prop({ required: true, default: 20 })
  limiteJogadores: number;
}

export const PartidaSchema = SchemaFactory.createForClass(Partida);
