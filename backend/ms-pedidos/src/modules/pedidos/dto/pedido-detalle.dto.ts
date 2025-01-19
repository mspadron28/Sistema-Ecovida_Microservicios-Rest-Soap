import { IsNumber, IsPositive } from "class-validator";

export class PedidoDetalleDto {
    @IsPositive()
    @IsNumber()
    idProducto: number;

    @IsPositive()
    @IsNumber()
    cantidad: number;
}