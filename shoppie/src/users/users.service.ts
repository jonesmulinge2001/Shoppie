/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { RegisterDto } from 'src/dto/registerUser.dto';
import { User } from 'src/interfaces/user.interface';
import * as bcrypt from 'bcryptjs';
import { PrismaClient, Role } from 'generated/prisma';
import { UpdateUserDto } from 'src/dto/update.user.dto';

@Injectable()
export class UsersService {
  prisma = new PrismaClient();

  // create a user
  async createUser(data: RegisterDto): Promise<User> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: {
          email: data.email,
        },
      });
      if (existingUser) {
        throw new ConflictException(
          `User with email ${data.email} already exists`,
        );
      }

      // harsh password of the user
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: Role.CUSTOMER,
          status: data.status,
          name: data.name,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return user;
    } catch (error) {
      throw new ConflictException(
        `User with email ${data.email} already exists`,
      );
    }
  }

  // find all users
  async findAllUsers(): Promise<User[]>{
    try {
        const users = await this.prisma.user.findMany({
            orderBy: {id: 'asc'},
        });
        return users;
    } catch (error) {
        throw new InternalServerErrorException('Error while finding users');
    }
  }

  // find a user by id
  async findUserById(id: string): Promise<User>{
    try {
        const user = await this.prisma.user.findUnique({
            where: {id: id},
        });
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        return user;
    } catch (error) {
        throw new InternalServerErrorException('Error while finding user');
    }
  }

  // update a user
  async updateUser(id: string, data: UpdateUserDto): Promise<User>{
    try {
        const user = await this.prisma.user.findUnique({
            where: {id: id},
        });
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }

        // Check for email conflicts if email is being updated
        if (data.email && data.email !== user.email) {
            const existingUser = await this.prisma.user.findUnique({
                where: {email: data.email},
            });
            if (existingUser) {
                throw new ConflictException('Email already exists');
            }
        }
        // hash password if password is being updated
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        // update user
        return await this.prisma.user.update({
            where: {id},
            data: {
                ...(data.email && { email: data.email }),
                ...(data.password && { password: data.password }),
                ...(data.name && { name: data.name }),
                ...(data.role && { role: data.role as Role }),
            },
        });
    } catch (error) {
        throw new InternalServerErrorException('Error while updating user');
    }
  }

  // delete a user
  async deleteUser(id: string): Promise<void>{
    try {
        const user = await this.prisma.user.findUnique({
            where: {id: id},
        });
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        // delete user
        await this.prisma.user.delete({
            where: {id},
        });
    } catch (error) {
        throw new InternalServerErrorException('Error while deleting user');
    }
  }

  // find a user by email
  async findUserByEmail(email: string): Promise<User>{
    try {
        const user = await this.prisma.user.findUnique({
            where: {email: email},
        });
        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }
        return user;
    } catch (error) {
        throw new InternalServerErrorException('Error while finding user by email');
    }
  }

  // user to change password
  async changePassword(id: string, newPassword: string): Promise<{message: string}>{
    try {
        const user = await this.prisma.user.findUnique({
            where: {id: id},
        });
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        // check if current password is correct
        const isValidPassword = await bcrypt.compare(newPassword, user.password);
        if (!isValidPassword) {
            throw new BadRequestException('Current password is invalid password');
        }
        // hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // update user
        await this.prisma.user.update({
            where: {id},
            data: {password: hashedPassword},
        });
        return {message: 'Password changed successfully'}
    } catch (error) {
        throw new InternalServerErrorException('Error while changing password');
    }
  }
}
