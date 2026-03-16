import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CicloMensalService } from './ciclo-mensal.service';
import { CriarCicloMensalDto } from './dto/criar-ciclo-mensal.dto';
import { AtualizarCicloMensalDto } from './dto/atualizar-ciclo-mensal.dto';

@Controller('ciclos-mensais')
export class CicloMensalController {
  constructor(private readonly cicloMensalService: CicloMensalService) {}

  @Post()
  criar(@Body() criarCicloMensalDto: CriarCicloMensalDto) {
    return this.cicloMensalService.criar(criarCicloMensalDto);
  }

  @Get()
  buscarTodos() {
    return this.cicloMensalService.buscarTodos();
  }

  @Get('atual')
  buscarAtual() {
    return this.cicloMensalService.buscarAtual();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.cicloMensalService.buscarPorId(id);
  }

  @Put(':id')
  atualizar(
    @Param('id') id: string,
    @Body() atualizarCicloMensalDto: AtualizarCicloMensalDto,
  ) {
    return this.cicloMensalService.atualizar(id, atualizarCicloMensalDto);
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.cicloMensalService.remover(id);
  }
}
