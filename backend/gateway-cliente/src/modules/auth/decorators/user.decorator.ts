import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user) {
      throw new InternalServerErrorException('User not found in request (AuthGuard called?)');
    }

    // Si se solicita un campo específico, lo retorna
    if (data && typeof data === 'string') {
      return request.user[data];
    }

    return request.user; // Devuelve el objeto usuario completo
  },
);
