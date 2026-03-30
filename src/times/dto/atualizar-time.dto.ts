import { IsOptional, IsString } from 'class-validator';

export class AtualizarTimeDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}
