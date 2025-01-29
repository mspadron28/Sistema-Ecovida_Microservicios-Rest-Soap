import { BadRequestException, Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CarritosService } from './carritos.service';
import { CreateCarritoDto } from './dto';

@Controller()
export class CarritosController {
  constructor(private readonly carritosService: CarritosService) {}
  //Crear carrito + detalle
  @MessagePattern('createCarrito')
  create(@Payload() data: CreateCarritoDto) {
    const { items, idUser } = data;
    return this.carritosService.createOrUpdate(items, idUser);
  }

  //Actualizar según stock
  @MessagePattern('updateCarritoCantidad')
  updateCarritoCantidad(
    @Payload()
    data: {
      idUser: string;
      idProducto: number;
      stock: number;
      increase: boolean;
    },
  ) {
    const { idUser, idProducto, stock, increase } = data;
    return this.carritosService.updateCarritoCantidad(
      idUser,
      idProducto,
      stock,
      increase,
    );
  }

  //Remover carrito item según id producto
  @MessagePattern('removeCarritoItem')
  removeCarritoItem(@Payload() data: { idUser: string; idProducto: number }) {
    return this.carritosService.removeCarritoItem(data.idUser, data.idProducto);
  }

  @MessagePattern('findAllCarritos')
  findAll() {
    return this.carritosService.findAll();
  }

  @MessagePattern('findOneCarrito')
  findOne(@Payload() id: number) {
    return this.carritosService.findOne(id);
  }

  @MessagePattern('findCarritoByUserId')
  findCarritoByUserId(@Payload() idUser: string) {
    return this.carritosService.findCarritoByUserId(idUser);
  }
}
