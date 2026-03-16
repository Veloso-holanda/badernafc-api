import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CriarJogadorDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsOptional()
  apelido?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  nivel: number;
}
