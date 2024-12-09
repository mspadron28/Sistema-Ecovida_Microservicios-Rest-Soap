import {
    IsInt,
    IsOptional,
    IsString,
    IsDateString,
    Length,
    MaxLength,
  } from 'class-validator';
  
  export class CreateEnvioDto {
    @IsInt({ message: 'El id_pedido debe ser un número entero.' })
    id_pedido: number;
  
    @IsOptional()
    @IsDateString({}, { message: 'La fecha_envio debe ser una fecha válida en formato ISO.' })
    fecha_envio?: string;
  
    @IsOptional()
    @IsDateString({}, { message: 'La fecha_entrega debe ser una fecha válida en formato ISO.' })
    fecha_entrega?: string;
  
    @IsString({ message: 'El estado debe ser una cadena de texto.' })
    @Length(1, 50, { message: 'El estado debe tener entre 1 y 50 caracteres.' })
    estado: string;
  
    @IsOptional()
    @IsString({ message: 'El metodo_envio debe ser una cadena de texto.' })
    @MaxLength(100, { message: 'El metodo_envio no puede exceder los 100 caracteres.' })
    metodo_envio?: string;
  }
  