/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';

export enum Category {
  ELECTRONICS = 'ELECTRONICS',
  FASHION = 'FASHION',
  BOOKS = 'BOOKS',
  GROCERIES = 'GROCERIES',
  TOYS = 'TOYS',
  HOME = 'HOME',
  BEAUTY = 'BEAUTY',
  SPORTS = 'SPORTS',
  OTHER = 'OTHER',
  VEHICLES = 'VEHICLES',
}

export enum ProductStatus {
  AVAILABLE = 'AVAILABLE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED',
  COMING_SOON = 'COMING_SOON',
}

export enum ProductSize {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL',
}

export enum ProductColor {
  RED = 'RED',
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  BLACK = 'BLACK',
  WHITE = 'WHITE',
  GRAY = 'GRAY',
  YELLOW = 'YELLOW',
  PINK = 'PINK',
  ORANGE = 'ORANGE',
  PURPLE = 'PURPLE',
  BROWN = 'BROWN',
}

export class CreateProductDto {
  @IsString({ message: 'Product name must be a string' })
  @IsNotEmpty({ message: 'Product name is required' })
  @Transform(({ value }) => value.trim())
  name: string;

  @IsString({ message: 'Product description must be a string' })
  @IsNotEmpty({ message: 'Product description is required' })
  @Transform(({ value }) => value.trim())
  description: string;

  @IsNumber({}, { message: 'Price must be a number' })
  @Min(1)
  price: number;

  @IsOptional()
  @IsString()
  image: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsEnum(ProductSize)
  size?: ProductSize;

  @IsOptional()
  @IsEnum(ProductColor)
  color?: ProductColor;
}
