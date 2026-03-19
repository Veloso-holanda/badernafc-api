import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsMongoId,
} from 'class-validator';

export class CriarCicloMensalDto {
  @IsDateString()
  @IsNotEmpty()
  dataInicial: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  mensalistas?: string[];
}
