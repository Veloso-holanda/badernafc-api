import { Module, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseAuthMiddleware } from './firebase/firebaseAuth.middleware';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CicloMensalModule } from './ciclo-mensal/ciclo-mensal.module';
import { JogadoresModule } from './jogadores/jogadores.module';
import { PartidasModule } from './partidas/partidas.module';

@Module({
  imports: [
    // Configuração global de variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Conexão com MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    UsuariosModule,
    CicloMensalModule,
    JogadoresModule,
    PartidasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(FirebaseAuthMiddleware)
      .exclude('health', '/')
      .forRoutes('*');
  }
}