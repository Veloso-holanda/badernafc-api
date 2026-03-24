import {
  Injectable,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Jogador, JogadorDocument } from './schemas/jogador.schema';
import { CriarJogadorDto } from './dto/criar-jogador.dto';
import { AtualizarJogadorDto } from './dto/atualizar-jogador.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import { Usuario, UsuarioDocument } from '../usuarios/schemas/usuario.schema';
import { randomBytes } from 'crypto';

@Injectable()
export class JogadoresService {
  private readonly logger = new Logger(JogadoresService.name);

  constructor(
    @InjectModel(Jogador.name) private jogadorModel: Model<JogadorDocument>,
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
    private readonly usuariosService: UsuariosService,
  ) {}

  private gerarCodigoVincular(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }

  async criar(criarJogadorDto: CriarJogadorDto): Promise<Jogador> {
    this.logger.log(`Criando jogador | nome: ${criarJogadorDto.nome}`);
    const codigoVincular = this.gerarCodigoVincular();
    const jogador = new this.jogadorModel({
      ...criarJogadorDto,
      codigoVincular,
    });
    const salvo = await jogador.save();
    this.logger.log(`Jogador criado | id: ${salvo['_id']} | codigo: ${codigoVincular}`);
    return salvo;
  }

  async buscarTodos(): Promise<Jogador[]> {
    this.logger.log('Buscando todos os jogadores');
    return this.jogadorModel.find().populate('usuario').exec();
  }

  async buscarPorId(id: string): Promise<Jogador> {
    this.logger.debug(`Buscando jogador por id: ${id}`);
    const jogador = await this.jogadorModel
      .findById(id)
      .populate('usuario')
      .exec();
    if (!jogador) {
      this.logger.warn(`Jogador nao encontrado | id: ${id}`);
      throw new NotFoundException('Jogador não encontrado');
    }
    return jogador;
  }

  async atualizar(
    id: string,
    atualizarJogadorDto: AtualizarJogadorDto,
  ): Promise<Jogador> {
    this.logger.log(`Atualizando jogador | id: ${id} | campos: ${Object.keys(atualizarJogadorDto).join(', ')}`);
    const jogador = await this.jogadorModel
      .findByIdAndUpdate(id, atualizarJogadorDto, { new: true })
      .populate('usuario')
      .exec();
    if (!jogador) {
      this.logger.warn(`Jogador nao encontrado para atualizar | id: ${id}`);
      throw new NotFoundException('Jogador não encontrado');
    }
    return jogador;
  }

  async remover(id: string): Promise<Jogador> {
    this.logger.log(`Removendo jogador | id: ${id}`);
    const jogador = await this.jogadorModel.findByIdAndDelete(id).exec();
    if (!jogador) {
      this.logger.warn(`Jogador nao encontrado para remover | id: ${id}`);
      throw new NotFoundException('Jogador não encontrado');
    }
    this.logger.log(`Jogador removido | id: ${id} | nome: ${jogador.nome}`);
    return jogador;
  }

  async vincular(
    firebaseUid: string,
    codigoVincular: string,
  ): Promise<Jogador> {
    this.logger.log(`Vinculando jogador | codigo: ${codigoVincular} | firebaseUid: ${firebaseUid}`);
    const jogador = await this.jogadorModel.findOne({ codigoVincular }).exec();
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

    await this.usuarioModel.findByIdAndUpdate(usuario['_id'], {
      jogador: salvo['_id'],
    });
    this.logger.log(`Jogador vinculado com sucesso | id: ${salvo['_id']} | usuario: ${usuario['_id']}`);
    return salvo;
  }
}
