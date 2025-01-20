import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [ProductosController],
  providers: [ProductosService],
  imports: [NatsModule],
})
export class ProductosModule {}
