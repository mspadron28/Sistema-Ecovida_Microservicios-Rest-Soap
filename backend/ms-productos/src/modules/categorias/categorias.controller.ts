import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';

@Controller()
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  // Crear una categoría
  @MessagePattern('createCategoria')
  create(@Payload() createCategoriaDto: CreateCategoriaDto) {
    return this.categoriasService.create(createCategoriaDto);
  }

  // Obtener todas las categorías
  @MessagePattern('findAllCategorias')
  findAll() {
    return this.categoriasService.findAll();
  }

  // Obtener una categoría por ID
  @MessagePattern('findOneCategoria')
  findOne(@Payload() nombre: string) {
    return this.categoriasService.findOne(nombre);
  }
}
