import { Injectable } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PedidosService {
  
  constructor(private prisma: PrismaService) {}

  create(createPedidoDto: CreatePedidoDto) {
    return 'This action adds a new pedido';
  }

  async findAll() {
    try {
      return await this.prisma.pedidos.findMany();
    } catch (error) {
      throw new Error(`Error, no existen carritos: ${error.message}`);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} pedido`;
  }

  update(id: number, updatePedidoDto: UpdatePedidoDto) {
    return `This action updates a #${id} pedido`;
  }

  remove(id: number) {
    return `This action removes a #${id} pedido`;
  }
}
