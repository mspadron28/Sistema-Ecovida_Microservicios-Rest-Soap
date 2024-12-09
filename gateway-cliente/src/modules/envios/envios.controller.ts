import { Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy, Payload, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { NATS_SERVICE } from 'src/config';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard, RoleGuard } from '../auth/guards';
import { Role } from '../auth/lib/roles.enum';
import { CreateEnvioDto } from './dto/create-envio.dto';


@Controller('envios')
export class EnviosController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}
  @Get()
  findAll() {
    return this.client.send('findAllEnvios', {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  //Metodo para crer envio pasando el usuario
 @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.GESTOR_PEDIDOS)
  @Post('crear')
  create(@Payload() createEnvioDto: CreateEnvioDto) {
    return this.client.send('createEnvio',  createEnvioDto)
    .pipe(
      catchError(error=>{
        throw new RpcException(error)
      })
    );
  }
}
