import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
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

      const iva = precioTotal * 0.15;
      const precioTotalIva = precioTotal + iva;

      // 3. Calcular los valores totales del pedido

      // Calcular la cantidad total de productos
      const cantidadTotal = items.reduce((acc, item) => acc + item.cantidad, 0);

      // 4. Crear la transacción en la base de datos
      const pedido = await this.prisma.pedidos.create({
        data: {
          id_usuario: idUser,
          fecha_pedido: new Date(),
          estado: 'PENDIENTE',
          precioTotalPedido: precioTotalIva,
          cantidadTotalPedido: cantidadTotal,
          detalle_pedido: {
            createMany: {
              data: items.map((pedidoItem) => ({
                precio_unitario: products.find(
                  (product) => product.id_producto === pedidoItem.idProducto,
                ).precio,
                id_producto: pedidoItem.idProducto,
                cantidad: pedidoItem.cantidad,
                subtotal:
                  products.find(
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
              subtotal: true,
            },
          },
        },
      });

      // 5. Retornar el pedido con detalles y nombre producto
      return {
        ...pedido,
        detalle_pedido: pedido.detalle_pedido.map((detalle) => ({
          ...detalle,
          nombre: products.find(
            (producto) => producto.id_producto === detalle.id_producto,
          )?.nombre,
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
      // 1. Obtener todos los pedidos con sus detalles
      const pedidos = await this.prisma.pedidos.findMany({
        include: {
          detalle_pedido: {
            select: {
              id_producto: true,
              cantidad: true,
              precio_unitario: true,
              subtotal: true,
            },
          },
        },
      });

      if (!pedidos.length) {
        throw new Error('No existen pedidos.');
      }

      // 2. Obtener los IDs de los productos relacionados
      const productIds = pedidos.flatMap((pedido) =>
        pedido.detalle_pedido.map((detalle) => detalle.id_producto),
      );

      // 3. Consultar información de los productos (nombres)
      const products = await firstValueFrom(
        this.client.send('validate_productos', productIds),
      );

      // 4. Reemplazar id_producto por nombre en los detalles del pedido
      const pedidosConNombres = pedidos.map((pedido) => ({
        ...pedido,
        detalle_pedido: pedido.detalle_pedido.map((detalle) => ({
          ...detalle,
          nombre: products.find(
            (product) => product.id_producto === detalle.id_producto,
          )?.nombre,
        })),
      }));

      return pedidosConNombres;
    } catch (error) {
      throw new Error(`Error al obtener los pedidos: ${error.message}`);
    }
  }

  //OBTENER PEDIDOS DE UN USUARIO 
  async findPedidosByUserId(idUser: string) {
    try {
      // Obtener todos los pedidos de un usuario específico junto con sus detalles
      const pedidos = await this.prisma.pedidos.findMany({
        where: {
          id_usuario: idUser,
        },
        include: {
          detalle_pedido: {
            select: {
              id_producto: true,
              cantidad: true,
              precio_unitario: true,
              subtotal: true,
            },
          },
        },
      });
  
      if (!pedidos.length) {
        throw new Error('No se encontraron pedidos para este usuario.');
      }
  
      // Obtener los IDs de los productos relacionados
      const productIds = pedidos.flatMap((pedido) =>
        pedido.detalle_pedido.map((detalle) => detalle.id_producto),
      );
  
      // Consultar información de los productos (nombres)
      const products = await firstValueFrom(
        this.client.send('validate_productos', productIds),
      );
  
      // Reemplazar `id_producto` por `nombre` en los detalles del pedido
      const pedidosConNombres = pedidos.map((pedido) => ({
        ...pedido,
        detalle_pedido: pedido.detalle_pedido.map((detalle) => ({
          ...detalle,
          nombre: products.find(
            (product) => product.id_producto === detalle.id_producto,
          )?.nombre,
        })),
      }));
  
      return pedidosConNombres;
    } catch (error) {
      throw new RpcException({
        message: `Error al obtener los pedidos del usuario: ${error.message}`,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  //VALIDAR EXISTENCIA PEDIDO  

  async validateId(id: number) {
    try {
      // 1. validar id con base de datos
      const pedido = await this.prisma.pedidos.findUnique({
        where: { id_pedido: id },
        select: {
          id_pedido: true,
        },
      });

      if (!pedido) {
        throw new Error(`Id ${id} del pedido no encontrado.`);
      }

      return pedido;
    } catch (error) {
      throw new Error(`Error al buscar el pedido: ${error.message}`);
    }
  }

  //ACTUALIZAR ESTADO A ENVIADO
  // Método para cambiar el estado del pedido a "ENVIADO"
  async updatePedidoStatus(idPedido: number) {
    const logger = new Logger('Update-Pedido-Status');
    try {
      // Buscar el pedido
      const pedido = await this.prisma.pedidos.findUnique({
        where: { id_pedido: idPedido },
      });

      if (!pedido) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: `No se encontró el pedido con ID ${idPedido}`,
        });
      }

      if (pedido.estado !== 'PENDIENTE') {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Solo se pueden enviar pedidos en estado PENDIENTE',
        });
      }

      // Actualizar el estado del pedido a "ENVIADO"
      const pedidoActualizado = await this.prisma.pedidos.update({
        where: { id_pedido: idPedido },
        data: { estado: 'ENVIADO' },
      });

      return {
        status: HttpStatus.OK,
        message: `Pedido #${idPedido} marcado como ENVIADO`,
        pedido: pedidoActualizado,
      };
    } catch (error) {
      logger.error(`Error al actualizar estado del pedido ${idPedido}`, error.stack);
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Error al actualizar el estado del pedido',
      });
    }
  }

  async findOne(id: number) {
    try {
      // 1. Buscar el pedido con sus detalles
      const pedido = await this.prisma.pedidos.findUnique({
        where: { id_pedido: id },
        include: {
          detalle_pedido: {
            select: {
              id_producto: true,
              cantidad: true,
              precio_unitario: true,
              subtotal: true,
            },
          },
        },
      });

      if (!pedido) {
        throw new Error('Pedido no encontrado.');
      }

      // 2. Obtener los IDs de los productos del pedido
      const productIds = pedido.detalle_pedido.map(
        (detalle) => detalle.id_producto,
      );

      // 3. Consultar los nombres de los productos relacionados
      const products = await firstValueFrom(
        this.client.send('validate_productos', productIds),
      );

      // 4. Mapear los detalles para incluir los nombres de los productos
      const pedidoConNombre = {
        ...pedido,
        detalle_pedido: pedido.detalle_pedido.map((detalle) => ({
          ...detalle,
          nombre: products.find(
            (product) => product.id_producto === detalle.id_producto,
          )?.nombre,
        })),
      };

      return pedidoConNombre;
    } catch (error) {
      throw new Error(`Error al buscar el pedido: ${error.message}`);
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
