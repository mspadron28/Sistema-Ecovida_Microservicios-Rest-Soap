import {
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy, Payload, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../config';
import { CreatePedidoDto } from './dto';
import { catchError } from 'rxjs';
import { AuthGuard, RoleGuard } from '../auth/guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/lib/roles.enum';
import { User } from '../auth/decorators';

@Controller('pedidos')
export class PedidosController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  //Validar id de pedido
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.GESTOR_PEDIDOS)
  @Get('validar/:id')
  validate(@Param('id', ParseIntPipe) id: number) {
    return this.client.send('validatePedido', id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  //ACTUALIZAR ESTADO A ENVIADO 
    // ✅ Endpoint para actualizar estado del pedido a "ENVIADO"
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(Role.GESTOR_PEDIDOS)
    @Patch(':id/enviar')
    updateStatus(@Param('id', ParseIntPipe) id: number) {
      return this.client.send('updatePedidoStatus', id).pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
    }

  //Crear pedido + detalle
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.GESTOR_PEDIDOS, Role.USUARIO)
  @Post('crear')
  create(
    @Payload() createPedidoDto: CreatePedidoDto,
    @User('id') idUser: string,
  ) {
    return this.client
      .send('createPedido', { ...createPedidoDto, idUser })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.USUARIO)
  @Get('usuario')
  findPedidosByUser(@User('id') idUser: string) {
    return this.client.send('findPedidosByUserId', idUser).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  //Obtener todos los pedidos + detalle
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.GESTOR_PEDIDOS)
  @Get()
  findAll() {
    return this.client.send('findAllPedidos', {});
  }

  //Obtener un pedido + detalle
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.GESTOR_PEDIDOS, Role.USUARIO)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.client.send('findOnePedido', id);
  }
}
