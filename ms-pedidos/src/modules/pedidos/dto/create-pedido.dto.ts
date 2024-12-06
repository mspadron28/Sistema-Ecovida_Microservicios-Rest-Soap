import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PedidoDetalleDto } from './pedido-detalle.dto';

export class CreatePedidoDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({each:true})
    @Type(() => PedidoDetalleDto)
    items: PedidoDetalleDto[]
}
