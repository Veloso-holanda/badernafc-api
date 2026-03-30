import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Time, TimeDocument } from './schemas/time.schema.js';
import {
  Membro,
  MembroDocument,
  MembroPapel,
} from './schemas/membro.schema.js';
import { CriarTimeDto } from './dto/criar-time.dto.js';
import { AtualizarTimeDto } from './dto/atualizar-time.dto.js';
import {
  ConfiguracoesGerais,
  ConfiguracoesGeraisDocument,
} from '../configuracoes-gerais/schemas/configuracoes-gerais.schema.js';
import {
  Usuario,
  UsuarioDocument,
} from '../usuarios/schemas/usuario.schema.js';
import { randomBytes } from 'crypto';

@Injectable()
export class TimesService {
  private readonly logger = new Logger(TimesService.name);

  constructor(
    @InjectModel(Time.name) private timeModel: Model<TimeDocument>,
    @InjectModel(Membro.name) private membroModel: Model<MembroDocument>,
    @InjectModel(ConfiguracoesGerais.name)
    private configuracoesGeraisModel: Model<ConfiguracoesGeraisDocument>,
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
  ) {}

  private gerarCodigoConvite(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }

  async criar(firebaseUid: string, criarTimeDto: CriarTimeDto): Promise<Time> {
    this.logger.log(
      `Criando time | nome: ${criarTimeDto.nome} | firebaseUid: ${firebaseUid}`,
    );

    const usuario = await this.usuarioModel.findOne({ firebaseUid }).exec();
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const codigoConvite = this.gerarCodigoConvite();
    const time = new this.timeModel({
      ...criarTimeDto,
      codigoConvite,
      criador: usuario._id,
    });
    const salvo = await time.save();

    await this.membroModel.create({
      time: salvo._id,
      usuario: usuario._id,
      papel: MembroPapel.ADMIN,
    });

    await this.configuracoesGeraisModel.create({
      time: salvo._id,
      valorCicloMensal: 500,
      diaria: 25,
      valorMensalista: 100,
      diaFutebol: 3,
      horaFutebol: '19:00',
      jogadoresPorTime: 5,
      quantidadeTimes: 4,
      antecedenciaAberturaLista: 48,
      tempoLimiteMensalistas: 6,
    });

    this.logger.log(
      `Time criado | id: ${salvo['_id']} | codigo: ${codigoConvite}`,
    );
    return salvo;
  }

  async buscarMeusTimes(firebaseUid: string): Promise<any[]> {
    const usuario = await this.usuarioModel.findOne({ firebaseUid }).exec();
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const membros = await this.membroModel
      .find({ usuario: usuario._id, ativo: true })
      .populate('time')
      .exec();

    return membros.map((m) => ({
      time: m.time,
      papel: m.papel,
      membroId: m['_id'],
    }));
  }

  async buscarPorId(timeId: string): Promise<Time> {
    const time = await this.timeModel
      .findById(timeId)
      .populate('criador')
      .exec();
    if (!time) {
      throw new NotFoundException('Time não encontrado');
    }
    return time;
  }

  async atualizar(
    timeId: string,
    atualizarTimeDto: AtualizarTimeDto,
  ): Promise<Time> {
    this.logger.log(`Atualizando time | id: ${timeId}`);
    const time = await this.timeModel
      .findByIdAndUpdate(timeId, atualizarTimeDto, { new: true })
      .exec();
    if (!time) {
      throw new NotFoundException('Time não encontrado');
    }
    return time;
  }

  async entrar(firebaseUid: string, codigoConvite: string): Promise<Membro> {
    this.logger.log(
      `Entrando em time | codigo: ${codigoConvite} | firebaseUid: ${firebaseUid}`,
    );

    const time = await this.timeModel
      .findOne({ codigoConvite, ativo: true })
      .exec();
    if (!time) {
      throw new NotFoundException('Código de convite inválido');
    }

    const usuario = await this.usuarioModel.findOne({ firebaseUid }).exec();
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const membroExistente = await this.membroModel
      .findOne({
        time: time._id,
        usuario: usuario._id,
      })
      .exec();

    if (membroExistente) {
      if (membroExistente.ativo) {
        throw new ConflictException('Você já é membro deste time');
      }
      membroExistente.ativo = true;
      return membroExistente.save();
    }

    const membro = await this.membroModel.create({
      time: time._id,
      usuario: usuario._id,
      papel: MembroPapel.MEMBRO,
    });

    this.logger.log(
      `Membro adicionado ao time | timeId: ${time['_id']} | usuarioId: ${usuario['_id']}`,
    );
    return membro;
  }
}
