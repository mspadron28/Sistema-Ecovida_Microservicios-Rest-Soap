
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';

import { Type } from 'class-transformer';
import { CarritoDetalleDto } from './carrito-detalle.dto'; 

export class CreateCarritoDto {
@IsArray()
@ArrayMinSize(1)
//Validación de los elementos
@ValidateNested({each:true})
@Type(() => CarritoDetalleDto)
items: CarritoDetalleDto[]
}
