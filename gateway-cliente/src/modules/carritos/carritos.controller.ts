import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';

import { CreateCarritoDto } from './dto/create-carrito.dto';
import { UpdateCarritoDto } from './dto/update-carrito.dto';
import { CARRITOS_SERVICE } from 'src/config';
import { ClientProxy } from '@nestjs/microservices';

@Controller('carritos')
export class CarritosController {
  constructor(
    @Inject(CARRITOS_SERVICE) private readonly carritosClient: ClientProxy,
  ) {}

  @Post()
  create(@Body() createCarritoDto: CreateCarritoDto) {
    return
  }

  @Get()
  findAll() {
    return this.carritosClient.send('findAllCarritos',{})
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return 
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarritoDto: UpdateCarritoDto) {
    return 
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return 
  }
}
