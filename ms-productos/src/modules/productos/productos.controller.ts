import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Controller()
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @MessagePattern('createProducto')
  create(@Payload() createProductoDto: CreateProductoDto) {
    return this.productosService.create(createProductoDto);
  }

  @MessagePattern('findAllProductos')
  findAll() {
    return this.productosService.findAll();
  }

  @MessagePattern('findAllProductosStock')
  findAllProductsWithStock() {
    return this.productosService.findAllProductsWithStock();
  }

  @MessagePattern('findOneProducto')
  findOne(@Payload() id: number) {
    return this.productosService.findOne(id);
  }

  @MessagePattern('updateProducto')
  update(@Payload() updateProductoDto: UpdateProductoDto) {
    return this.productosService.update(
      updateProductoDto.id,
      updateProductoDto,
    );
  }

  @MessagePattern('removeProducto')
  remove(@Payload() id: number) {
    return this.productosService.remove(id);
  }
}
