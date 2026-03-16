import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { PartidasService } from './partidas.service';
import { CriarPartidaDto } from './dto/criar-partida.dto';
import { ConfirmarPresencaDto } from './dto/confirmar-presenca.dto';
import { AtualizarNotaDto } from './dto/atualizar-nota.dto';

@Controller('partidas')
export class PartidasController {
  constructor(private readonly partidasService: PartidasService) {}

  @Post()
  criar(@Body() criarPartidaDto: CriarPartidaDto) {
    return this.partidasService.criar(criarPartidaDto);
  }

  @Get()
  buscarTodos() {
    return this.partidasService.buscarTodos();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.partidasService.buscarPorId(id);
  }

  @Get('ciclo/:cicloMensalId')
  buscarPorCiclo(@Param('cicloMensalId') cicloMensalId: string) {
    return this.partidasService.buscarPorCiclo(cicloMensalId);
  }

  @Post(':id/confirmar')
  confirmarPresenca(
    @Param('id') id: string,
    @Body() confirmarPresencaDto: ConfirmarPresencaDto,
  ) {
    return this.partidasService.confirmarPresenca(
      id,
      confirmarPresencaDto.jogadorId,
    );
  }

  @Post(':id/promover')
  promoverDaListaEspera(
    @Param('id') id: string,
    @Body() confirmarPresencaDto: ConfirmarPresencaDto,
  ) {
    return this.partidasService.promoverDaListaEspera(
      id,
      confirmarPresencaDto.jogadorId,
    );
  }

  @Delete(':id/jogador/:jogadorId')
  removerJogador(
    @Param('id') id: string,
    @Param('jogadorId') jogadorId: string,
  ) {
    return this.partidasService.removerJogador(id, jogadorId);
  }

  @Put(':id/nota')
  atualizarNota(
    @Param('id') id: string,
    @Body() atualizarNotaDto: AtualizarNotaDto,
  ) {
    return this.partidasService.atualizarNota(
      id,
      atualizarNotaDto.jogadorId,
      atualizarNotaDto.nota,
    );
  }

  @Put(':id/fechar')
  fecharLista(@Param('id') id: string) {
    return this.partidasService.fecharLista(id);
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.partidasService.remover(id);
  }
}
