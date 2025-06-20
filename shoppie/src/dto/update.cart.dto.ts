/* eslint-disable prettier/prettier */
import { IsInt, IsUUID, Min } from 'class-validator';

export class UpdateCartQuantityDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  reduceBy: number;
}
