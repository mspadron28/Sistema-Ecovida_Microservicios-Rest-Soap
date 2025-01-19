import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [PedidosController],
  providers: [PedidosService],
  imports: [NatsModule],
})
export class PedidosModule {}
