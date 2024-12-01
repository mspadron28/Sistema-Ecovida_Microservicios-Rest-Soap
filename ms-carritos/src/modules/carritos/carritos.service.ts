import { Injectable } from '@nestjs/common';
import { CreateCarritoDto } from './dto/create-carrito.dto';
import { UpdateCarritoDto } from './dto/update-carrito.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CarritosService {

  constructor(private prisma: PrismaService) {}

  create(createCarritoDto: CreateCarritoDto) {
    return 'This action adds a new carrito';
  }

  findAll() {
    return `This action returns all carritos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} carrito`;
  }

  update(id: number, updateCarritoDto: UpdateCarritoDto) {
    return `This action updates a #${id} carrito`;
  }

  remove(id: number) {
    return `This action removes a #${id} carrito`;
  }
}