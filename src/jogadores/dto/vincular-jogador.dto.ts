import { IsNotEmpty, IsString } from 'class-validator';

export class VincularJogadorDto {
  @IsString()
  @IsNotEmpty()
  codigoVincular: string;
}
