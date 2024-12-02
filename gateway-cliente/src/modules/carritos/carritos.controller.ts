import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';

import { CreateCarritoDto } from './dto/create-carrito.dto';

import { ClientProxy, Payload } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';

@Controller('carritos')
export class CarritosController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  @Post()
  create(@Payload() createCarritoDto: CreateCarritoDto) {
    return this.client.send('createCarrito', createCarritoDto);
  }

  @Get()
  findAll() {
    return this.client.send('findAllCarritos',{})
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return 
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return 
  }
}
