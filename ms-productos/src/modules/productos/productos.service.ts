import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RpcException } from '@nestjs/microservices';

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

  async validateProducts(ids: number[]) {
    // Estructura de datos sin duplicados
    ids = Array.from(new Set(ids));

    const products = await this.prisma.productos.findMany({
      where: {
        id_producto: {
          in: ids,
        },
      },
    });

    // VALIDACIÓN PARA QUE TAMAÑO IDS COINCIDAN CON PRODUCTS
    if (products.length !== ids.length) {
      throw new RpcException({
        message: 'Some products were not found',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return products;
  }

  update(id: number, updateProductoDto: UpdateProductoDto) {
    return `This action updates a #${id} producto`;
  }

  remove(id: number) {
    return `This action removes a #${id} producto`;
  }
}
