import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CriarDespesaDto {
  @IsMongoId()
  @IsNotEmpty()
  cicloMensalId: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  valor: number;

  @IsDateString()
  @IsOptional()
  data?: string;
}
