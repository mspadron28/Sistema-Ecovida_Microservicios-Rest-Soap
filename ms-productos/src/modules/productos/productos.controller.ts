import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Controller()
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

   // Obtener productos con stock bajo
   @MessagePattern('findLowStockProducts')
   findLowStockProducts(@Payload() minStock: number ) {
     return this.productosService.findLowStockProducts(minStock);
   }

  //Validar los ids mediante un arreglo de ellos
  @MessagePattern('validate_productos')
  validateProduct(@Payload() ids: number[]){
    return this.productosService.validateProducts(ids);
  }
  // Actulizar stock de un producto
  @MessagePattern('actualizar_stock')
  updateProductStock(@Payload() data: { idProducto: number; cantidad: number }) {
    return this.productosService.updateProductStock(data);
  }

  // Crear un producto
  @MessagePattern('createProducto')
  create(@Payload() createProductoDto: CreateProductoDto) {
    return this.productosService.create(createProductoDto);
  }
  // Obtener todos los productos
  @MessagePattern('findAllProductos')
  findAll() {
    return this.productosService.findAll();
  }
  // Obtener todos los productos con su stock
  @MessagePattern('findAllProductosStock')
  findAllProductsWithStock() {
    return this.productosService.findAllProductsWithStock();
  }
  // Obtener un producto
  @MessagePattern('findOneProduct')
  findOne(@Payload() id: number) {
    return this.productosService.findOne(id);
  }

  // Obtener un producto con stock
  @MessagePattern('findOneProductByStock')
  findOneByStock(@Payload() id: number) {
    return this.productosService.findOneByStock(id);
  }

  // Actualizar el estado de un producto
  @MessagePattern('actualizarStatusProducto')
  updateProductStatus(@Payload() updateProductoDto: UpdateProductoDto) {
    return this.productosService.updateProductStatus(updateProductoDto);
  }
  


}
