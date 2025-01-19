import { Module } from '@nestjs/common';
import { PrismaModule } from './modules/prisma/prisma.module';
import { CarritosModule } from './modules/carritos/carritos.module';

@Module({
  imports: [PrismaModule, CarritosModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
