import { IsBoolean, IsMongoId, IsNotEmpty } from 'class-validator';

export class PagamentoMensalistaDto {
  @IsMongoId()
  @IsNotEmpty()
  jogadorId: string;

  @IsBoolean()
  @IsNotEmpty()
  pago: boolean;
}
