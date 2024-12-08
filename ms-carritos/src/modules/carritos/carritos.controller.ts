import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CarritosService } from './carritos.service';
import { UpdateCarritoDto } from './dto/update-carrito.dto';
import { CreateCarritoDto } from './dto';


@Controller()
export class CarritosController {
  constructor(private readonly carritosService: CarritosService) {}

  @MessagePattern('createCarrito')
  create(@Payload() data: CreateCarritoDto) {
    const { items, idUser } = data;
    return this.carritosService.create(items,idUser);
  }

  @MessagePattern('findAllCarritos')
  findAll() {
    return this.carritosService.findAll();
  }

  @MessagePattern('findOneCarrito')
  findOne(@Payload() id: number) {
    return this.carritosService.findOne(id);
  }

  @MessagePattern('updateCarrito')
  update(@Payload() updateCarritoDto: UpdateCarritoDto) {
    return this.carritosService.update(updateCarritoDto.id, updateCarritoDto);
  }

  @MessagePattern('removeCarrito')
  remove(@Payload() id: number) {
    return this.carritosService.remove(id);
  }
}
