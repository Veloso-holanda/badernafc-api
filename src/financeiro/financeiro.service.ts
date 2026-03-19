import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Despesa, DespesaDocument } from './schemas/despesa.schema';
import { CriarDespesaDto } from './dto/criar-despesa.dto';
import { AtualizarDespesaDto } from './dto/atualizar-despesa.dto';
import {
  CicloMensal,
  CicloMensalDocument,
} from '../ciclo-mensal/schemas/ciclo-mensal.schema';
import { Partida, PartidaDocument } from '../partidas/schemas/partida.schema';
import { ConfiguracoesGeraisService } from '../configuracoes-gerais/configuracoes-gerais.service';

export interface ResumoFinanceiro {
  cicloMensalId: string;
  receitaMensalistas: number;
  quantidadeMensalistas: number;
  valorMensalista: number;
  receitaDiaristas: number;
  quantidadeDiaristasPagos: number;
  diaria: number;
  receitaTotal: number;
  despesasManuais: number;
  valorCicloMensal: number;
  despesasTotal: number;
  saldo: number;
}

@Injectable()
export class FinanceiroService {
  constructor(
    @InjectModel(Despesa.name) private despesaModel: Model<DespesaDocument>,
    @InjectModel(CicloMensal.name)
    private cicloMensalModel: Model<CicloMensalDocument>,
    @InjectModel(Partida.name) private partidaModel: Model<PartidaDocument>,
    private readonly configuracoesGeraisService: ConfiguracoesGeraisService,
  ) {}

  async criarDespesa(criarDespesaDto: CriarDespesaDto): Promise<Despesa> {
    const ciclo = await this.cicloMensalModel
      .findById(criarDespesaDto.cicloMensalId)
      .exec();
    if (!ciclo) {
      throw new NotFoundException('Ciclo mensal não encontrado');
    }

    const despesa = new this.despesaModel({
      cicloMensal: new Types.ObjectId(criarDespesaDto.cicloMensalId),
      descricao: criarDespesaDto.descricao,
      valor: criarDespesaDto.valor,
      ...(criarDespesaDto.data && { data: new Date(criarDespesaDto.data) }),
    });

    return despesa.save();
  }

  async buscarDespesasPorCiclo(cicloMensalId: string): Promise<Despesa[]> {
    return this.despesaModel
      .find({ cicloMensal: new Types.ObjectId(cicloMensalId) })
      .exec();
  }

  async atualizarDespesa(
    id: string,
    atualizarDespesaDto: AtualizarDespesaDto,
  ): Promise<Despesa> {
    const despesa = await this.despesaModel
      .findByIdAndUpdate(id, atualizarDespesaDto, { new: true })
      .exec();
    if (!despesa) {
      throw new NotFoundException('Despesa não encontrada');
    }
    return despesa;
  }

  async removerDespesa(id: string): Promise<Despesa> {
    const despesa = await this.despesaModel.findByIdAndDelete(id).exec();
    if (!despesa) {
      throw new NotFoundException('Despesa não encontrada');
    }
    return despesa;
  }

  async calcularResumoFinanceiro(
    cicloMensalId: string,
  ): Promise<ResumoFinanceiro> {
    const ciclo = await this.cicloMensalModel.findById(cicloMensalId).exec();
    if (!ciclo) {
      throw new NotFoundException('Ciclo mensal não encontrado');
    }

    const config = await this.configuracoesGeraisService.buscar();

    const partidas = await this.partidaModel
      .find({ cicloMensal: new Types.ObjectId(cicloMensalId) })
      .exec();

    const despesas = await this.despesaModel
      .find({ cicloMensal: new Types.ObjectId(cicloMensalId) })
      .exec();

    const quantidadeMensalistas = ciclo.mensalistas.length;
    const receitaMensalistas = quantidadeMensalistas * config.valorMensalista;

    let quantidadeDiaristasPagos = 0;
    for (const partida of partidas) {
      for (const jogador of partida.jogadores) {
        if (!jogador.mensalista && jogador.pago) {
          quantidadeDiaristasPagos++;
        }
      }
    }

    const receitaDiaristas = quantidadeDiaristasPagos * config.diaria;
    const receitaTotal = receitaMensalistas + receitaDiaristas;
    const despesasManuais = despesas.reduce((soma, d) => soma + d.valor, 0);
    const despesasTotal = despesasManuais + config.valorCicloMensal;
    const saldo = receitaTotal - despesasTotal;

    return {
      cicloMensalId,
      receitaMensalistas,
      quantidadeMensalistas,
      valorMensalista: config.valorMensalista,
      receitaDiaristas,
      quantidadeDiaristasPagos,
      diaria: config.diaria,
      receitaTotal,
      despesasManuais,
      valorCicloMensal: config.valorCicloMensal,
      despesasTotal,
      saldo,
    };
  }
}
