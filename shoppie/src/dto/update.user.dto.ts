/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { Role } from 'generated/prisma';

import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must be at most 50 characters long' })
  @Transform(({ value }) => value.trim())
  name?: string;

  // for email
  @IsOptional()
  @IsEmail({}, { message: 'Please input a valid email' })
  @Transform(({ value }) => value.trim())
  email?: string;

  // for password
  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(50, { message: 'Password must be at most 50 characters long' })
  @Transform(({ value }) => value.trim())
  password?: string;

  // for role
  @IsOptional()
  @IsEnum(Role, { message: 'Invalid role' })
  role?: string;
}
