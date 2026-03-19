import {
  Injectable,
  BadRequestException,
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
  constructor(
    @InjectModel(ConfiguracoesGerais.name)
    private configuracoesGeraisModel: Model<ConfiguracoesGeraisDocument>,
  ) {}

  async criar(
    criarConfiguracoesGeraisDto: CriarConfiguracoesGeraisDto,
  ): Promise<ConfiguracoesGerais> {
    const existente = await this.configuracoesGeraisModel
      .countDocuments()
      .exec();
    if (existente > 0) {
      throw new BadRequestException(
        'Configurações gerais já existem. Use a rota de atualização.',
      );
    }

    const configuracoes = new this.configuracoesGeraisModel(
      criarConfiguracoesGeraisDto,
    );
    return configuracoes.save();
  }

  async buscar(): Promise<ConfiguracoesGerais> {
    const configuracoes = await this.configuracoesGeraisModel.findOne().exec();
    if (!configuracoes) {
      throw new NotFoundException('Configurações gerais não encontradas');
    }
    return configuracoes;
  }

  async atualizar(
    atualizarConfiguracoesGeraisDto: AtualizarConfiguracoesGeraisDto,
  ): Promise<ConfiguracoesGerais> {
    const configuracoes = await this.configuracoesGeraisModel.findOne().exec();
    if (!configuracoes) {
      throw new NotFoundException('Configurações gerais não encontradas');
    }

    const atualizado = await this.configuracoesGeraisModel
      .findByIdAndUpdate(configuracoes._id, atualizarConfiguracoesGeraisDto, {
        new: true,
      })
      .exec();

    return atualizado!;
  }
}
