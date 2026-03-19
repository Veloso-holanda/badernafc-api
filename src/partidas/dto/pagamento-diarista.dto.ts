import { IsBoolean, IsMongoId, IsNotEmpty } from 'class-validator';

export class PagamentoDiaristaDto {
  @IsMongoId()
  @IsNotEmpty()
  jogadorId: string;

  @IsBoolean()
  @IsNotEmpty()
  pago: boolean;
}
