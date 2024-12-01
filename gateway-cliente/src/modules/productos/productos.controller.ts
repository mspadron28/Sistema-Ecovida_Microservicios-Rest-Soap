import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PRODUCT_SERVICE } from 'src/config';
import { ClientProxy } from '@nestjs/microservices';

@Controller('productos')
export class ProductosController {
  constructor(
    @Inject(PRODUCT_SERVICE) private readonly productsClient: ClientProxy,
  ) {}

  @Post()
  create(@Body() createProductoDto: CreateProductoDto) {
    return 
  }

  @Get()
  findAll() {
    return this.productsClient.send('findAllProductos',{})
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return 
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductoDto: UpdateProductoDto) {
    return 
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return 
  }
}
