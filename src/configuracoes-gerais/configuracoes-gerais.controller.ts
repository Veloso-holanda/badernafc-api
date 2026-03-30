import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ConfiguracoesGeraisService } from './configuracoes-gerais.service';
import { AtualizarConfiguracoesGeraisDto } from './dto/atualizar-configuracoes-gerais.dto';
import { TimeMembroGuard } from '../common/guards/time-membro.guard';
import { AdminTimeGuard } from '../common/guards/admin-time.guard';

@Controller('times/:timeId/configuracoes-gerais')
@UseGuards(TimeMembroGuard, AdminTimeGuard)
export class ConfiguracoesGeraisController {
  constructor(
    private readonly configuracoesGeraisService: ConfiguracoesGeraisService,
  ) {}

  @Get()
  buscar(@Param('timeId') timeId: string) {
    return this.configuracoesGeraisService.buscar(timeId);
  }

  @Put()
  atualizar(
    @Param('timeId') timeId: string,
    @Body() atualizarConfiguracoesGeraisDto: AtualizarConfiguracoesGeraisDto,
  ) {
    return this.configuracoesGeraisService.atualizar(
      timeId,
      atualizarConfiguracoesGeraisDto,
    );
  }
}
