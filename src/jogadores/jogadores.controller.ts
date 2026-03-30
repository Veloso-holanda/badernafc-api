import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JogadoresService } from './jogadores.service';
import { CriarJogadorDto } from './dto/criar-jogador.dto';
import { AtualizarJogadorDto } from './dto/atualizar-jogador.dto';
import { VincularJogadorDto } from './dto/vincular-jogador.dto';
import { FirebaseAuth } from '../firebase/decorators/firebaseAuth.decorator';
import { TimeMembroGuard } from '../common/guards/time-membro.guard';
import { AdminTimeGuard } from '../common/guards/admin-time.guard';

@Controller('times/:timeId/jogadores')
@UseGuards(TimeMembroGuard)
export class JogadoresController {
  constructor(private readonly jogadoresService: JogadoresService) {}

  @Post()
  @UseGuards(AdminTimeGuard)
  criar(
    @Param('timeId') timeId: string,
    @Body() criarJogadorDto: CriarJogadorDto,
  ) {
    return this.jogadoresService.criar(timeId, criarJogadorDto);
  }

  @Get()
  buscarTodos(@Param('timeId') timeId: string) {
    return this.jogadoresService.buscarTodos(timeId);
  }

  @Get(':id')
  buscarPorId(@Param('timeId') timeId: string, @Param('id') id: string) {
    return this.jogadoresService.buscarPorId(timeId, id);
  }

  @Put(':id')
  @UseGuards(AdminTimeGuard)
  atualizar(
    @Param('timeId') timeId: string,
    @Param('id') id: string,
    @Body() atualizarJogadorDto: AtualizarJogadorDto,
  ) {
    return this.jogadoresService.atualizar(timeId, id, atualizarJogadorDto);
  }

  @Delete(':id')
  @UseGuards(AdminTimeGuard)
  remover(@Param('timeId') timeId: string, @Param('id') id: string) {
    return this.jogadoresService.remover(timeId, id);
  }

  @Post('vincular')
  vincular(
    @Param('timeId') timeId: string,
    @FirebaseAuth() usuarioAuth: any,
    @Body() vincularJogadorDto: VincularJogadorDto,
  ) {
    return this.jogadoresService.vincular(
      timeId,
      usuarioAuth.uid,
      vincularJogadorDto.codigoVincular,
    );
  }
}
