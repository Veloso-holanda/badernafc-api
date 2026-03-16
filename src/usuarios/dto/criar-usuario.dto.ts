import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UsuarioPerfil } from '../schemas/usuario.schema';

export class CriarUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsOptional()
  apelido?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  fotoUrl?: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsEnum(UsuarioPerfil)
  @IsOptional()
  perfil?: UsuarioPerfil;
}
