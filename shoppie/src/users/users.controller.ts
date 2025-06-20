/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { RequirePermissions } from 'src/auth/decorator/permission.decorator';
import { Permission } from 'src/permissions/permission.enum';
import { RegisterDto } from 'src/dto/registerUser.dto';
import { ApiResponse } from 'src/interfaces/apiResponse';
import { User } from 'src/interfaces/user.interface';
import { UpdateUserDto } from 'src/dto/update.user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly UsersService: UsersService) {}

  /**
   * @post()
   * @param data
   * @ returns
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  async create(@Body() data: RegisterDto): Promise<ApiResponse>{
    try{
        const user = await this.UsersService.createUser(data);
        return { 
            success: true, 
            message: 'User created successfully', 
            data: user 
        };
    } catch(error){
        return {
            success: false,
            message: error.message,
            error: error instanceof Error ? error.message: 'Unkwon error',
        };
    }
  }

  /**
   * @ Get() all users
   * @ returns user[]
   */
  @Get()
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(Permission.MANAGE_USERS)
  async getAllUsers(): Promise<ApiResponse<User[]>>{
    try{
        const users = await this.UsersService.findAllUsers();
        return {
            success: true,
            message: `${users.length} Users retrieved successfully`,
            data: users,
        };
    } catch(error){
        return {
            success: false,
            message: error.message,
            error: error instanceof Error ? error.message: 'Unkwon error',
        }
    }
  }

  /**
   * @ Get () user by id
   * @ return user
   */
  @Get(':id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(Permission.MANAGE_USERS)
  async getUserById(@Param('id') id: string): Promise<ApiResponse<User>>{
    try{
        const user = await this.UsersService.findUserById(id);
        return {
            success: true,
            message: `User with id ${id} retrieved successfully`,
            data: user,
        };
    } catch(error){
        return {
            success: false,
            message: error.message,
            error: error instanceof Error ? error.message: 'Unkwon error',
        }
    }
  }

  /**
   * @ Get () user by email
   * @ return user
   */
  @Get('email/:email')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(Permission.MANAGE_USERS)
  async getUserByName(@Param('email') email: string): Promise<ApiResponse<User>>{
    try{
        const user = await this.UsersService.findUserByEmail(email);
        return {
            success: true,
            message: `User with email ${email} retrieved successfully`,
            data: user,
        }
    } catch(error){
        return {
            success: false,
            message: error.message,
            error: error instanceof Error ? error.message: 'Unkwon error',
        }
    }
  }

  /**
   * @Delete () user by id
   * 
   */
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(Permission.MANAGE_USERS)
  async deleteUser(@Param('id') id: string): Promise<ApiResponse<void>>{
    try{
        await this.UsersService.deleteUser(id);
        return {
            success: true,
            message: `User with id ${id} deleted successfully`,
            
        }
    } catch(error){
        return {
            success: false,
            message: error.message,
            error: error instanceof Error ? error.message: 'Unkwon error',
        }
    }
  }

  /**
   * @Patch () user by id
   * @ returns user
   */
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(Permission.MANAGE_USERS)
  async updateUser(@Param('id') id: string, @Body() data: UpdateUserDto): Promise<ApiResponse<User>>{
    try{
        const user = await this.UsersService.updateUser(id, data);
        return {
            success: true,
            message: `User with id ${id} updated successfully`,
            data: user,
        }
    } catch(error){
        return {
            success: false,
            message: error.message,
            error: error instanceof Error ? error.message: 'Unkwon error',
        }
    }
  }

}
