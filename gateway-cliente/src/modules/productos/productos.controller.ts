import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
} from '@nestjs/common';

import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';

@Controller('productos')
export class ProductosController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}
  /*
  @Post()
  create(@Body() createProductoDto: CreateProductoDto) {
    return 
  }*/

  @Get('all')
  findAll() {
    return this.client.send('findAllProductos', {});
  }

  @Get('stock')
  findAllProductosStock() {
    return this.client.send('findAllProductosStock', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return;
  }
  /*
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductoDto: UpdateProductoDto,
  ) {
    return;
  }*/

  @Delete(':id')
  remove(@Param('id') id: string) {
    return;
  }
}
