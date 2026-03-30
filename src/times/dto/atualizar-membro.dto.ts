import { IsEnum, IsNotEmpty } from 'class-validator';
import { MembroPapel } from '../schemas/membro.schema.js';

export class AtualizarMembroDto {
  @IsEnum(MembroPapel)
  @IsNotEmpty()
  papel: MembroPapel;
}
