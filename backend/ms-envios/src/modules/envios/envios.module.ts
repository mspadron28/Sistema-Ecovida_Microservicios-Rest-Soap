import { Module } from '@nestjs/common';
import { EnviosService } from './envios.service';
import { EnviosController } from './envios.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [EnviosController],
  providers: [EnviosService],
  imports: [NatsModule],
})
export class EnviosModule {}
