import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PartidaDocument = HydratedDocument<Partida>;

export enum PartidaStatus {
  AGENDADA = 'agendada',
  ABERTA = 'aberta',
  ABERTA_DIARISTAS = 'aberta_diaristas',
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

@Schema({ _id: false })
export class TimeSorteado {
  @Prop({ required: true })
  nome: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Jogador' }], required: true })
  jogadores: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Jogador', default: null })
  goleiro: Types.ObjectId;

  @Prop({ required: true })
  somaEstrelas: number;
}

export const TimeSorteadoSchema = SchemaFactory.createForClass(TimeSorteado);

@Schema({ timestamps: true })
export class Partida {
  @Prop({ type: Types.ObjectId, ref: 'Time', required: true, index: true })
  time: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CicloMensal', required: true })
  cicloMensal: Types.ObjectId;

  @Prop({ required: true })
  data: Date;

  @Prop({ required: true })
  horario: string;

  @Prop({
    type: String,
    enum: PartidaStatus,
    default: PartidaStatus.AGENDADA,
  })
  status: PartidaStatus;

  @Prop({ required: true })
  aberturaLista: Date;

  @Prop({ required: true })
  fechamentoMensalistas: Date;

  @Prop({ type: [JogadorPartidaSchema], default: [] })
  jogadores: JogadorPartida[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Jogador' }], default: [] })
  listaEspera: Types.ObjectId[];

  @Prop({ required: true, default: 20 })
  limiteJogadores: number;

  @Prop({ type: [TimeSorteadoSchema], default: [] })
  timesSorteados: TimeSorteado[];
}

export const PartidaSchema = SchemaFactory.createForClass(Partida);
