import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  create(createProductoDto: CreateProductoDto) {
    return;
  }

  findAll() {
    const productos = this.prisma.productos.findMany();
    if (!productos) {
      throw new RpcException({
        message: 'Some products were not found',
        status: HttpStatus.BAD_REQUEST,
      });
    }
    return productos;
  }

  async findAllProductsWithStock() {
    const productos = await this.prisma.productos.findMany({
      select: {
        nombre: true,
        stock: true,
      },
    });
    if (!productos) {
      throw new RpcException({
        message: 'Some products were not found',
        status: HttpStatus.BAD_REQUEST,
      });
    }
    return productos;
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
        message: 'Algun id de un producto no esta en la base de datos',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return products;
  }

  async updateProductStock(data: { idProducto: number; cantidad: number }) {
    try {
      const { idProducto, cantidad } = data;
  
      // Validar que haya suficiente stock para el producto
      const product = await this.prisma.productos.findUnique({
        where: { id_producto: idProducto },
      });
  
      if (!product || product.stock < cantidad) {
        throw new RpcException({
          message: `Stock insuficiente para el producto con ID ${idProducto}`,
          status: HttpStatus.BAD_REQUEST,
        });
      }
  
      // Actualizar el stock del producto en la base de datos
      await this.prisma.productos.update({
        where: { id_producto: idProducto },
        data: { stock: { decrement: cantidad } },
      });
  
      return { message: 'Stock actualizado exitosamente' };
    } catch (error) {
      throw new RpcException({
        message: error.message || 'Error al actualizar el stock del producto',
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  update(id: number, updateProductoDto: UpdateProductoDto) {
    return `This action updates a #${id} producto`;
  }

  remove(id: number) {
    return `This action removes a #${id} producto`;
  }
}
