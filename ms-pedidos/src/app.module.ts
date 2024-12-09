import { Module } from '@nestjs/common';
import { PrismaModule } from './modules/prisma/prisma.module';
import { PedidosModule } from './modules/pedidos/pedidos.module';

@Module({
  imports: [PrismaModule, PedidosModule],
})
export class AppModule {}
