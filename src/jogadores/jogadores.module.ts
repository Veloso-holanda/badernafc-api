import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JogadoresController } from './jogadores.controller';
import { JogadoresService } from './jogadores.service';
import { Jogador, JogadorSchema } from './schemas/jogador.schema';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Jogador.name, schema: JogadorSchema },
      { name: Usuario.name, schema: UsuarioSchema },
    ]),
    UsuariosModule,
  ],
  controllers: [JogadoresController],
  providers: [JogadoresService],
  exports: [JogadoresService],
})
export class JogadoresModule {}
