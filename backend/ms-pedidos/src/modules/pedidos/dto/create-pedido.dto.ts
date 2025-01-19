import { ArrayMinSize, IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PedidoDetalleDto } from './pedido-detalle.dto';

export class CreatePedidoDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({each:true})
    @Type(() => PedidoDetalleDto)
    items: PedidoDetalleDto[]

    @IsString()
    @IsNotEmpty({ message: 'El campo "idUser" no debe estar vacío.' })
    idUser: string;
}
