/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable prettier/prettier */
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

import { ApiResponse } from '../interfaces/apiResponse';
import { LoginDto } from 'src/dto/loginUser.dto';
import { RegisterDto } from 'src/dto/registerUser.dto';
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

@Post('login')
@HttpCode(HttpStatus.OK)
async login(@Body() data: LoginDto): Promise<ApiResponse<{ token: string }>> {
  try {
    const result = await this.authService.login(data);
    return {
      success: true,
      message: 'User logged in successfully',
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Login failed',
    };
  }
}

@Post('register')
@HttpCode(HttpStatus.CREATED)
async register(@Body() data: RegisterDto): Promise<ApiResponse<any>> {
  try {
    const user = await this.authService.register(data);
    return {
      success: true,
      message: 'User registered successfully',
      data: user,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Registration failed',
      data: null,
    };
  }
}
}
