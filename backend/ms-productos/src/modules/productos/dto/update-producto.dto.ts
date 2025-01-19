import { IsInt, IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateProductoDto {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}
