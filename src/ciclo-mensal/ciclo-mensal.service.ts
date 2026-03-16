import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CicloMensal, CicloMensalDocument } from './schemas/ciclo-mensal.schema';
import { CriarCicloMensalDto } from './dto/criar-ciclo-mensal.dto';
import { AtualizarCicloMensalDto } from './dto/atualizar-ciclo-mensal.dto';

@Injectable()
export class CicloMensalService {
  constructor(
    @InjectModel(CicloMensal.name)
    private cicloMensalModel: Model<CicloMensalDocument>,
  ) {}

  private contarDiasSemanaNoPeriodo(
    dataInicial: Date,
    dataFinal: Date,
    diaSemana: number,
  ): number {
    let contagem = 0;
    const atual = new Date(dataInicial);

    while (atual < dataFinal) {
      if (atual.getDay() === diaSemana) {
        contagem++;
      }
      atual.setDate(atual.getDate() + 1);
    }

    return contagem;
  }

  async criar(criarCicloMensalDto: CriarCicloMensalDto): Promise<CicloMensal> {
    const dataInicial = new Date(criarCicloMensalDto.dataInicial);
    const dataFinal = new Date(dataInicial);
    dataFinal.setMonth(dataFinal.getMonth() + 1);

    const quantidadePartidas = this.contarDiasSemanaNoPeriodo(
      dataInicial,
      dataFinal,
      criarCicloMensalDto.diaSemana,
    );

    const ciclo = new this.cicloMensalModel({
      ...criarCicloMensalDto,
      dataInicial,
      dataFinal,
      quantidadePartidas,
    });

    return ciclo.save();
  }

  async buscarTodos(): Promise<CicloMensal[]> {
    return this.cicloMensalModel.find().populate('mensalistas').exec();
  }

  async buscarPorId(id: string): Promise<CicloMensal> {
    const ciclo = await this.cicloMensalModel
      .findById(id)
      .populate('mensalistas')
      .exec();
    if (!ciclo) {
      throw new NotFoundException('Ciclo mensal nao encontrado');
    }
    return ciclo;
  }

  async buscarAtual(): Promise<CicloMensal> {
    const agora = new Date();
    const ciclo = await this.cicloMensalModel
      .findOne({
        dataInicial: { $lte: agora },
        dataFinal: { $gte: agora },
      })
      .populate('mensalistas')
      .exec();
    if (!ciclo) {
      throw new NotFoundException('Nenhum ciclo mensal ativo');
    }
    return ciclo;
  }

  async atualizar(
    id: string,
    atualizarCicloMensalDto: AtualizarCicloMensalDto,
  ): Promise<CicloMensal> {
    const ciclo = await this.cicloMensalModel
      .findByIdAndUpdate(id, atualizarCicloMensalDto, { new: true })
      .populate('mensalistas')
      .exec();
    if (!ciclo) {
      throw new NotFoundException('Ciclo mensal nao encontrado');
    }
    return ciclo;
  }

  async remover(id: string): Promise<CicloMensal> {
    const ciclo = await this.cicloMensalModel.findByIdAndDelete(id).exec();
    if (!ciclo) {
      throw new NotFoundException('Ciclo mensal nao encontrado');
    }
    return ciclo;
  }
}
