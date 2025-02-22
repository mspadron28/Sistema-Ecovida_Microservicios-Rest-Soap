
import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
  import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from '../../../config';
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(
        @Inject(NATS_SERVICE) private readonly client: ClientProxy,
      ) {}


    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      //Función para extraer Token del encabezado
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException('Token not found');
      }
      try {
       //PARA OBTENER la peticion DESDE EL MS AUTH
        const {user, token:newToken} = await firstValueFrom(
            this.client.send('auth.verify.user',token)
        )

        request['user'] = user

        request['token'] = newToken;
      } catch {
        throw new UnauthorizedException();
      }
      return true;
    }
  
    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }
  