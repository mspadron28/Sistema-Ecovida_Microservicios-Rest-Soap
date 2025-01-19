import { Injectable ,Inject} from '@nestjs/common';
import { CreateEnvioDto } from './dto/create-envio.dto';
import { UpdateEnvioDto } from './dto/update-envio.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';
@Injectable()
export class EnviosService {
  
  constructor(private prisma: PrismaService,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  async create(createEnvioDto: CreateEnvioDto) {
    try {
      // Extraer el ID del pedido y los datos restantes
      const { id_pedido} = createEnvioDto;
  
      // Validar el pedido con NATS
      const validPedido = await firstValueFrom(
        this.client.send('validatePedido', id_pedido),
      );
  
      if (!validPedido) {
        throw new RpcException(`Pedido con ID ${id_pedido} no es válido.`);
      }
  
      // Crear el envío en la base de datos
      const nuevoEnvio = await this.prisma.envios.create({
        data: createEnvioDto,
      });
  
      return nuevoEnvio;
    } catch (error) {
      throw new RpcException(`Error al crear el envío: ${error.message}`);
    }
  }
  
  async findAll() {
    try {
      return await this.prisma.envios.findMany();
    } catch (error) {
      throw new Error(`Error, no existen envios: ${error.message}`);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} envio`;
  }

  update(id: number, updateEnvioDto: UpdateEnvioDto) {
    return `This action updates a #${id} envio`;
  }

  remove(id: number) {
    return `This action removes a #${id} envio`;
  }
}
