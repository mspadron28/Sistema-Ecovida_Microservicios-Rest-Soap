import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  UseGuards,
  ParseIntPipe,
  Put,
} from '@nestjs/common';

import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../config';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards';
import { RoleGuard } from '../auth/guards';
import { Role } from '../auth/lib/roles.enum';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { catchError } from 'rxjs';
@Controller('productos')
export class ProductosController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @UseGuards(AuthGuard, RoleGuard)
  @Post() //Crear un producto
  @Roles(Role.GESTOR_PRODUCTOS)
  create(@Body() createProductoDto: CreateProductoDto) {
    return this.client.send('createProducto', createProductoDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Put('update/:id_producto') // ✅ Modificar un producto
  @Roles(Role.GESTOR_PRODUCTOS)
  update(
    @Param('id_producto', ParseIntPipe) id_producto: number,
    @Body() updateDto: CreateProductoDto,
  ) {
    return this.client.send('updateProducto', { id_producto, updateDto }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  //Se añade autenticacion
  @UseGuards(AuthGuard, RoleGuard)
  @Get() //Obtener todos los productos
  @Roles(Role.GESTOR_PRODUCTOS)
  findAll() {
    return this.client.send('findAllProductos', {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  //Obtener productos por nombre categoria
  @Get('categoria/:nombre')
  findByCategory(@Param('nombre') nombre: string) {
    return this.client.send('findProuctosByCategory', nombre).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
  //OBTENER PRODUCTOS CON STOCK
  @UseGuards(AuthGuard, RoleGuard)
  @Get('stock')
  @Roles(Role.GESTOR_PRODUCTOS, Role.USUARIO)
  findAllProductosStock() {
    //Obtener todos los productos con stock
    return this.client.send('findAllProductosStock', {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
  //OBTENER UN PRODUCTO EN ESPECIFICO CON STOCK
  @UseGuards(AuthGuard, RoleGuard)
  @Get('stock/:idProducto')
  @Roles(Role.GESTOR_PRODUCTOS, Role.USUARIO) // Permitir a usuarios y gestores consultar stock
  findStockByProductId(@Param('idProducto', ParseIntPipe) idProducto: number) {
    return this.client.send('findStockByProductId', idProducto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Get(':id')
  @Roles(Role.GESTOR_PRODUCTOS) //Obtener un producto
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.client.send('findOneProduct', id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Get('stock/:id')
  @Roles(Role.GESTOR_PRODUCTOS) //Obtener un producto
  findOneByStock(@Param('id', ParseIntPipe) id: number) {
    return this.client.send('findOneProductByStock', id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Patch() //Actualizar estado producto
  @Roles(Role.GESTOR_PRODUCTOS)
  updateStaus(@Body() updateProductoDto: UpdateProductoDto) {
    return this.client.send('actualizarStatusProducto', updateProductoDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
  @UseGuards(AuthGuard, RoleGuard)
  @Post('stock-minimo')
  @Roles(Role.GESTOR_PRODUCTOS) //Obtener productos con stock bajo
  findLowStockProducts(@Body() body: { minStock: number }) {
    return this.client.send('findLowStockProducts', body.minStock).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
