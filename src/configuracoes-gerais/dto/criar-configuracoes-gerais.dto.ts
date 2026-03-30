import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Min,
  Max,
} from 'class-validator';

export class CriarConfiguracoesGeraisDto {
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  valorCicloMensal: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  diaria: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  valorMensalista: number;

  @IsNumber()
  @Min(0)
  @Max(6)
  @IsNotEmpty()
  diaFutebol: number;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'horaFutebol deve estar no formato HH:MM',
  })
  @IsNotEmpty()
  horaFutebol: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  jogadoresPorTime: number;

  @IsNumber()
  @Min(2)
  @IsNotEmpty()
  quantidadeTimes: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  antecedenciaAberturaLista: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  tempoLimiteMensalistas: number;
}
