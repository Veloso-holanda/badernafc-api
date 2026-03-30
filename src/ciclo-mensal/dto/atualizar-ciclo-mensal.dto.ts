import { IsOptional, IsArray, IsMongoId, IsNumber, Min } from 'class-validator';

export class AtualizarCicloMensalDto {
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  mensalistas?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  valorMensalidade?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  valorDiaria?: number;
}
