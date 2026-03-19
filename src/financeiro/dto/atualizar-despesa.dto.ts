import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class AtualizarDespesaDto {
  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  valor?: number;

  @IsDateString()
  @IsOptional()
  data?: string;
}
