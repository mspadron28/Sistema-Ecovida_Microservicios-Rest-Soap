import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RpcException } from '@nestjs/microservices';
import { LoginUserDto, RegisterUserDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { envs } from 'src/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // PARA FIRMAR JWT
  async signJWT(payload: JwtPayload) {
    return this.jwtService.signAsync(payload);
  }

  // PARA VERIFICAR TOKEN
  async verifyToken(token: string) {
    try {
      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.JWT_SECRET,
      });

      return {
        user: user,
        // Refresca el token si es necesario
        token: await this.signJWT(user),
      };
    } catch (error) {
      throw new RpcException({
        status: 401,
        message: 'Invalid token',
      });
    }
  }

  // PARA REGISTRAR USUARIOS
  async registerUser(registerUserDto: RegisterUserDto) {
    const { email, name, password, roles } = registerUserDto;
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (existingUser) {
        throw new RpcException({
          status: 400,
          message: 'User already exists',
        });
      }

      // Getionar la asignación de roles según nombres ingresados
      // Buscar los IDs de los roles especificados
      let roleIds: string[] = [];
      if (roles && roles.length > 0) {
        // Encontrar roles en base vs los de la petición
        const foundRoles = await this.prisma.role.findMany({
          where: { nombre: { in: roles } },
        });
        // Sino coinciden mostrar error
        if (foundRoles.length !== roles.length) {
          throw new RpcException({
            status: 400,
            message: 'Some roles are invalid or do not exist',
          });
        }
        //Almacenar los ids de los roles encontrados
        roleIds = foundRoles.map((role) => role.id);
      }

      // Crear el usuario con el rol asignado
      const userCreate = await this.prisma.user.create({
        data: {
          email,
          nombre: name,
          passwordHash: bcrypt.hashSync(password, 10),
          fechaRegistro: new Date(),
          activo: true,
          roles: roleIds, // Asignar los roles especificados
        },
      });

      const { passwordHash, fechaRegistro, activo, ...rest } = userCreate;

      return {
        user: rest,
        token: await this.signJWT(rest),
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  // PARA EL LOGIN
  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    try {
      // Buscar el usuario por correo electrónico
      const user = await this.prisma.user.findFirst({
        where: {
          email: email,
        },
      });

      if (!user) {
        throw new RpcException({
          status: 400,
          message: 'User or Password Invalid',
        });
      }

      // Validar contraseña
      const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new RpcException({
          status: 400,
          message: 'Password not valid',
        });
      }

      const { passwordHash, fechaRegistro, activo, ...rest } = user;

      return {
        user: rest,
        token: await this.signJWT(rest),
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }
}
