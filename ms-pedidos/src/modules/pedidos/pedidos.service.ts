import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { PrismaService } from '../prisma/prisma.service';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PedidoDetalleDto } from './dto';

@Injectable()
export class PedidosService {
  constructor(
    private prisma: PrismaService,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  async create(items: PedidoDetalleDto[], idUser: string) {
    const logger = new Logger('Create-Pedidos+Detalle');

    if (!Array.isArray(items)) {
      logger.error('El payload no contiene un arreglo válido en "items"');
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: '"items" debe ser un arreglo válido.',
      });
    }
    try {
      // 1. Validar los IDs de los productos
      const productIds = items.map((item) => item.idProducto);
      const products: any[] = await firstValueFrom(
        this.client.send('validate_productos', productIds),
      );

      // 2. Actualizar stock en productos
      for (const item of items) {
        await firstValueFrom(
          this.client.send('actualizar_stock', {
            idProducto: item.idProducto,
            cantidad: item.cantidad,
          }),
        );
      }

      // 2. Calcular el total y añadir el iva
      const precioTotal = items.reduce((acc, pedidoItem) => {
        const price = products.find(
          (product) => product.id_producto === pedidoItem.idProducto,
        ).precio;

        return acc + price * pedidoItem.cantidad;
      }, 0);

      const iva = precioTotal*0.15;
      const precioTotalIva = precioTotal + iva;


      // 3. Calcular los valores totales del pedido

   

      // Calcular la cantidad total de productos
      const cantidadTotal = items.reduce(
        (acc, item) => acc + item.cantidad,
        0,
      );

      // 4. Crear la transacción en la base de datos
      const pedido = await this.prisma.pedidos.create({
        data: {
          id_usuario: idUser,
          fecha_pedido: new Date(),
          estado: 'PENDIENTE',
          precioTotalPedido:precioTotalIva,
          cantidadTotalPedido: cantidadTotal,
          detalle_pedido: {
            createMany: {
              data: items.map((pedidoItem)=>({
                precio_unitario: products.find(
                  (product) => product.id_producto === pedidoItem.idProducto,
                ).precio,
                id_producto:pedidoItem.idProducto,
                cantidad: pedidoItem.cantidad,
                subtotal: products.find(
                  (product) => product.id_producto === pedidoItem.idProducto,
                ).precio * pedidoItem.cantidad,
              })),
            },
          },
        },
        include: {
          detalle_pedido: {
            select: {
              id_producto: true,
              cantidad: true,
              precio_unitario: true,
              subtotal: true
            }
          }
        },
      });

      // 5. Retornar el pedido con detalles y nombre producto
      return {
        ...pedido,
        detalle_pedido: pedido.detalle_pedido.map((detalle) => ({
          ...detalle,
          nombre: products.find((producto) => producto.id_producto === detalle.id_producto)
            ?.nombre,
        })),
      };
    } catch (error) {
      logger.error('Error al crear el pedido', error.stack);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message || 'Error al crear el pedido',
      });
    }
  }

  async findAll() {
    try {
      return await this.prisma.pedidos.findMany();
    } catch (error) {
      throw new Error(`Error, no existen pedidos: ${error.message}`);
    }
  }

  async findOne(id: number) {
    try {
      return await this.prisma.pedidos.findUnique({
        where: { id_pedido: id },
      });
    } catch (error) {
      throw new Error(`Error, no se encontro el carrito: ${error.message}`);
    }
  }

  update(id: number, updatePedidoDto: UpdatePedidoDto) {
    return `This action updates a #${id} pedido`;
  }

  remove(id: number) {
    try {
      return this.prisma.pedidos.delete({
        where: { id_pedido: id },
      });
    } catch (error) {
      throw new Error(`Error, no se pudo eliminar el pedido: ${error.message}`);
    }
  }
}
