import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
  ) {}

  async criar(
    firebaseUid: string,
    criarUsuarioDto: CriarUsuarioDto,
  ): Promise<Usuario> {
    const existente = await this.usuarioModel.findOne({ firebaseUid });
    if (existente) {
      throw new ConflictException('Usuário já cadastrado');
    }

    const usuario = new this.usuarioModel({ firebaseUid, ...criarUsuarioDto });
    return usuario.save();
  }

  async buscarTodos(): Promise<Usuario[]> {
    return this.usuarioModel.find().exec();
  }

  async buscarPorFirebaseUid(firebaseUid: string): Promise<Usuario> {
    const usuario = await this.usuarioModel.findOne({ firebaseUid }).exec();
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return usuario;
  }

  async buscarPorId(id: string): Promise<Usuario> {
    const usuario = await this.usuarioModel.findById(id).exec();
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return usuario;
  }

  async atualizar(
    firebaseUid: string,
    atualizarUsuarioDto: AtualizarUsuarioDto,
  ): Promise<Usuario> {
    const usuario = await this.usuarioModel
      .findOneAndUpdate({ firebaseUid }, atualizarUsuarioDto, { new: true })
      .exec();
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return usuario;
  }

  async remover(firebaseUid: string): Promise<Usuario> {
    const usuario = await this.usuarioModel
      .findOneAndDelete({ firebaseUid })
      .exec();
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return usuario;
  }
}
