import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ConfiguracoesGerais,
  ConfiguracoesGeraisDocument,
} from './schemas/configuracoes-gerais.schema';
import { CriarConfiguracoesGeraisDto } from './dto/criar-configuracoes-gerais.dto';
import { AtualizarConfiguracoesGeraisDto } from './dto/atualizar-configuracoes-gerais.dto';

@Injectable()
export class ConfiguracoesGeraisService {
  private readonly logger = new Logger(ConfiguracoesGeraisService.name);

  constructor(
    @InjectModel(ConfiguracoesGerais.name)
    private configuracoesGeraisModel: Model<ConfiguracoesGeraisDocument>,
  ) {}

  async criar(
    criarConfiguracoesGeraisDto: CriarConfiguracoesGeraisDto,
  ): Promise<ConfiguracoesGerais> {
    this.logger.log(`Criando configuracoes gerais | ${JSON.stringify(criarConfiguracoesGeraisDto)}`);
    const existente = await this.configuracoesGeraisModel
      .countDocuments()
      .exec();
    if (existente > 0) {
      this.logger.warn('Configuracoes gerais ja existem, bloqueando criacao');
      throw new BadRequestException(
        'Configurações gerais já existem. Use a rota de atualização.',
      );
    }

    const configuracoes = new this.configuracoesGeraisModel(
      criarConfiguracoesGeraisDto,
    );
    const salvo = await configuracoes.save();
    this.logger.log(`Configuracoes gerais criadas | id: ${salvo['_id']}`);
    return salvo;
  }

  async buscar(): Promise<ConfiguracoesGerais> {
    this.logger.debug('Buscando configuracoes gerais');
    const configuracoes = await this.configuracoesGeraisModel.findOne().exec();
    if (!configuracoes) {
      this.logger.warn('Configuracoes gerais nao encontradas');
      throw new NotFoundException('Configurações gerais não encontradas');
    }
    return configuracoes;
  }

  async atualizar(
    atualizarConfiguracoesGeraisDto: AtualizarConfiguracoesGeraisDto,
  ): Promise<ConfiguracoesGerais> {
    this.logger.log(`Atualizando configuracoes gerais | campos: ${Object.keys(atualizarConfiguracoesGeraisDto).join(', ')}`);
    const configuracoes = await this.configuracoesGeraisModel.findOne().exec();
    if (!configuracoes) {
      this.logger.warn('Configuracoes gerais nao encontradas para atualizar');
      throw new NotFoundException('Configurações gerais não encontradas');
    }

    const atualizado = await this.configuracoesGeraisModel
      .findByIdAndUpdate(configuracoes._id, atualizarConfiguracoesGeraisDto, {
        new: true,
      })
      .exec();

    this.logger.log(`Configuracoes gerais atualizadas | ${JSON.stringify(atualizado)}`);
    return atualizado!;
  }
}
