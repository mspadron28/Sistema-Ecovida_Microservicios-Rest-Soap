import { Injectable } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductosService {

  constructor(private prisma: PrismaService) {}

  create(createProductoDto: CreateProductoDto) {
    return ;
  }

  findAll() {
    return this.prisma.productos.findMany();
  }

  findAllProductsWithStock(){
    return this.prisma.productos.findMany({
      select:{
        nombre: true,
        stock: true
      }
    })
  }

  findOne(id: number) {
    return `This action returns a #${id} producto`;
  }

  update(id: number, updateProductoDto: UpdateProductoDto) {
    return `This action updates a #${id} producto`;
  }

  remove(id: number) {
    return `This action removes a #${id} producto`;
  }
}
