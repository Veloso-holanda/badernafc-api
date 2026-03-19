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
import { ConfirmarPresencaDto } from './dto/confirmar-presenca.dto';
import { AtualizarNotaDto } from './dto/atualizar-nota.dto';
import { PagamentoDiaristaDto } from './dto/pagamento-diarista.dto';

@Controller('partidas')
export class PartidasController {
  constructor(private readonly partidasService: PartidasService) {}

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

  @Put(':id/pagamento-diarista')
  marcarPagamentoDiarista(
    @Param('id') id: string,
    @Body() pagamentoDiaristaDto: PagamentoDiaristaDto,
  ) {
    return this.partidasService.marcarPagamentoDiarista(
      id,
      pagamentoDiaristaDto.jogadorId,
      pagamentoDiaristaDto.pago,
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
