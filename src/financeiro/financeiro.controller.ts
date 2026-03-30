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
import { FinanceiroService } from './financeiro.service';
import { CriarDespesaDto } from './dto/criar-despesa.dto';
import { AtualizarDespesaDto } from './dto/atualizar-despesa.dto';
import { TimeMembroGuard } from '../common/guards/time-membro.guard';
import { AdminTimeGuard } from '../common/guards/admin-time.guard';

@Controller('times/:timeId/financeiro')
@UseGuards(TimeMembroGuard, AdminTimeGuard)
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @Post('despesas')
  criarDespesa(
    @Param('timeId') timeId: string,
    @Body() criarDespesaDto: CriarDespesaDto,
  ) {
    return this.financeiroService.criarDespesa(timeId, criarDespesaDto);
  }

  @Get('despesas/ciclo/:cicloMensalId')
  buscarDespesasPorCiclo(
    @Param('timeId') timeId: string,
    @Param('cicloMensalId') cicloMensalId: string,
  ) {
    return this.financeiroService.buscarDespesasPorCiclo(timeId, cicloMensalId);
  }

  @Put('despesas/:id')
  atualizarDespesa(
    @Param('timeId') timeId: string,
    @Param('id') id: string,
    @Body() atualizarDespesaDto: AtualizarDespesaDto,
  ) {
    return this.financeiroService.atualizarDespesa(
      timeId,
      id,
      atualizarDespesaDto,
    );
  }

  @Delete('despesas/:id')
  removerDespesa(@Param('timeId') timeId: string, @Param('id') id: string) {
    return this.financeiroService.removerDespesa(timeId, id);
  }

  @Get('resumo/:cicloMensalId')
  calcularResumoFinanceiro(
    @Param('timeId') timeId: string,
    @Param('cicloMensalId') cicloMensalId: string,
  ) {
    return this.financeiroService.calcularResumoFinanceiro(
      timeId,
      cicloMensalId,
    );
  }
}
