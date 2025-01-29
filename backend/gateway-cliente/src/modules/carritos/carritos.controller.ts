import {
  Controller,
  Get,
  Post,
  Param,
  Inject,
  UseGuards,
  Logger,
  ParseIntPipe,
  Body,
} from '@nestjs/common';

import { CreateCarritoDto } from './dto/create-carrito.dto';

import { ClientProxy, Payload, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { AuthGuard, RoleGuard } from '../auth/guards';
import { User } from '../auth/decorators';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/lib/roles.enum';
import { catchError } from 'rxjs';
import { FindCarritoByUserIdDto } from './dto';

@Controller('carritos')
export class CarritosController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  //Crear carrito + detalle
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.GESTOR_PEDIDOS, Role.USUARIO)
  @Post('crear')
  create(
    @Payload() createCarritoDto: CreateCarritoDto,
    @User('id') idUser: string,
  ) {
    const logger = new Logger('Revisar payload de dto:');
    logger.log(`Spread operator ${createCarritoDto}`);
    return this.client
      .send('createCarrito', { ...createCarritoDto, idUser })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }
  //Obtener todos los carritos + detalle
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.GESTOR_PEDIDOS, Role.USUARIO)
  @Get('all')
  findAll() {
    return this.client.send('findAllCarritos', {});
  }
  // Actualizar un carrito + detalle según stock
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.GESTOR_PEDIDOS, Role.USUARIO)
  @Post('actualizar-cantidad')
  updateCarritoCantidad(
    @Body() data: { idProducto: number; stock: number; increase: boolean },
    @User('id') idUser: string,
  ) {
    return this.client.send('updateCarritoCantidad', { idUser, ...data }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
  //Remover carrito item según id producto
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.GESTOR_PEDIDOS, Role.USUARIO)
  @Post('eliminar-item')
  removeCarritoItem(
    @Body() data: { idProducto: number },
    @User('id') idUser: string,
  ) {
    return this.client.send('removeCarritoItem', { idUser, ...data }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.GESTOR_PEDIDOS, Role.USUARIO)
  @Get('user')
  findCarritoByUserId(@User('id') idUser: string) {
    return this.client.send('findCarritoByUserId', idUser).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  //Obtener un carrito + detalle
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.GESTOR_PEDIDOS, Role.USUARIO)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.client.send('findOneCarrito', id);
  }
}
