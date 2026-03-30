import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import firebaseApp from './firebase.provider';

@Injectable()
export class FirebaseAuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger('FirebaseAuth');

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;

    if (!token) {
      this.logger.warn(`Token ausente | ${req.method} ${req.url}`);
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    firebaseApp
      .auth()
      .verifyIdToken(token.replace('Bearer ', ''))
      .then((decodedToken: any) => {
        req['user'] = decodedToken;
        this.logger.debug(
          `Autenticado: ${decodedToken.uid} | ${req.method} ${req.url}`,
        );
        next();
      })
      .catch((e) => {
        this.logger.error(
          `Token inválido | ${req.method} ${req.url} | ${e.message}`,
        );
        return res.status(403).json({ message: 'Token inválido' });
      });
  }
}
