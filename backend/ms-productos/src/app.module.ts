import { Module } from '@nestjs/common';

import { PrismaModule } from './modules/prisma/prisma.module';
import { ProductosModule } from './modules/productos/productos.module';
import { CategoriasModule } from './modules/categorias/categorias.module';

@Module({
  imports: [PrismaModule, ProductosModule, CategoriasModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
