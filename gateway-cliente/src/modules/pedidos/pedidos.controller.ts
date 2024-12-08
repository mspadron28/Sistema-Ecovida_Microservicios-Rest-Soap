import { Controller, Inject, Logger, Post, UseGuards } from '@nestjs/common';
import { ClientProxy, Payload, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { CreatePedidoDto } from './dto';
import { catchError } from 'rxjs';
import { AuthGuard, RoleGuard } from '../auth/guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/lib/roles.enum';
import { User } from '../auth/decorators';



@Controller('pedidos')
export class PedidosController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}


  //Crear pedido + detalle
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.GESTOR_PEDIDOS)
  @Post('crear')
  create(@Payload() createPedidoDto: CreatePedidoDto, @User('id') idUser: string) {
    return this.client.send('createPedido',  { ...createPedidoDto, idUser })
    .pipe(
      catchError(error=>{
        throw new RpcException(error)
      })
    );
  }
}
