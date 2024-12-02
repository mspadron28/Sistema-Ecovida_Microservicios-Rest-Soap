import { Module } from '@nestjs/common';
import { ProductosController } from './productos.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [ProductosController],
  imports: [
    NatsModule
  ],
})
export class ProductosModule {}
