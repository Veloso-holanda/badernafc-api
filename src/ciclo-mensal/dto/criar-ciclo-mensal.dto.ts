import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  IsMongoId,
  Matches,
  Min,
  Max,
} from 'class-validator';

export class CriarCicloMensalDto {
  @IsDateString()
  @IsNotEmpty()
  dataInicial: string;

  @IsNumber()
  @Min(0)
  @Max(6)
  @IsNotEmpty()
  diaSemana: number;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'horario deve estar no formato HH:MM' })
  @IsNotEmpty()
  horario: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  valorMensal: number;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  mensalistas?: string[];
}
