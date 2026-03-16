import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { JogadoresService } from './jogadores.service';
import { CriarJogadorDto } from './dto/criar-jogador.dto';
import { AtualizarJogadorDto } from './dto/atualizar-jogador.dto';
import { VincularJogadorDto } from './dto/vincular-jogador.dto';
import { FirebaseAuth } from '../firebase/decorators/firebaseAuth.decorator';

@Controller('jogadores')
export class JogadoresController {
  constructor(private readonly jogadoresService: JogadoresService) {}

  @Post()
  criar(@Body() criarJogadorDto: CriarJogadorDto) {
    return this.jogadoresService.criar(criarJogadorDto);
  }

  @Get()
  buscarTodos() {
    return this.jogadoresService.buscarTodos();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.jogadoresService.buscarPorId(id);
  }

  @Put(':id')
  atualizar(
    @Param('id') id: string,
    @Body() atualizarJogadorDto: AtualizarJogadorDto,
  ) {
    return this.jogadoresService.atualizar(id, atualizarJogadorDto);
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.jogadoresService.remover(id);
  }

  @Post('vincular')
  vincular(
    @FirebaseAuth() usuarioAuth: any,
    @Body() vincularJogadorDto: VincularJogadorDto,
  ) {
    return this.jogadoresService.vincular(
      usuarioAuth.uid,
      vincularJogadorDto.codigoVincular,
    );
  }
}
