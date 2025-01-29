import { IsString } from 'class-validator';

export class FindCarritoByUserIdDto {
  @IsString()
  value: string;
}
