import { Module } from '@nestjs/common';

import { PrismaModule } from './modules/prisma/prisma.module';
import { ProductosModule } from './modules/productos/productos.module';

@Module({
  imports: [PrismaModule, ProductosModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
