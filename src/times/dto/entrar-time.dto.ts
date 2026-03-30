import { IsNotEmpty, IsString } from 'class-validator';

export class EntrarTimeDto {
  @IsString()
  @IsNotEmpty()
  codigoConvite: string;
}
