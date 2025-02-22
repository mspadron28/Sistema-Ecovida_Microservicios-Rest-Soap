import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../config'; 
import { LoginUserDto, RegisterUserDto, UpdateUserDto } from './dto';

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
    return this.client.send('auth.register.user', registerUser).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Post('login')
  loginUser(@Body() loginUser: LoginUserDto) {
    return this.client.send('auth.login.user', loginUser).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Post('verify')
  @Roles(Role.ADMINISTRADOR, Role.USUARIO)
  verifyToken(@User() user: CurrentUser, @Token() token: string) {
    try {
      // Lógica principal
      return { user, token };
    } catch (error) {
      // Manejo de errores
      throw new RpcException(error);
    }
  }

  //Obtener todos los usuarios (Solo administradores)
  @UseGuards(AuthGuard, RoleGuard)
  @Get('users')
  @Roles(Role.ADMINISTRADOR)
  getAllUsers() {
    return this.client.send('auth.getAllUsers', {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  //MODIFICAR USUARIO (Solo Administradores)
  @UseGuards(AuthGuard, RoleGuard)
  @Patch('users/:id')
  @Roles(Role.ADMINISTRADOR)
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.client.send('auth.update.user', { id, updateUserDto }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

    // ✅ Toggle para activar/desactivar usuario (Soft Delete)
    @UseGuards(AuthGuard, RoleGuard)
    @Patch('users/:id/toggle-status')
    @Roles(Role.ADMINISTRADOR)
    toggleUserStatus(@Param('id') id: string) {
      return this.client.send('auth.toggleUserStatus', id).pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
    }
}
