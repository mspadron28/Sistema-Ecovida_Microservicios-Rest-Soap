import { Module } from '@nestjs/common';
import { ProductosModule } from './modules/productos/productos.module';
import { CarritosModule } from './modules/carritos/carritos.module';
import { NatsModule } from './transports/nats.module';
import { AuthModule } from './modules/auth/auth.module';
import { PedidosModule } from './modules/pedidos/pedidos.module';

@Module({
  imports: [ProductosModule, CarritosModule, NatsModule, AuthModule, PedidosModule],
})
export class AppModule {}
