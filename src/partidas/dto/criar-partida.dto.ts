import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CriarPartidaDto {
  @IsMongoId()
  @IsNotEmpty()
  cicloMensal: string;
}
