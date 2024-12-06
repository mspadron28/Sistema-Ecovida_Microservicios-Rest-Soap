import { IsNumber, IsPositive } from "class-validator";


export class CarritoDetalleDto {
    @IsPositive()
    @IsNumber()
    idProducto: number;

    @IsPositive()
    @IsNumber()
    cantidad: number;
    
    @IsPositive()
    @IsNumber()
    precioUnitario: number;
}
