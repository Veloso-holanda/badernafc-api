import {
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  Max,
} from 'class-validator';

export class AtualizarConfiguracoesGeraisDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  valorCicloMensal?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  diaria?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  valorMensalista?: number;

  @IsNumber()
  @Min(0)
  @Max(6)
  @IsOptional()
  diaFutebol?: number;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'horaFutebol deve estar no formato HH:MM',
  })
  @IsOptional()
  horaFutebol?: string;
}
