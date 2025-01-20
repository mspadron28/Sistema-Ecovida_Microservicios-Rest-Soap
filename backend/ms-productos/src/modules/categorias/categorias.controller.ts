import { Controller } from '@nestjs/common';
import { CategoriasService } from './categorias.service';

@Controller()
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}
}
