import { Module } from '@nestjs/common';
import { PrismaModule } from './modules/prisma/prisma.module';
import { EnviosModule } from './modules/envios/envios.module';

@Module({
  imports: [PrismaModule, EnviosModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
