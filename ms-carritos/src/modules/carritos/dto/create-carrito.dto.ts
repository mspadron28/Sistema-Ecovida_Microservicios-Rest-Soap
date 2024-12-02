import { IsPositive } from "class-validator";

export class CreateCarritoDto {

    @IsPositive()
    id_usuario: number;

    @IsPositive()
    carrito_detalle: any;


}
