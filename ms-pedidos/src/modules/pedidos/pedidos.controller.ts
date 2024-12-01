import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Controller()
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @MessagePattern('createPedido')
  create(@Payload() createPedidoDto: CreatePedidoDto) {
    return this.pedidosService.create(createPedidoDto);
  }

  @MessagePattern('findAllPedidos')
  findAll() {
    return this.pedidosService.findAll();
  }

  @MessagePattern('findOnePedido')
  findOne(@Payload() id: number) {
    return this.pedidosService.findOne(id);
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
