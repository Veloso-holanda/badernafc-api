import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import firebaseApp from './firebase.provider';

@Injectable()
export class FirebaseAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    );
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

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