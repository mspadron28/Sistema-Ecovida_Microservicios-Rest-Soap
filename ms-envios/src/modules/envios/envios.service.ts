import { Injectable } from '@nestjs/common';
import { CreateEnvioDto } from './dto/create-envio.dto';
import { UpdateEnvioDto } from './dto/update-envio.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnviosService {
  
  constructor(private prisma: PrismaService) {}

  create(createEnvioDto: CreateEnvioDto) {
    return 'This action adds a new envio';
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
