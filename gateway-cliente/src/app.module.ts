import { Module } from '@nestjs/common';
import { ProductosModule } from './modules/productos/productos.module';
import { CarritosModule } from './modules/carritos/carritos.module';

@Module({
  imports: [ProductosModule, CarritosModule],
})
export class AppModule {}
