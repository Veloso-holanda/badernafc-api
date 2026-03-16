import { IsInt, IsMongoId, IsNotEmpty, Max, Min } from 'class-validator';

export class AtualizarNotaDto {
  @IsMongoId()
  @IsNotEmpty()
  jogadorId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  nota: number;
}
