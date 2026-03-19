import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { FirebaseAuth } from '../firebase/decorators/firebaseAuth.decorator';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  criar(
    @FirebaseAuth() usuarioAuth: any,
    @Body() criarUsuarioDto: CriarUsuarioDto,
  ) {
    return this.usuariosService.criar(usuarioAuth.uid, criarUsuarioDto);
  }

  @Get()
  buscarTodos() {
    return this.usuariosService.buscarTodos();
  }

  @Get('eu')
  buscarEu(@FirebaseAuth() usuarioAuth: any) {
    return this.usuariosService.buscarPorFirebaseUid(usuarioAuth.uid);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.usuariosService.buscarPorId(id);
  }

  @Put('eu')
  atualizar(
    @FirebaseAuth() usuarioAuth: any,
    @Body() atualizarUsuarioDto: AtualizarUsuarioDto,
  ) {
    return this.usuariosService.atualizar(usuarioAuth.uid, atualizarUsuarioDto);
  }

  @Delete('eu')
  remover(@FirebaseAuth() usuarioAuth: any) {
    return this.usuariosService.remover(usuarioAuth.uid);
  }
}
