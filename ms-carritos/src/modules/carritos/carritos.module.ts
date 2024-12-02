import { Module } from '@nestjs/common';
import { CarritosService } from './carritos.service';
import { CarritosController } from './carritos.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [CarritosController],
  providers: [CarritosService],
  imports: [NatsModule],
})
export class CarritosModule {}
