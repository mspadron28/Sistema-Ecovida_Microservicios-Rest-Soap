import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { NATS_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProductosService {
  constructor(
    private prisma: PrismaService,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}
  //Crear producto
  async create(createProductoDto: CreateProductoDto) {
    try {
      const producto = await this.prisma.productos.create({
        data: createProductoDto,
      });

      return { message: 'Producto creado exitosamente', producto };
    } catch (error) {
      throw new RpcException({
        message: error.message || 'Error al crear el producto.',
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }
  //Obtener todos los productos
  async findAll() {
    try {
      const productos = await this.prisma.productos.findMany({
        select: {
          id_producto: true,
          nombre: true,
          precio: true,
          stock: true,
          status: true,
        },
      });

      if (!productos.length) {
        throw new RpcException({
          message: 'No se encontraron productos.',
          status: HttpStatus.NOT_FOUND,
        });
      }

      return productos;
    } catch (error) {
      throw new RpcException({
        message: error.message || 'Error al obtener los productos.',
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }
  // Obtener productos por categoría
  // Obtener productos por nombre de categoría
  async findByCategory(nombreCategoria: string) {
    try {
      // Obtener el ID de la categoría desde el servicio de categorías
      const categoria = await firstValueFrom(
        this.client.send('findOneCategoria', nombreCategoria),
      );

      if (!categoria || !categoria.id_categoria) {
        throw new RpcException({
          message: `No se encontró la categoría con el nombre ${nombreCategoria}.`,
          status: HttpStatus.NOT_FOUND,
        });
      }

      const productos = await this.prisma.productos.findMany({
        where: {
          id_categoria: categoria.id_categoria,
        },
        select: {
          id_producto: true,
          nombre: true,
          precio: true,
          stock: true,
          status: true,
        },
      });

      if (!productos.length) {
        throw new RpcException({
          message: `No se encontraron productos para la categoría con nombre ${nombreCategoria}.`,
          status: HttpStatus.NOT_FOUND,
        });
      }

      return productos;
    } catch (error) {
      throw new RpcException({
        message:
          error.message || 'Error al obtener los productos por categoría.',
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  //Editar status producto
  async updateProductStatus(updateProductoDto: UpdateProductoDto) {
    const { id, status } = updateProductoDto;
    try {
      const product = await this.prisma.productos.findUnique({
        where: { id_producto: id },
      });

      if (!product) {
        throw new RpcException({
          message: `Producto con ID ${id} no encontrado.`,
          status: HttpStatus.NOT_FOUND,
        });
      }

      await this.prisma.productos.update({
        where: { id_producto: id },
        data: { status },
      });

      return {
        message: `Estado del producto actualizado a ${status ? 'disponible' : 'no disponible'}.`,
      };
    } catch (error) {
      throw new RpcException({
        message: error.message || 'Error al actualizar el estado del producto.',
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  //Encontrar todos los productos con stock
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
  //Encontrar todos los productos
  async findOne(id: number) {
    try {
      const producto = await this.prisma.productos.findUnique({
        where: { id_producto: id },
        select: {
          id_producto: true,
          stock: true,
          precio: true,
          status: true,
        },
      });

      if (!producto) {
        throw new Error('Producto no encontrado.');
      }
      return producto;
    } catch (error) {
      throw new Error(`Error al buscar el producto: ${error.message}`);
    }
  }
  //Encontrar todos los productos con stock
  async findOneByStock(id: number) {
    try {
      const producto = await this.prisma.productos.findUnique({
        where: { id_producto: id },
        select: {
          nombre: true,
          stock: true,
        },
      });

      if (!producto) {
        throw new Error('Producto no encontrado.');
      }
      return producto;
    } catch (error) {
      throw new Error(`Error al buscar el producto: ${error.message}`);
    }
  }
  //Validar que los productos coincidan con lo de la base de datos y tenga estado activo
  async validateProducts(ids: number[]) {
    // Estructura de datos sin duplicados
    ids = Array.from(new Set(ids));

    const products = await this.prisma.productos.findMany({
      where: {
        id_producto: {
          in: ids,
        },
        status: true,
      },
    });

    // VALIDACIÓN PARA QUE TAMAÑO IDS COINCIDAN CON PRODUCTS
    if (products.length !== ids.length) {
      throw new RpcException({
        message:
          'Algun id de un producto no esta en la base de datos o esta inactivo',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return products;
  }
  //Actualiza stock producto
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

  // Obtener productos con stock menor a un valor dado
  async findLowStockProducts(minStock: number) {
    try {
      const productos = await this.prisma.productos.findMany({
        where: {
          stock: {
            lt: minStock, // Stock menor al mínimo especificado
          },
        },
        select: {
          id_producto: true,
          nombre: true,
          stock: true,
        },
      });

      if (!productos.length) {
        throw new RpcException({
          message: `No se encontraron productos con stock menor a ${minStock}.`,
          status: HttpStatus.NOT_FOUND,
        });
      }

      return productos;
    } catch (error) {
      throw new RpcException({
        message: error.message || 'Error al obtener productos con bajo stock.',
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }
}
