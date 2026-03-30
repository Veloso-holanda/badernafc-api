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
import { PartidasService } from './partidas.service';
import { ConfirmarPresencaDto } from './dto/confirmar-presenca.dto';
import { AtualizarNotaDto } from './dto/atualizar-nota.dto';
import { PagamentoDiaristaDto } from './dto/pagamento-diarista.dto';
import { DefinirGoleirosDto } from './dto/definir-goleiros.dto';
import { TimeMembroGuard } from '../common/guards/time-membro.guard';
import { AdminTimeGuard } from '../common/guards/admin-time.guard';

@Controller('times/:timeId/partidas')
@UseGuards(TimeMembroGuard)
export class PartidasController {
  constructor(private readonly partidasService: PartidasService) {}

  @Get()
  buscarTodos(@Param('timeId') timeId: string) {
    return this.partidasService.buscarTodos(timeId);
  }

  @Get(':id')
  buscarPorId(@Param('timeId') timeId: string, @Param('id') id: string) {
    return this.partidasService.buscarPorId(timeId, id);
  }

  @Get('ciclo/:cicloMensalId')
  buscarPorCiclo(
    @Param('timeId') timeId: string,
    @Param('cicloMensalId') cicloMensalId: string,
  ) {
    return this.partidasService.buscarPorCiclo(timeId, cicloMensalId);
  }

  @Post(':id/confirmar')
  confirmarPresenca(
    @Param('timeId') timeId: string,
    @Param('id') id: string,
    @Body() confirmarPresencaDto: ConfirmarPresencaDto,
  ) {
    return this.partidasService.confirmarPresenca(
      timeId,
      id,
      confirmarPresencaDto.jogadorId,
    );
  }

  @Post(':id/promover')
  @UseGuards(AdminTimeGuard)
  promoverDaListaEspera(
    @Param('timeId') timeId: string,
    @Param('id') id: string,
    @Body() confirmarPresencaDto: ConfirmarPresencaDto,
  ) {
    return this.partidasService.promoverDaListaEspera(
      timeId,
      id,
      confirmarPresencaDto.jogadorId,
    );
  }

  @Delete(':id/jogador/:jogadorId')
  @UseGuards(AdminTimeGuard)
  removerJogador(
    @Param('timeId') timeId: string,
    @Param('id') id: string,
    @Param('jogadorId') jogadorId: string,
  ) {
    return this.partidasService.removerJogador(timeId, id, jogadorId);
  }

  @Put(':id/nota')
  @UseGuards(AdminTimeGuard)
  atualizarNota(
    @Param('timeId') timeId: string,
    @Param('id') id: string,
    @Body() atualizarNotaDto: AtualizarNotaDto,
  ) {
    return this.partidasService.atualizarNota(
      timeId,
      id,
      atualizarNotaDto.jogadorId,
      atualizarNotaDto.nota,
    );
  }

  @Put(':id/pagamento-diarista')
  @UseGuards(AdminTimeGuard)
  marcarPagamentoDiarista(
    @Param('timeId') timeId: string,
    @Param('id') id: string,
    @Body() pagamentoDiaristaDto: PagamentoDiaristaDto,
  ) {
    return this.partidasService.marcarPagamentoDiarista(
      timeId,
      id,
      pagamentoDiaristaDto.jogadorId,
      pagamentoDiaristaDto.pago,
    );
  }

  @Post(':id/sortear')
  @UseGuards(AdminTimeGuard)
  sortear(@Param('timeId') timeId: string, @Param('id') id: string) {
    return this.partidasService.sortear(timeId, id);
  }

  @Post(':id/refazer-sorteio')
  @UseGuards(AdminTimeGuard)
  refazerSorteio(@Param('timeId') timeId: string, @Param('id') id: string) {
    return this.partidasService.refazerSorteio(timeId, id);
  }

  @Put(':id/definir-goleiros')
  @UseGuards(AdminTimeGuard)
  definirGoleiros(
    @Param('timeId') timeId: string,
    @Param('id') id: string,
    @Body() definirGoleirosDto: DefinirGoleirosDto,
  ) {
    return this.partidasService.definirGoleiros(
      timeId,
      id,
      definirGoleirosDto.goleiros,
    );
  }

  @Put(':id/finalizar')
  @UseGuards(AdminTimeGuard)
  finalizar(@Param('timeId') timeId: string, @Param('id') id: string) {
    return this.partidasService.finalizar(timeId, id);
  }

  @Delete(':id')
  @UseGuards(AdminTimeGuard)
  remover(@Param('timeId') timeId: string, @Param('id') id: string) {
    return this.partidasService.remover(timeId, id);
  }
}
