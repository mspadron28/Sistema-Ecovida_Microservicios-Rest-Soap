import { Module } from '@nestjs/common';
import { CarritosController } from './carritos.controller';
import { CARRITOS_SERVICE, envs } from 'src/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  controllers: [CarritosController],
  imports: [
    ClientsModule.register([
      { 
        name: CARRITOS_SERVICE,
        transport: Transport.TCP,
        options: {
          host: envs.carritosMicroserviceHost,
          port: envs.carritosMicroservicePort
        }
        
      },
    ]),
  ],
})
export class CarritosModule {}
