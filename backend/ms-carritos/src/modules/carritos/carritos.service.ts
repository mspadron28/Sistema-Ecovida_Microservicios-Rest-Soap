import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CarritoDetalleDto } from './dto';

@Injectable()
export class CarritosService {
  constructor(
    private prisma: PrismaService,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  /*async create(createCarritoDto: CreateCarritoDto,idUser:string) {
    const logger = new Logger('VALIDACION');
    logger.log('Payload recibido:', createCarritoDto);
    if (!createCarritoDto || !Array.isArray(createCarritoDto.items)) {
      logger.error('El payload no contiene un arreglo válido en "items"');
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: '"items" debe ser un arreglo válido.',
      });
    }
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
          id_usuario: idUser,
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
      
      logger.error('Error al crear el carrito', error.stack);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message || 'Error al crear el carrito',
      });
    }
  }
*/
  async create(items: CarritoDetalleDto[], idUser: string) {
    const logger = new Logger('Create-Carrito+Detalle');

    if (!Array.isArray(items)) {
      logger.error('El payload no contiene un arreglo válido en "items"');
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: '"items" debe ser un arreglo válido.',
      });
    }

    try {
      // 1. Confirmar los ids de los productos
      const productIds = items.map((item) => item.idProducto);
      const products: any[] = await firstValueFrom(
        this.client.send('validate_productos', productIds),
      );
   
      // 2. Calcular los valores totales del carrito
      const precioTotal = items.reduce((acc, carritoItem) => {
        const price = products.find(
          (product) => product.id_producto === carritoItem.idProducto,
        ).precio;

        return acc + price * carritoItem.cantidad;
      }, 0);
      // Obtener todos los productos
      const cantidadTotal = items.reduce(
        (acc, carritoItem) => acc + carritoItem.cantidad,
        0,
      );

      // 3. Crear la transacción de base de datos
      const carrito = await this.prisma.carrito.create({
        data: {
          id_usuario: idUser,
          precioTotal: precioTotal,
          cantidadTotal: cantidadTotal,
          carrito_detalle: {
            createMany: {
              data: items.map((carritoItem) => ({
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
      logger.error('Error al crear el carrito', error.stack);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message || 'Error al crear el carrito',
      });
    }
  }

  async findAll() {
    try {
      // 1. Obtener todos los carritos con sus detalles
      const carritos = await this.prisma.carrito.findMany({
        include: {
          carrito_detalle: {
            select: {
              id_producto: true,
              cantidad: true,
              precio_unitario: true,
            },
          },
        },
      });

      if (!carritos.length) {
        throw new Error('No existen carritos.');
      }

      // 2. Obtener los ids de los productos relacionados
      const productIds = carritos.flatMap((carrito) =>
        carrito.carrito_detalle.map((detalle) => detalle.id_producto),
      );

      // 3. Consultar información de los productos (nombres)
      const products = await firstValueFrom(
        this.client.send('validate_productos', productIds),
      );

      // 4. Reemplazar id_producto por nombre en los detalles del carrito
      const carritosConNombres = carritos.map((carrito) => ({
        ...carrito,
        carrito_detalle: carrito.carrito_detalle.map((detalle) => ({
          ...detalle,
          nombre: products.find(
            (product) => product.id_producto === detalle.id_producto,
          )?.nombre,
        })),
      }));

      return carritosConNombres;
    } catch (error) {
      throw new Error(`Error al obtener los carritos: ${error.message}`);
    }
  }

  async findOne(id: number) {
    try {
      // 1. Buscar el carrito con sus detalles
      const carrito = await this.prisma.carrito.findUnique({
        where: { id_carrito: id },
        include: {
          carrito_detalle: {
            select: {
              id_producto: true,
              cantidad: true,
              precio_unitario: true,
            },
          },
        },
      });
  
      if (!carrito) {
        throw new Error('Carrito no encontrado.');
      }
  
      // 2. Obtener los IDs de los productos del carrito
      const productIds = carrito.carrito_detalle.map((detalle) => detalle.id_producto);
  
      // 3. Consultar los nombres de los productos relacionados
      const products = await firstValueFrom(
        this.client.send('validate_productos', productIds),
      );
  
      // 4. Mapear los detalles para incluir los nombres de los productos
      const carritoConNombre = {
        ...carrito,
        carrito_detalle: carrito.carrito_detalle.map((detalle) => ({
          ...detalle,
          nombre: products.find(
            (product) => product.id_producto === detalle.id_producto,
          )?.nombre,
        })),
      };
  
      return carritoConNombre;
    } catch (error) {
      throw new Error(`Error al buscar el carrito: ${error.message}`);
    }
  }
  
}
