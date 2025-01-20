import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards';
import { RoleGuard } from '../auth/guards';
import { Role } from '../auth/lib/roles.enum';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { catchError } from 'rxjs';

@Controller('categorias')
export class CategoriasController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @UseGuards(AuthGuard, RoleGuard)
  @Post() // Crear una categoría
  @Roles(Role.GESTOR_PRODUCTOS)
  create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return this.client.send('createCategoria', createCategoriaDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  //@UseGuards(AuthGuard, RoleGuard)
  @Get() // Obtener todas las categorías
  //@Roles(Role.GESTOR_PRODUCTOS)
  findAll() {
    return this.client.send('findAllCategorias', {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get(':nombre') // Obtener una categoría por ID
  findOne(@Param('nombre',) nombre: string) {
    return this.client.send('findOneCategoria', nombre).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
