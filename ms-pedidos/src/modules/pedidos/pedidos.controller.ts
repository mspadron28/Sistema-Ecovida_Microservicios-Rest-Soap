import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PedidosService } from './pedidos.service';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

import { CreatePedidoDto } from './dto';

@Controller()
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @MessagePattern('createPedido')
  create(@Payload() data: CreatePedidoDto) {
    const { items, idUser } = data;
    return this.pedidosService.create(items,idUser);
  }

  @MessagePattern('findAllPedidos')
  findAll() {
    return this.pedidosService.findAll();
  }

  @MessagePattern('findOnePedido')
  findOne(@Payload() id: number) {
    return this.pedidosService.findOne(id);
  }

  @MessagePattern('validatePedido')
  validate(@Payload() id: number) {
    return this.pedidosService.validateId(id);
  }

  @MessagePattern('updatePedido')
  update(@Payload() updatePedidoDto: UpdatePedidoDto) {
    return this.pedidosService.update(updatePedidoDto.id, updatePedidoDto);
  }

  @MessagePattern('removePedido')
  remove(@Payload() id: number) {
    return this.pedidosService.remove(id);
  }
}
