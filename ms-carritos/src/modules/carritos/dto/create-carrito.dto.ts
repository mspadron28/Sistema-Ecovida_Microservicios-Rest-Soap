import { IsPositive } from "class-validator";

export class CreateCarritoDto {

    @IsPositive()
    id_usuario: number;


    carrito_detalle: any;


}
