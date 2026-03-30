import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CriarTimeDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}
