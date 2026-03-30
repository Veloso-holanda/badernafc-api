import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const MembroAtual = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.membro;
  },
);
