import { IsInt, IsString, IsDecimal, IsNotEmpty, Min, Max, IsBoolean, Matches } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'El precio debe ser un número válido con hasta 2 decimales.',
  })
  @IsNotEmpty()
  precio: string; 

  @IsInt()
  @Min(0)
  stock: number;

  @IsInt()
  @IsNotEmpty()
  id_categoria: number;

  @IsBoolean()
  status?: boolean = true;
}
