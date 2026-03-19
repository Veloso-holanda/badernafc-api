import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ConfiguracoesGeraisDocument = HydratedDocument<ConfiguracoesGerais>;

@Schema({ timestamps: true })
export class ConfiguracoesGerais {
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
}

export const ConfiguracoesGeraisSchema =
  SchemaFactory.createForClass(ConfiguracoesGerais);
