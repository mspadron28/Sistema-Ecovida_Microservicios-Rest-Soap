import { IsNumber, IsPositive } from "class-validator";

export class PedidoDetalleDto {
    @IsPositive()
    @IsNumber()
    idProducto: number;

    @IsPositive()
    @IsNumber()
    cantidad: number;
    
    //NO ES NECESARIO COLOCAR EL PRECIO, ya se saca desde la base de productos
}