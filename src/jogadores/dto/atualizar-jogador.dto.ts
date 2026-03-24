import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class AtualizarJogadorDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  apelido?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  nivel?: number;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
