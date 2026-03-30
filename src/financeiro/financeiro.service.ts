import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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

export interface ResumoFinanceiro {
  cicloMensalId: string;
  receitaMensalistas: number;
  quantidadeMensalistasPagos: number;
  quantidadeMensalistasTotal: number;
  valorMensalidade: number;
  receitaDiaristas: number;
  quantidadeDiaristasPagos: number;
  valorDiaria: number;
  receitaTotal: number;
  despesasManuais: number;
  despesasTotal: number;
  saldo: number;
}

@Injectable()
export class FinanceiroService {
  private readonly logger = new Logger(FinanceiroService.name);

  constructor(
    @InjectModel(Despesa.name) private despesaModel: Model<DespesaDocument>,
    @InjectModel(CicloMensal.name)
    private cicloMensalModel: Model<CicloMensalDocument>,
    @InjectModel(Partida.name) private partidaModel: Model<PartidaDocument>,
  ) {}

  async criarDespesa(
    timeId: string,
    criarDespesaDto: CriarDespesaDto,
  ): Promise<Despesa> {
    this.logger.log(
      `Criando despesa | time: ${timeId} | ciclo: ${criarDespesaDto.cicloMensalId}`,
    );
    const ciclo = await this.cicloMensalModel
      .findOne({
        _id: criarDespesaDto.cicloMensalId,
        time: new Types.ObjectId(timeId),
      })
      .exec();
    if (!ciclo) {
      this.logger.warn(
        `Ciclo mensal nao encontrado para despesa | id: ${criarDespesaDto.cicloMensalId}`,
      );
      throw new NotFoundException('Ciclo mensal não encontrado');
    }

    const despesa = new this.despesaModel({
      time: new Types.ObjectId(timeId),
      cicloMensal: new Types.ObjectId(criarDespesaDto.cicloMensalId),
      descricao: criarDespesaDto.descricao,
      valor: criarDespesaDto.valor,
      ...(criarDespesaDto.data && { data: new Date(criarDespesaDto.data) }),
    });

    const salvo = await despesa.save();
    this.logger.log(`Despesa criada | id: ${salvo['_id']}`);
    return salvo;
  }

  async buscarDespesasPorCiclo(
    timeId: string,
    cicloMensalId: string,
  ): Promise<Despesa[]> {
    this.logger.debug(
      `Buscando despesas do ciclo: ${cicloMensalId} | time: ${timeId}`,
    );
    return this.despesaModel
      .find({
        time: new Types.ObjectId(timeId),
        cicloMensal: new Types.ObjectId(cicloMensalId),
      })
      .exec();
  }

  async atualizarDespesa(
    timeId: string,
    id: string,
    atualizarDespesaDto: AtualizarDespesaDto,
  ): Promise<Despesa> {
    this.logger.log(`Atualizando despesa | id: ${id} | time: ${timeId}`);
    const despesa = await this.despesaModel
      .findOneAndUpdate(
        { _id: id, time: new Types.ObjectId(timeId) },
        atualizarDespesaDto,
        { new: true },
      )
      .exec();
    if (!despesa) {
      this.logger.warn(`Despesa nao encontrada para atualizar | id: ${id}`);
      throw new NotFoundException('Despesa não encontrada');
    }
    return despesa;
  }

  async removerDespesa(timeId: string, id: string): Promise<Despesa> {
    this.logger.log(`Removendo despesa | id: ${id} | time: ${timeId}`);
    const despesa = await this.despesaModel
      .findOneAndDelete({ _id: id, time: new Types.ObjectId(timeId) })
      .exec();
    if (!despesa) {
      this.logger.warn(`Despesa nao encontrada para remover | id: ${id}`);
      throw new NotFoundException('Despesa não encontrada');
    }
    this.logger.log(`Despesa removida | id: ${id}`);
    return despesa;
  }

  async calcularResumoFinanceiro(
    timeId: string,
    cicloMensalId: string,
  ): Promise<ResumoFinanceiro> {
    this.logger.log(
      `Calculando resumo financeiro | ciclo: ${cicloMensalId} | time: ${timeId}`,
    );
    const ciclo = await this.cicloMensalModel
      .findOne({
        _id: cicloMensalId,
        time: new Types.ObjectId(timeId),
      })
      .exec();
    if (!ciclo) {
      this.logger.warn(
        `Ciclo mensal nao encontrado para resumo | id: ${cicloMensalId}`,
      );
      throw new NotFoundException('Ciclo mensal não encontrado');
    }

    const partidas = await this.partidaModel
      .find({
        time: new Types.ObjectId(timeId),
        cicloMensal: new Types.ObjectId(cicloMensalId),
      })
      .exec();

    const despesas = await this.despesaModel
      .find({
        time: new Types.ObjectId(timeId),
        cicloMensal: new Types.ObjectId(cicloMensalId),
      })
      .exec();

    const quantidadeMensalistasTotal = ciclo.mensalistas.length;
    const quantidadeMensalistasPagos = ciclo.mensalistas.filter(
      (m) => m.pago,
    ).length;
    const receitaMensalistas =
      quantidadeMensalistasPagos * ciclo.valorMensalidade;

    let quantidadeDiaristasPagos = 0;
    for (const partida of partidas) {
      for (const jogador of partida.jogadores) {
        if (!jogador.mensalista && jogador.pago) {
          quantidadeDiaristasPagos++;
        }
      }
    }

    const receitaDiaristas = quantidadeDiaristasPagos * ciclo.valorDiaria;
    const receitaTotal = receitaMensalistas + receitaDiaristas;
    const despesasManuais = despesas.reduce((soma, d) => soma + d.valor, 0);
    const despesasTotal = despesasManuais;
    const saldo = receitaTotal - despesasTotal;

    this.logger.log(
      `Resumo financeiro calculado | ciclo: ${cicloMensalId} | receita: ${receitaTotal} | despesas: ${despesasTotal} | saldo: ${saldo}`,
    );

    return {
      cicloMensalId,
      receitaMensalistas,
      quantidadeMensalistasPagos,
      quantidadeMensalistasTotal,
      valorMensalidade: ciclo.valorMensalidade,
      receitaDiaristas,
      quantidadeDiaristasPagos,
      valorDiaria: ciclo.valorDiaria,
      receitaTotal,
      despesasManuais,
      despesasTotal,
      saldo,
    };
  }
}
