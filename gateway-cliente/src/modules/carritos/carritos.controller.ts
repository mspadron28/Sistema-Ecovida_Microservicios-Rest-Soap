import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, UseGuards, Logger } from '@nestjs/common';

import { CreateCarritoDto } from './dto/create-carrito.dto';

import { ClientProxy, Payload, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { AuthGuard, RoleGuard } from '../auth/guards';
import { User } from '../auth/decorators';
import { CurrentUser } from '../auth/interfaces/current-user.interface';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/lib/roles.enum';
import { catchError } from 'rxjs';

@Controller('carritos')
export class CarritosController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}
  
  //Crear carrito + detalle
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.GESTOR_PEDIDOS)
  @Post('crear')
  create(@Payload() createCarritoDto: CreateCarritoDto, @User('id') idUser: string) {
    const logger = new Logger('Revisar payload de dto:');
    logger.log(`Spread operator ${createCarritoDto}`);
    return this.client.send('createCarrito', { ...createCarritoDto, idUser })
    .pipe(
      catchError(error=>{
        throw new RpcException(error)
      })
    );
  }

  @Get()
  findAll() {
    return this.client.send('findAllCarritos',{})
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return 
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return 
  }
}
