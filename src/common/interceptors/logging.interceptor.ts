import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body, params, query } = req;
    const usuario = req.user?.uid ?? 'anonimo';
    const inicio = Date.now();

    this.logger.log(
      `→ ${method} ${url} | usuario: ${usuario}` +
        (Object.keys(params).length
          ? ` | params: ${JSON.stringify(params)}`
          : '') +
        (Object.keys(query).length
          ? ` | query: ${JSON.stringify(query)}`
          : '') +
        (body && Object.keys(body).length
          ? ` | body: ${JSON.stringify(body)}`
          : ''),
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const duracao = Date.now() - inicio;
          const res = context.switchToHttp().getResponse();
          this.logger.log(
            `← ${method} ${url} | ${res.statusCode} | ${duracao}ms`,
          );
        },
        error: (erro) => {
          const duracao = Date.now() - inicio;
          const status = erro.status || 500;
          this.logger.error(
            `← ${method} ${url} | ${status} | ${duracao}ms | ${erro.message}`,
          );
        },
      }),
    );
  }
}
