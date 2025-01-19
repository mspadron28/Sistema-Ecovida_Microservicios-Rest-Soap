
import { ArrayMinSize, IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

import { Type } from 'class-transformer';
import { CarritoDetalleDto } from './carrito-detalle.dto'; 

export class CreateCarritoDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({each:true})
    @Type(() => CarritoDetalleDto)
    items: CarritoDetalleDto[]

    @IsString()
    @IsNotEmpty({ message: 'El campo "idUser" no debe estar vacío.' })
    idUser: string;
}
