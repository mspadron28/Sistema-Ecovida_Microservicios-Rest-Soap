import { Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy, Payload, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { CreatePedidoDto } from './dto';
import { catchError } from 'rxjs';
import { AuthGuard, RoleGuard } from '../auth/guards';



@Controller('pedidos')
export class PedidosController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}


  //Crear pedido + detalle
  @UseGuards(AuthGuard, RoleGuard)
  @Post('crear')
  create(@Payload() createPedidoDto: CreatePedidoDto) {
    return this.client.send('createPedido', createPedidoDto)
    .pipe(
      catchError(error=>{
        throw new RpcException(error)
      })
    );
  }
}
