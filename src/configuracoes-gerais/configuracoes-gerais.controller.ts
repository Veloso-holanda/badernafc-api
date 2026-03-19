import { Controller, Get, Post, Put, Body, UseGuards } from '@nestjs/common';
import { ConfiguracoesGeraisService } from './configuracoes-gerais.service';
import { CriarConfiguracoesGeraisDto } from './dto/criar-configuracoes-gerais.dto';
import { AtualizarConfiguracoesGeraisDto } from './dto/atualizar-configuracoes-gerais.dto';
import { AdminGuard } from '../firebase/guards/admin.guard';

@Controller('configuracoes-gerais')
@UseGuards(AdminGuard)
export class ConfiguracoesGeraisController {
  constructor(
    private readonly configuracoesGeraisService: ConfiguracoesGeraisService,
  ) {}

  @Post()
  criar(@Body() criarConfiguracoesGeraisDto: CriarConfiguracoesGeraisDto) {
    return this.configuracoesGeraisService.criar(criarConfiguracoesGeraisDto);
  }

  @Get()
  buscar() {
    return this.configuracoesGeraisService.buscar();
  }

  @Put()
  atualizar(
    @Body() atualizarConfiguracoesGeraisDto: AtualizarConfiguracoesGeraisDto,
  ) {
    return this.configuracoesGeraisService.atualizar(
      atualizarConfiguracoesGeraisDto,
    );
  }
}
