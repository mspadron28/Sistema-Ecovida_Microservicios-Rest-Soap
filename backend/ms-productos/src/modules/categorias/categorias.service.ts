import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoriaDto: CreateCategoriaDto) {
    try {
      const categoria = await this.prisma.categorias.create({
        data: createCategoriaDto,
      });

      return { message: 'Categoria creada exitosamente', categoria };
    } catch (error) {
      throw new RpcException({
        message: error.message || 'Error al crear la categoria.',
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  // Obtener todas las categorías
  async findAll() {
    try {
      const categorias = await this.prisma.categorias.findMany({
        select: {
          id_categoria: true,
          nombre: true,
        },
      });

      if (!categorias.length) {
        throw new RpcException({
          message: 'No se encontraron categorías.',
          status: HttpStatus.NOT_FOUND,
        });
      }

      return categorias;
    } catch (error) {
      throw new RpcException({
        message: error.message || 'Error al obtener las categorías.',
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  // Obtener una categoría por ID
  async findOne(nombre: string) {
    try {
      const categoria = await this.prisma.categorias.findFirst({
        where: { nombre },
        select: {
          id_categoria: true,
          nombre: true,
        },
      });

      if (!categoria) {
        throw new RpcException({
          message: 'Categoría no encontrada.',
          status: HttpStatus.NOT_FOUND,
        });
      }

      return categoria;
    } catch (error) {
      throw new RpcException({
        message: error.message || 'Error al obtener la categoría.',
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }
}
