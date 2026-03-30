import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JogadoresController } from './jogadores.controller';
import { JogadoresService } from './jogadores.service';
import { Jogador, JogadorSchema } from './schemas/jogador.schema';
import { Membro, MembroSchema } from '../times/schemas/membro.schema';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Jogador.name, schema: JogadorSchema },
      { name: Membro.name, schema: MembroSchema },
    ]),
    UsuariosModule,
    CommonModule,
  ],
  controllers: [JogadoresController],
  providers: [JogadoresService],
  exports: [JogadoresService],
})
export class JogadoresModule {}
