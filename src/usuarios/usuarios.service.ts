import {
  Injectable,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);

  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
  ) {}

  async criar(
    firebaseUid: string,
    criarUsuarioDto: CriarUsuarioDto,
  ): Promise<Usuario> {
    this.logger.log(`Criando usuario | firebaseUid: ${firebaseUid}`);
    const existente = await this.usuarioModel.findOne({ firebaseUid });
    if (existente) {
      this.logger.warn(`Usuario ja existe | firebaseUid: ${firebaseUid}`);
      throw new ConflictException('Usuário já cadastrado');
    }

    const usuario = new this.usuarioModel({ firebaseUid, ...criarUsuarioDto });
    const salvo = await usuario.save();
    this.logger.log(`Usuario criado | id: ${salvo['_id']}`);

    return salvo;
  }

  async buscarTodos(): Promise<Usuario[]> {
    this.logger.log('Buscando todos os usuarios');
    return this.usuarioModel.find().exec();
  }

  async buscarPorFirebaseUid(firebaseUid: string): Promise<Usuario> {
    this.logger.debug(`Buscando usuario por firebaseUid: ${firebaseUid}`);
    const usuario = await this.usuarioModel.findOne({ firebaseUid }).exec();
    if (!usuario) {
      this.logger.warn(`Usuario nao encontrado | firebaseUid: ${firebaseUid}`);
      throw new NotFoundException('Usuário não encontrado');
    }
    return usuario;
  }

  async buscarPorId(id: string): Promise<Usuario> {
    this.logger.debug(`Buscando usuario por id: ${id}`);
    const usuario = await this.usuarioModel.findById(id).exec();
    if (!usuario) {
      this.logger.warn(`Usuario nao encontrado | id: ${id}`);
      throw new NotFoundException('Usuário não encontrado');
    }
    return usuario;
  }

  async atualizar(
    firebaseUid: string,
    atualizarUsuarioDto: AtualizarUsuarioDto,
  ): Promise<Usuario> {
    this.logger.log(
      `Atualizando usuario | firebaseUid: ${firebaseUid} | campos: ${Object.keys(atualizarUsuarioDto).join(', ')}`,
    );
    const usuario = await this.usuarioModel
      .findOneAndUpdate({ firebaseUid }, atualizarUsuarioDto, { new: true })
      .exec();
    if (!usuario) {
      this.logger.warn(
        `Usuario nao encontrado para atualizar | firebaseUid: ${firebaseUid}`,
      );
      throw new NotFoundException('Usuário não encontrado');
    }
    return usuario;
  }

  async remover(firebaseUid: string): Promise<Usuario> {
    this.logger.log(`Removendo usuario | firebaseUid: ${firebaseUid}`);
    const usuario = await this.usuarioModel
      .findOneAndDelete({ firebaseUid })
      .exec();
    if (!usuario) {
      this.logger.warn(
        `Usuario nao encontrado para remover | firebaseUid: ${firebaseUid}`,
      );
      throw new NotFoundException('Usuário não encontrado');
    }
    this.logger.log(`Usuario removido | id: ${usuario['_id']}`);
    return usuario;
  }
}
