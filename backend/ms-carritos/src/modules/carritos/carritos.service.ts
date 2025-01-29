import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CarritoDetalleDto } from './dto';

interface UpdatedItem {
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
}

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
  async createOrUpdate(items: CarritoDetalleDto[], idUser: string) {
  const logger = new Logger('CreateOrUpdate-Carrito+Detalle');

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

    // 2. Buscar si ya existe un carrito para este usuario
    const existingCarrito  = await this.prisma.carrito.findFirst({
      where: { id_usuario: idUser },
      include: {
        carrito_detalle: true, // Incluye los detalles existentes
      },
    });

    if (existingCarrito) {
      // Actualizar el carrito existente
      const updatedItems: UpdatedItem[] = existingCarrito.carrito_detalle.map((detalle) => ({
        id_producto: detalle.id_producto,
        cantidad: detalle.cantidad,
        precio_unitario: Number(detalle.precio_unitario), // Convertimos Decimal a number
      }));
      items.forEach((newItem) => {
        const existingItem = updatedItems.find(
          (item) => item.id_producto === newItem.idProducto,
        );

        if (existingItem) {
          // Si el producto ya está en el carrito, actualiza la cantidad
          existingItem.cantidad += newItem.cantidad;
        } else {
          // Si no está en el carrito, añádelo
          updatedItems.push({
            id_producto: newItem.idProducto,
            cantidad: newItem.cantidad,
            precio_unitario: products.find(
              (product) => product.id_producto === newItem.idProducto,
            ).precio,
          });
        }
      });

      // Calcular nuevos totales
      const precioTotal = updatedItems.reduce(
        (acc, item) => acc + item.precio_unitario * item.cantidad,
        0,
      );
      const cantidadTotal = updatedItems.reduce((acc, item) => acc + item.cantidad, 0);

      // Actualizar el carrito en la base de datos
      const updatedCarrito = await this.prisma.carrito.update({
        where: { id_carrito: existingCarrito.id_carrito },
        data: {
          precioTotal,
          cantidadTotal,
          carrito_detalle: {
            deleteMany: {}, // Elimina los detalles antiguos
            createMany: {
              data: updatedItems.map((item) => ({
                id_producto: item.id_producto,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario,
              })),
            },
          },
        },
        include: {
          carrito_detalle: true,
        },
      });

      return updatedCarrito;
    } else {
      // Crear un nuevo carrito
      const precioTotal = items.reduce((acc, carritoItem) => {
        const price = products.find(
          (product) => product.id_producto === carritoItem.idProducto,
        ).precio;

        return acc + price * carritoItem.cantidad;
      }, 0);

      const cantidadTotal = items.reduce(
        (acc, carritoItem) => acc + carritoItem.cantidad,
        0,
      );

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
          carrito_detalle: true,
        },
      });

      return carrito;
    }
  } catch (error) {
    logger.error('Error al crear o actualizar el carrito', error.stack);
    throw new RpcException({
      status: HttpStatus.BAD_REQUEST,
      message: error.message || 'Error al crear o actualizar el carrito',
    });
  }
}

//CAMBIAR EL STOCK SEGUN DISMINUYA O AUMENTE CANTIDAD
async updateCarritoCantidad(idUser: string, idProducto: number, stock: number, increase: boolean) {

  try {
    // Buscar el carrito del usuario
    const carrito = await this.prisma.carrito.findFirst({
      where: { id_usuario: idUser },
      include: { carrito_detalle: true },
    });

    if (!carrito) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'El carrito no existe.',
      });
    }

    // Buscar el producto en el carrito
    const item = carrito.carrito_detalle.find((detalle) => detalle.id_producto === idProducto);

    if (!item) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'El producto no está en el carrito.',
      });
    }

    // Ajustar cantidad según `increase`
    let nuevaCantidad = increase ? item.cantidad + stock : item.cantidad - stock;

    // Asegurar que no haya cantidades negativas
    if (nuevaCantidad < 0) {
      nuevaCantidad = 0;
    }

    // Actualizar la cantidad en la base de datos
    await this.prisma.carrito_detalle.update({
      where: { id_detalle: item.id_detalle },
      data: { cantidad: nuevaCantidad },
    });

    // Recalcular los totales del carrito
    const nuevosDetalles = await this.prisma.carrito_detalle.findMany({
      where: { id_carrito: carrito.id_carrito },
    });

    const precioTotal = nuevosDetalles.reduce(
      (acc, item) => acc + Number(item.precio_unitario) * item.cantidad,
      0,
    );
    const cantidadTotal = nuevosDetalles.reduce((acc, item) => acc + item.cantidad, 0);

    await this.prisma.carrito.update({
      where: { id_carrito: carrito.id_carrito },
      data: {
        precioTotal,
        cantidadTotal,
      },
    });

    return { mensaje: 'Cantidad actualizada', nuevaCantidad };
    
  } catch (error) {
    throw new RpcException({
      status: HttpStatus.BAD_REQUEST,
      message: error.message || 'Error al actualizar la cantidad en el carrito',
    });
  }
}
//REMOVER UN CARRITO ITEM SEGUN ID PRODUCTO
async removeCarritoItem(idUser: string, idProducto: number) {
  try {
    // Buscar el carrito del usuario
    const carrito = await this.prisma.carrito.findFirst({
      where: { id_usuario: idUser },
      include: { carrito_detalle: true },
    });

    if (!carrito) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'El carrito no existe.',
      });
    }

    // Buscar el producto en el carrito
    const item = carrito.carrito_detalle.find(
      (detalle) => detalle.id_producto === idProducto
    );

    if (!item) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'El producto no está en el carrito.',
      });
    }

    // Eliminar el producto del carrito
    await this.prisma.carrito_detalle.delete({
      where: { id_detalle: item.id_detalle },
    });

    // Recalcular los totales del carrito
    const nuevosDetalles = await this.prisma.carrito_detalle.findMany({
      where: { id_carrito: carrito.id_carrito },
    });

    const precioTotal = nuevosDetalles.reduce(
      (acc, item) => acc + Number(item.precio_unitario) * item.cantidad,
      0
    );
    const cantidadTotal = nuevosDetalles.reduce(
      (acc, item) => acc + item.cantidad,
      0
    );

    // Actualizar el carrito en la base de datos
    await this.prisma.carrito.update({
      where: { id_carrito: carrito.id_carrito },
      data: {
        precioTotal,
        cantidadTotal,
      },
    });

    return { mensaje: 'Producto eliminado del carrito', idProducto };
  } catch (error) {
    throw new RpcException({
      status: HttpStatus.BAD_REQUEST,
      message: error.message || 'Error al eliminar el producto del carrito',
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

  async findCarritoByUserId(idUser: string) {
    try {
      // Buscar el carrito basado en el id_usuario
      const carrito = await this.prisma.carrito.findFirst({
        where: { id_usuario: idUser }
      });
  
      if (!carrito) {
        throw new Error('No se encontró un carrito para este usuario.');
      }
  
      // Usar el método existente para obtener detalles del carrito
      return this.findOne(carrito.id_carrito);
    } catch (error) {
      throw new Error(`Error al buscar el carrito del usuario: ${error.message}`);
    }
  }
  
  
}
