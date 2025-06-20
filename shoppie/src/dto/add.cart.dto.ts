/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsString, IsUUID, Min } from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  productId: string;

  @Min(1)
  quantity: number;
}
