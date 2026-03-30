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
import { CicloMensalService } from './ciclo-mensal.service';
import { CriarCicloMensalDto } from './dto/criar-ciclo-mensal.dto';
import { AtualizarCicloMensalDto } from './dto/atualizar-ciclo-mensal.dto';
import { PagamentoMensalistaDto } from './dto/pagamento-mensalista.dto';
import { TimeMembroGuard } from '../common/guards/time-membro.guard';
import { AdminTimeGuard } from '../common/guards/admin-time.guard';

@Controller('times/:timeId/ciclos-mensais')
@UseGuards(TimeMembroGuard)
export class CicloMensalController {
  constructor(private readonly cicloMensalService: CicloMensalService) {}

  @Post()
  @UseGuards(AdminTimeGuard)
  criar(
    @Param('timeId') timeId: string,
    @Body() criarCicloMensalDto: CriarCicloMensalDto,
  ) {
    return this.cicloMensalService.criar(timeId, criarCicloMensalDto);
  }

  @Get()
  buscarTodos(@Param('timeId') timeId: string) {
    return this.cicloMensalService.buscarTodos(timeId);
  }

  @Get('atual')
  buscarAtual(@Param('timeId') timeId: string) {
    return this.cicloMensalService.buscarAtual(timeId);
  }

  @Get(':id')
  buscarPorId(@Param('timeId') timeId: string, @Param('id') id: string) {
    return this.cicloMensalService.buscarPorId(timeId, id);
  }

  @Put(':id')
  @UseGuards(AdminTimeGuard)
  atualizar(
    @Param('timeId') timeId: string,
    @Param('id') id: string,
    @Body() atualizarCicloMensalDto: AtualizarCicloMensalDto,
  ) {
    return this.cicloMensalService.atualizar(
      timeId,
      id,
      atualizarCicloMensalDto,
    );
  }

  @Put(':id/pagamento-mensalista')
  @UseGuards(AdminTimeGuard)
  marcarPagamentoMensalista(
    @Param('timeId') timeId: string,
    @Param('id') id: string,
    @Body() pagamentoDto: PagamentoMensalistaDto,
  ) {
    return this.cicloMensalService.marcarPagamentoMensalista(
      timeId,
      id,
      pagamentoDto.jogadorId,
      pagamentoDto.pago,
    );
  }

  @Delete(':id')
  @UseGuards(AdminTimeGuard)
  remover(@Param('timeId') timeId: string, @Param('id') id: string) {
    return this.cicloMensalService.remover(timeId, id);
  }
}
