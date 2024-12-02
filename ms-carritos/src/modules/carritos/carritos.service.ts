import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateCarritoDto } from './dto/create-carrito.dto';
import { UpdateCarritoDto } from './dto/update-carrito.dto';
import { PrismaService } from '../prisma/prisma.service';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CarritosService {
  constructor(
    private prisma: PrismaService,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  async create(createCarritoDto: CreateCarritoDto) {
    const logger = new Logger('VALIDACION');
    try {
      // 1. Confirmar los ids de los productos
      const productIds = createCarritoDto.items.map((item) => item.idProducto);
      const products: any[] = await firstValueFrom(
        this.client.send('validate_productos', productIds),
      );
      // 1.1 Disminuir stock en productos
      for (const item of createCarritoDto.items) {
        await firstValueFrom(
          this.client.send('actualizar_stock', {
            idProducto: item.idProducto,
            cantidad: item.cantidad,
          }),
        );
      }

      // 2. Calcular los valores totales del carrito
      const precioTotal = createCarritoDto.items.reduce((acc, carritoItem) => {
        const price = products.find(
          (product) => product.id_producto === carritoItem.idProducto,
        ).precio;

        return acc + price * carritoItem.cantidad;
      }, 0);
      // Obtener todos los productos
      const cantidadTotal = createCarritoDto.items.reduce(
        (acc, carritoItem) => {
          return acc + carritoItem.cantidad;
        },
        0,
      );
      // 3. Crear la transacción de base de datos
      const carrito = await this.prisma.carrito.create({
        data: {
          id_usuario: 1,
          precioTotal: precioTotal,
          cantidadTotal: cantidadTotal,
          carrito_detalle: {
            createMany: {
              data: createCarritoDto.items.map((carritoItem) => ({
                precio_unitario: products.find(
                  (product) => product.id_producto === carritoItem.idProducto,
                ).precio,
                id_producto: carritoItem.idProducto,
                cantidad: carritoItem.cantidad,
              })),
            },
          },
        },
        include: {
          carrito_detalle: {
            select: {
              id_detalle: true,
              precio_unitario: true,
              cantidad: true,
              id_producto: true,
            },
          },
        },
      });

      // 4. Retornar el carrito con detalles, incluyendo nombres de los productos
      return {
        ...carrito,
        carrito_detalle: carrito.carrito_detalle.map((detalle) => ({
          ...detalle,
          nombre: products.find(
            (product) => product.id_producto === detalle.id_producto,
          ).nombre,
        })),
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message || 'Error al crear el carrito',
      });
    }
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
        where: { id_carrito: id },
      });
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
        where: { id_carrito: id },
      });
    } catch (error) {
      throw new Error(
        `Error, no se pudo eliminar el carrito: ${error.message}`,
      );
    }
  }
}
