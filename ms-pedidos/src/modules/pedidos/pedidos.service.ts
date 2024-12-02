import { Inject, Injectable } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { PrismaService } from '../prisma/prisma.service';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PedidosService {
  
  constructor(private prisma: PrismaService,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

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
      throw new Error(`Error, no se pudo eliminar el carrito: ${error.message}`);
    }
  }
}
