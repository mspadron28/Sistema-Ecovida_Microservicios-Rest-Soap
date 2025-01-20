import { Module } from '@nestjs/common';
import { ProductosModule } from './modules/productos/productos.module';
import { CarritosModule } from './modules/carritos/carritos.module';
import { NatsModule } from './transports/nats.module';
import { AuthModule } from './modules/auth/auth.module';
import { PedidosModule } from './modules/pedidos/pedidos.module';
import { EnviosModule } from './modules/envios/envios.module';
import { CategoriasModule } from './modules/categorias/categorias.module';

@Module({
  imports: [ProductosModule, CarritosModule, NatsModule, AuthModule, PedidosModule, EnviosModule, CategoriasModule],
})
export class AppModule {}
