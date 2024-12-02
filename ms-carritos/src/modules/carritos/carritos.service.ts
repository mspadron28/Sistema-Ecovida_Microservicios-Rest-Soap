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

  async findAll() {
    try {
      return await this.prisma.carrito.findMany();
    } catch (error) {
      throw new Error(`Error, no existen carritos: ${error.message}`);
    }
  }

  async findOne(id: number) {
    try {
      return await this.prisma.carrito.findUnique({
        where: {id_carrito: id}
      })
    } catch (error) {
      throw new Error(`Error, no se encontro el carrito: ${error.message}`);
    }
  }

  update(id: number, updateCarritoDto: UpdateCarritoDto) {
    return `This action updates a #${id} carrito`;
  }

  remove(id: number) {
    try {
      return this.prisma.carrito.delete({
        where: {id_carrito: id}
      })
    } catch (error) {
      throw new Error(`Error, no se pudo eliminar el carrito: ${error.message}`);
    }
  }
}
