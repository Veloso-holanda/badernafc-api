import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { UsuarioPerfil } from '../schemas/usuario.schema';

export class AtualizarUsuarioDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  fotoUrl?: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsEnum(UsuarioPerfil)
  @IsOptional()
  perfil?: UsuarioPerfil;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
