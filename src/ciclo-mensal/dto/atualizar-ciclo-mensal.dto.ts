import {
  IsNumber,
  IsOptional,
  IsArray,
  IsMongoId,
  Min,
} from 'class-validator';

export class AtualizarCicloMensalDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  valorMensal?: number;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  mensalistas?: string[];
}
