import { Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy, Payload, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { CreatePedidoDto } from './dto';
import { catchError } from 'rxjs';



@Controller('pedidos')
export class PedidosController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  @Post()
  create(@Payload() createPedidoDto: CreatePedidoDto) {
    return this.client.send('createPedido', createPedidoDto)
    .pipe(
      catchError(error=>{
        throw new RpcException(error)
      })
    );
  }
}
