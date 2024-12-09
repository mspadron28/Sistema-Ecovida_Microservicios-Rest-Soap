import { Module } from '@nestjs/common';

import { EnviosController } from './envios.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [EnviosController],
  imports: [NatsModule],
})
export class EnviosModule {}
