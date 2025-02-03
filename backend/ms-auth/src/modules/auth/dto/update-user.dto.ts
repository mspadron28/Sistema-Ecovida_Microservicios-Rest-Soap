import { IsOptional, IsString, IsArray, ArrayNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  roles?: string[];
}
