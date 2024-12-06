import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { PrismaService } from '../prisma/prisma.service';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PedidosService {
  
  constructor(private prisma: PrismaService,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  async create(createPedidoDto: CreatePedidoDto) {
    const logger = new Logger('PEDIDOS');
    try {
      // 1. Validar los IDs de los productos
      const productIds = createPedidoDto.items.map((item) => item.idProducto);
      const products: any[] = await firstValueFrom(
        this.client.send('validate_productos', productIds),
      );
  
      // 2. Actualizar stock en productos
      for (const item of createPedidoDto.items) {
        await firstValueFrom(
          this.client.send('actualizar_stock', {
            idProducto: item.idProducto,
            cantidad: item.cantidad,
          }),
        );
      }
  
      // 3. Calcular los valores totales del pedido
      let precioTotalPedido = 0;
      const detallePedidoData = createPedidoDto.items.map((pedidoItem) => {
        const product = products.find(p => p.id_producto === pedidoItem.idProducto);
        const subtotal = product.precio * pedidoItem.cantidad;
        precioTotalPedido += subtotal;
        return {
          precio_unitario: product.precio,
          id_producto: pedidoItem.idProducto,
          cantidad: pedidoItem.cantidad,
          subtotal,
        };
      });
  
      // Calcular la cantidad total de productos
      const cantidadTotalPedido = createPedidoDto.items.reduce((acc, item) => acc + item.cantidad, 0);
  
      // 4. Crear la transacción en la base de datos
      const pedido = await this.prisma.pedidos.create({
        data: {
          id_usuario: 1,
          fecha_pedido: new Date(),
          estado: 'PENDIENTE',
          precioTotalPedido,
          cantidadTotalPedido,
          detalle_pedido: {
            createMany: {
              data: detallePedidoData,
            },
          },
        },
        include: {
          detalle_pedido: true,
        },
      });
  
      // 5. Retornar el pedido con detalles de producto
      return {
        ...pedido,
        detalle_pedido: pedido.detalle_pedido.map((detalle) => ({
          ...detalle,
          nombre: products.find((p) => p.id_producto === detalle.id_producto)?.nombre,
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
        where: {id_pedido: id}
      })
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
        where: {id_pedido: id}
      })
    } catch (error) {
      throw new Error(`Error, no se pudo eliminar el pedido: ${error.message}`);
    }
  }
}
