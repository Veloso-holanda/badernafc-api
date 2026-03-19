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
import { AdminGuard } from '../firebase/guards/admin.guard';

@Controller('financeiro')
@UseGuards(AdminGuard)
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @Post('despesas')
  criarDespesa(@Body() criarDespesaDto: CriarDespesaDto) {
    return this.financeiroService.criarDespesa(criarDespesaDto);
  }

  @Get('despesas/ciclo/:cicloMensalId')
  buscarDespesasPorCiclo(@Param('cicloMensalId') cicloMensalId: string) {
    return this.financeiroService.buscarDespesasPorCiclo(cicloMensalId);
  }

  @Put('despesas/:id')
  atualizarDespesa(
    @Param('id') id: string,
    @Body() atualizarDespesaDto: AtualizarDespesaDto,
  ) {
    return this.financeiroService.atualizarDespesa(id, atualizarDespesaDto);
  }

  @Delete('despesas/:id')
  removerDespesa(@Param('id') id: string) {
    return this.financeiroService.removerDespesa(id);
  }

  @Get('resumo/:cicloMensalId')
  calcularResumoFinanceiro(@Param('cicloMensalId') cicloMensalId: string) {
    return this.financeiroService.calcularResumoFinanceiro(cicloMensalId);
  }
}
