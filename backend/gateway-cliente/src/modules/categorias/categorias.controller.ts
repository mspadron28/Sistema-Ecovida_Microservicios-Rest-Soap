import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  UseGuards,
  ParseIntPipe,
  Put,
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
  @Roles(Role.GESTOR_PRODUCTOS, Role.ADMINISTRADOR)
  create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return this.client.send('createCategoria', createCategoriaDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Get() // Obtener todas las categorías
  @Roles(Role.GESTOR_PRODUCTOS,Role.USUARIO,Role.ADMINISTRADOR)
  findAll() {
    return this.client.send('findAllCategorias', {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  // Actualizar la categoría
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.GESTOR_PRODUCTOS,Role.ADMINISTRADOR)
  @Put('update/:id_categoria')
  update(
    @Param('id_categoria', ParseIntPipe) id_categoria: number,
    @Body() updateDto: { nombre: string },
  ) {
    return this.client
      .send('updateCategoria', { id_categoria, updateDto })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.GESTOR_PRODUCTOS, Role.USUARIO,Role.ADMINISTRADOR)
  @Get(':nombre') // Obtener una categoría por ID
  findOne(@Param('nombre') nombre: string) {
    return this.client.send('findOneCategoria', nombre).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
