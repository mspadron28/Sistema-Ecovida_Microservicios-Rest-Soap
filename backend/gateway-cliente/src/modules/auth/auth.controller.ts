import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { LoginUserDto, RegisterUserDto } from './dto';

import { Token, User } from './decorators';
import { CurrentUser } from './interfaces/current-user.interface';
import { catchError } from 'rxjs';
import { Roles } from './decorators/roles.decorator';
import { Role } from './lib/roles.enum';
import { AuthGuard, RoleGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  //@UseGuards(AuthGuard, RoleGuard)
  @Post('register')
  //@Roles(Role.ADMINISTRADOR,Role.USUARIO)
  registerUser(@Body() registerUser: RegisterUserDto) {
    return this.client.send('auth.register.user', registerUser)
    .pipe(
      catchError(error=>{
        throw new RpcException(error)
      })
    );
  }

  @Post('login')
  loginUser(@Body() loginUser: LoginUserDto) {
    return this.client.send('auth.login.user', loginUser)
    .pipe(
      catchError(error=>{
        throw new RpcException(error)
      })
    );
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @Post('verify')
  @Roles(Role.ADMINISTRADOR, Role.GESTOR_ENVIOS,Role.USUARIO)
  verifyToken(@User() user: CurrentUser, @Token() token: string) {
    try {
      // Lógica principal
      return { user, token };
    } catch (error) {
      // Manejo de errores
      throw new RpcException(error);
    }
    
  }
}
