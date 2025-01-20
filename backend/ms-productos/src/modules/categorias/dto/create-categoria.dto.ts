import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,-]+$/, {
    message: 'El nombre contiene caracteres no permitidos.',
  })
  nombre: string;
}
