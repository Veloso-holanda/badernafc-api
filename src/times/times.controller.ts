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
import { TimesService } from './times.service.js';
import { MembrosService } from './membros.service.js';
import { CriarTimeDto } from './dto/criar-time.dto.js';
import { AtualizarTimeDto } from './dto/atualizar-time.dto.js';
import { EntrarTimeDto } from './dto/entrar-time.dto.js';
import { AtualizarMembroDto } from './dto/atualizar-membro.dto.js';
import { FirebaseAuth } from '../firebase/decorators/firebaseAuth.decorator.js';
import { TimeMembroGuard } from '../common/guards/time-membro.guard.js';
import { AdminTimeGuard } from '../common/guards/admin-time.guard.js';

@Controller('times')
export class TimesController {
  constructor(
    private readonly timesService: TimesService,
    private readonly membrosService: MembrosService,
  ) {}

  @Post()
  criar(@FirebaseAuth() usuarioAuth: any, @Body() criarTimeDto: CriarTimeDto) {
    return this.timesService.criar(usuarioAuth.uid, criarTimeDto);
  }

  @Get()
  buscarMeusTimes(@FirebaseAuth() usuarioAuth: any) {
    return this.timesService.buscarMeusTimes(usuarioAuth.uid);
  }

  @Post('entrar')
  entrar(
    @FirebaseAuth() usuarioAuth: any,
    @Body() entrarTimeDto: EntrarTimeDto,
  ) {
    return this.timesService.entrar(
      usuarioAuth.uid,
      entrarTimeDto.codigoConvite,
    );
  }

  @Get(':timeId')
  @UseGuards(TimeMembroGuard)
  buscarPorId(@Param('timeId') timeId: string) {
    return this.timesService.buscarPorId(timeId);
  }

  @Put(':timeId')
  @UseGuards(TimeMembroGuard, AdminTimeGuard)
  atualizar(
    @Param('timeId') timeId: string,
    @Body() atualizarTimeDto: AtualizarTimeDto,
  ) {
    return this.timesService.atualizar(timeId, atualizarTimeDto);
  }

  @Get(':timeId/membros')
  @UseGuards(TimeMembroGuard)
  buscarMembros(@Param('timeId') timeId: string) {
    return this.membrosService.buscarPorTime(timeId);
  }

  @Put(':timeId/membros/:membroId')
  @UseGuards(TimeMembroGuard, AdminTimeGuard)
  atualizarPapelMembro(
    @Param('timeId') timeId: string,
    @Param('membroId') membroId: string,
    @Body() atualizarMembroDto: AtualizarMembroDto,
  ) {
    return this.membrosService.atualizarPapel(
      timeId,
      membroId,
      atualizarMembroDto.papel,
    );
  }

  @Delete(':timeId/membros/:membroId')
  @UseGuards(TimeMembroGuard, AdminTimeGuard)
  removerMembro(
    @Param('timeId') timeId: string,
    @Param('membroId') membroId: string,
  ) {
    return this.membrosService.remover(timeId, membroId);
  }
}
