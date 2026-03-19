import { IsOptional, IsArray, IsMongoId } from 'class-validator';

export class AtualizarCicloMensalDto {
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  mensalistas?: string[];
}
