/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';
import { JwtService } from '@nestjs/jwt'; 
import { MailerService } from './../shared/mailer/mailer.service';
import { LoginDto } from 'src/dto/loginUser.dto';
import { RegisterDto } from 'src/dto/registerUser.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private prisma: PrismaClient;

  constructor(
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {
    this.prisma = new PrismaClient();
  }

  async register(data: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
      },
    });

    try {
      await this.mailerService.sendWelcomeEmail(user.email, {
        username: user.name,
        email: user.email,
      });
    } catch (emailError) {
      console.warn(`Failed to send email to ${user.email}: ${emailError}`);
    }

    return user;
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) throw new Error('User not found');

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) throw new Error('Invalid password');

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { token };
  }
}
