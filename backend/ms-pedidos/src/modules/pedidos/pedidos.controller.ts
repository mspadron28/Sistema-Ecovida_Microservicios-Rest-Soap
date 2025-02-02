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
    return this.pedidosService.create(items, idUser);
  }

   // ✅ Nuevo endpoint para cambiar el estado del pedido a "ENVIADO"
   @MessagePattern('updatePedidoStatus')
   updateStatus(@Payload() idPedido: number) {
     return this.pedidosService.updatePedidoStatus(idPedido);
   }

  @MessagePattern('findAllPedidos')
  findAll() {
    return this.pedidosService.findAll();
  }

  @MessagePattern('findOnePedido')
  findOne(@Payload() id: number) {
    return this.pedidosService.findOne(id);
  }
  //OBTENER PEDIDO POR USUARIO
  @MessagePattern('findPedidosByUserId')
  findPedidosByUserId(@Payload() idUser: string) {
    return this.pedidosService.findPedidosByUserId(idUser);
  }

  //Validar id de pedido
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
