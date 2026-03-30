import {
  Injectable,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Jogador, JogadorDocument } from './schemas/jogador.schema';
import { CriarJogadorDto } from './dto/criar-jogador.dto';
import { AtualizarJogadorDto } from './dto/atualizar-jogador.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import { Membro, MembroDocument } from '../times/schemas/membro.schema';
import { randomBytes } from 'crypto';

@Injectable()
export class JogadoresService {
  private readonly logger = new Logger(JogadoresService.name);

  constructor(
    @InjectModel(Jogador.name) private jogadorModel: Model<JogadorDocument>,
    @InjectModel(Membro.name) private membroModel: Model<MembroDocument>,
    private readonly usuariosService: UsuariosService,
  ) {}

  private gerarCodigoVincular(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }

  async criar(
    timeId: string,
    criarJogadorDto: CriarJogadorDto,
  ): Promise<Jogador> {
    this.logger.log(
      `Criando jogador | nome: ${criarJogadorDto.nome} | time: ${timeId}`,
    );
    const codigoVincular = this.gerarCodigoVincular();
    const jogador = new this.jogadorModel({
      ...criarJogadorDto,
      time: new Types.ObjectId(timeId),
      codigoVincular,
    });
    const salvo = await jogador.save();
    this.logger.log(
      `Jogador criado | id: ${salvo['_id']} | codigo: ${codigoVincular}`,
    );
    return salvo;
  }

  async buscarTodos(timeId: string): Promise<Jogador[]> {
    this.logger.log(`Buscando jogadores do time: ${timeId}`);
    return this.jogadorModel
      .find({ time: new Types.ObjectId(timeId) })
      .populate('usuario')
      .exec();
  }

  async buscarPorId(timeId: string, id: string): Promise<Jogador> {
    this.logger.debug(`Buscando jogador por id: ${id} | time: ${timeId}`);
    const jogador = await this.jogadorModel
      .findOne({ _id: id, time: new Types.ObjectId(timeId) })
      .populate('usuario')
      .exec();
    if (!jogador) {
      this.logger.warn(`Jogador nao encontrado | id: ${id}`);
      throw new NotFoundException('Jogador não encontrado');
    }
    return jogador;
  }

  async atualizar(
    timeId: string,
    id: string,
    atualizarJogadorDto: AtualizarJogadorDto,
  ): Promise<Jogador> {
    this.logger.log(`Atualizando jogador | id: ${id} | time: ${timeId}`);
    const jogador = await this.jogadorModel
      .findOneAndUpdate(
        { _id: id, time: new Types.ObjectId(timeId) },
        atualizarJogadorDto,
        { new: true },
      )
      .populate('usuario')
      .exec();
    if (!jogador) {
      this.logger.warn(`Jogador nao encontrado para atualizar | id: ${id}`);
      throw new NotFoundException('Jogador não encontrado');
    }
    return jogador;
  }

  async remover(timeId: string, id: string): Promise<Jogador> {
    this.logger.log(`Removendo jogador | id: ${id} | time: ${timeId}`);
    const jogador = await this.jogadorModel
      .findOneAndDelete({ _id: id, time: new Types.ObjectId(timeId) })
      .exec();
    if (!jogador) {
      this.logger.warn(`Jogador nao encontrado para remover | id: ${id}`);
      throw new NotFoundException('Jogador não encontrado');
    }
    this.logger.log(`Jogador removido | id: ${id} | nome: ${jogador.nome}`);
    return jogador;
  }

  async vincular(
    timeId: string,
    firebaseUid: string,
    codigoVincular: string,
  ): Promise<Jogador> {
    this.logger.log(
      `Vinculando jogador | codigo: ${codigoVincular} | time: ${timeId} | firebaseUid: ${firebaseUid}`,
    );
    const jogador = await this.jogadorModel
      .findOne({
        time: new Types.ObjectId(timeId),
        codigoVincular,
      })
      .exec();

    if (!jogador) {
      this.logger.warn(`Codigo de vinculo invalido: ${codigoVincular}`);
      throw new NotFoundException('Código de vínculo inválido');
    }

    if (jogador.vinculado) {
      this.logger.warn(`Jogador ja vinculado | id: ${jogador['_id']}`);
      throw new ConflictException('Jogador já vinculado a outro usuário');
    }

    const usuario =
      await this.usuariosService.buscarPorFirebaseUid(firebaseUid);

    jogador.usuario = usuario['_id'];
    jogador.email = usuario.email;
    jogador.telefone = usuario['telefone'] || '';
    jogador.vinculado = true;
    const salvo = await jogador.save();

    await this.membroModel.findOneAndUpdate(
      {
        time: new Types.ObjectId(timeId),
        usuario: usuario['_id'],
        ativo: true,
      },
      { jogador: salvo['_id'] },
    );

    this.logger.log(
      `Jogador vinculado com sucesso | id: ${salvo['_id']} | usuario: ${usuario['_id']}`,
    );
    return salvo;
  }
}
