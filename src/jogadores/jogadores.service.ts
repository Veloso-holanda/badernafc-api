import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Jogador, JogadorDocument } from './schemas/jogador.schema';
import { CriarJogadorDto } from './dto/criar-jogador.dto';
import { AtualizarJogadorDto } from './dto/atualizar-jogador.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import { randomBytes } from 'crypto';

@Injectable()
export class JogadoresService {
  constructor(
    @InjectModel(Jogador.name) private jogadorModel: Model<JogadorDocument>,
    private readonly usuariosService: UsuariosService,
  ) {}

  private gerarCodigoVincular(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }

  async criar(criarJogadorDto: CriarJogadorDto): Promise<Jogador> {
    const codigoVincular = this.gerarCodigoVincular();
    const jogador = new this.jogadorModel({
      ...criarJogadorDto,
      codigoVincular,
    });
    return jogador.save();
  }

  async buscarTodos(): Promise<Jogador[]> {
    return this.jogadorModel.find().populate('usuario').exec();
  }

  async buscarPorId(id: string): Promise<Jogador> {
    const jogador = await this.jogadorModel
      .findById(id)
      .populate('usuario')
      .exec();
    if (!jogador) {
      throw new NotFoundException('Jogador nao encontrado');
    }
    return jogador;
  }

  async atualizar(
    id: string,
    atualizarJogadorDto: AtualizarJogadorDto,
  ): Promise<Jogador> {
    const jogador = await this.jogadorModel
      .findByIdAndUpdate(id, atualizarJogadorDto, { new: true })
      .populate('usuario')
      .exec();
    if (!jogador) {
      throw new NotFoundException('Jogador nao encontrado');
    }
    return jogador;
  }

  async remover(id: string): Promise<Jogador> {
    const jogador = await this.jogadorModel.findByIdAndDelete(id).exec();
    if (!jogador) {
      throw new NotFoundException('Jogador nao encontrado');
    }
    return jogador;
  }

  async vincular(firebaseUid: string, codigoVincular: string): Promise<Jogador> {
    const jogador = await this.jogadorModel.findOne({ codigoVincular }).exec();
    if (!jogador) {
      throw new NotFoundException('Codigo de vinculo invalido');
    }

    if (jogador.vinculado) {
      throw new ConflictException('Jogador ja vinculado a outro usuario');
    }

    const usuario = await this.usuariosService.buscarPorFirebaseUid(firebaseUid);

    jogador.usuario = usuario['_id'];
    jogador.email = usuario.email;
    jogador.telefone = usuario['telefone'] || '';
    jogador.vinculado = true;

    return jogador.save();
  }
}
