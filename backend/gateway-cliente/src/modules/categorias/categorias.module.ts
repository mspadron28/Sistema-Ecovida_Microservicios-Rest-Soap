import { Module } from '@nestjs/common';
import { CategoriasController } from './categorias.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [CategoriasController],
    imports: [
      NatsModule
    ],
})
export class CategoriasModule {}
