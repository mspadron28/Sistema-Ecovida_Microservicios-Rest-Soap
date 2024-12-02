import { IsNumber, IsPositive } from "class-validator";


export class CarritoDetalleDto {
    @IsPositive()
    @IsNumber()
    //@IsPositive()
    idProducto: number;
    @IsPositive()
    @IsNumber()
    //@IsPositive()
    cantidad: number;
    @IsPositive()
    @IsNumber()
    //@IsPositive()
    precioUnitario: number;
}
