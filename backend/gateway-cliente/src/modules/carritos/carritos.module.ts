import { Module } from '@nestjs/common';
import { CarritosController } from './carritos.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [CarritosController],
  imports: [
  NatsModule
  ],
})
export class CarritosModule {}
