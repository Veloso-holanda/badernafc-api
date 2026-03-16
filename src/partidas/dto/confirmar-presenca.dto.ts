import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ConfirmarPresencaDto {
  @IsMongoId()
  @IsNotEmpty()
  jogadorId: string;
}
