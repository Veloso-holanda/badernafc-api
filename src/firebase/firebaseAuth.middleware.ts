import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import firebaseApp from './firebase.provider';

@Injectable()
export class FirebaseAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    firebaseApp
      .auth()
      .verifyIdToken(token.replace('Bearer ', ''))
      .then((decodedToken: any) => {
        req['user'] = decodedToken;
        next();
      })
      .catch((e) => {
        console.log({ e });
        return res.status(403).json({ message: 'Token inválido' });
      });
  }
}