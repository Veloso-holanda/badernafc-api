import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ConfiguracoesGeraisDocument = HydratedDocument<ConfiguracoesGerais>;

@Schema({ timestamps: true })
export class ConfiguracoesGerais {
  @Prop({ type: Types.ObjectId, ref: 'Time', required: true })
  time: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  valorCicloMensal: number;

  @Prop({ required: true, min: 0 })
  diaria: number;

  @Prop({ required: true, min: 0 })
  valorMensalista: number;

  @Prop({ required: true, min: 0, max: 6 })
  diaFutebol: number;

  @Prop({ required: true })
  horaFutebol: string;

  @Prop({ required: true, min: 1, default: 5 })
  jogadoresPorTime: number;

  @Prop({ required: true, min: 2, default: 4 })
  quantidadeTimes: number;

  @Prop({ required: true, min: 1, default: 48 })
  antecedenciaAberturaLista: number;

  @Prop({ required: true, min: 1, default: 6 })
  tempoLimiteMensalistas: number;
}

export const ConfiguracoesGeraisSchema =
  SchemaFactory.createForClass(ConfiguracoesGerais);

ConfiguracoesGeraisSchema.index({ time: 1 }, { unique: true });
