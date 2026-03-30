import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
    timeId: string,
    criarConfiguracoesGeraisDto: CriarConfiguracoesGeraisDto,
  ): Promise<ConfiguracoesGerais> {
    this.logger.log(`Criando configuracoes gerais | time: ${timeId}`);
    const existente = await this.configuracoesGeraisModel
      .countDocuments({ time: new Types.ObjectId(timeId) })
      .exec();
    if (existente > 0) {
      this.logger.warn(
        `Configuracoes gerais ja existem para o time: ${timeId}`,
      );
      throw new BadRequestException(
        'Configurações gerais já existem para este time. Use a rota de atualização.',
      );
    }

    const configuracoes = new this.configuracoesGeraisModel({
      time: new Types.ObjectId(timeId),
      ...criarConfiguracoesGeraisDto,
    });
    const salvo = await configuracoes.save();
    this.logger.log(
      `Configuracoes gerais criadas | id: ${salvo['_id']} | time: ${timeId}`,
    );
    return salvo;
  }

  async buscar(timeId: string): Promise<ConfiguracoesGerais> {
    this.logger.debug(`Buscando configuracoes gerais | time: ${timeId}`);
    const configuracoes = await this.configuracoesGeraisModel
      .findOne({ time: new Types.ObjectId(timeId) })
      .exec();
    if (!configuracoes) {
      this.logger.warn(
        `Configuracoes gerais nao encontradas | time: ${timeId}`,
      );
      throw new NotFoundException(
        'Configurações gerais não encontradas para este time',
      );
    }
    return configuracoes;
  }

  async atualizar(
    timeId: string,
    atualizarConfiguracoesGeraisDto: AtualizarConfiguracoesGeraisDto,
  ): Promise<ConfiguracoesGerais> {
    this.logger.log(`Atualizando configuracoes gerais | time: ${timeId}`);
    const configuracoes = await this.configuracoesGeraisModel
      .findOneAndUpdate(
        { time: new Types.ObjectId(timeId) },
        atualizarConfiguracoesGeraisDto,
        { new: true },
      )
      .exec();
    if (!configuracoes) {
      this.logger.warn(
        `Configuracoes gerais nao encontradas para atualizar | time: ${timeId}`,
      );
      throw new NotFoundException(
        'Configurações gerais não encontradas para este time',
      );
    }

    this.logger.log(`Configuracoes gerais atualizadas | time: ${timeId}`);
    return configuracoes;
  }
}
