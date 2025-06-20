/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { RequirePermissions } from 'src/auth/decorator/permission.decorator';
import { Permission } from 'src/permissions/permission.enum';
import { AddToCartDto } from 'src/dto/add.cart.dto';
import { ApiResponse } from 'src/interfaces/apiResponse';
import { CartItem } from 'generated/prisma';
import { RequestWithUser } from 'src/interfaces/requestWithUser';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Add an item to cart
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(Permission.ADD_TO_CART)
  async addToCart(
    @Req() req: RequestWithUser,
    @Body() dto: AddToCartDto
  ): Promise<ApiResponse<CartItem[]>> {
    try {
      const userId = req.user.id;
      const cartItems = await this.cartService.addToCart(userId, dto);
      return {
        success: true,
        message: 'Item(s) added to cart successfully',
        data: cartItems,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Remove an item from cart
   */
  @Delete(':cartItemId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(Permission.REMOVE_FROM_CART)
  async removeFromCart(
    @Req() req: RequestWithUser,
    @Param('cartItemId') cartItemId: string
  ): Promise<ApiResponse<null>> {
    try {
      const userId = req.user.id;
      await this.cartService.removeFromCart(userId, cartItemId);
      return {
        success: true,
        message: 'Item removed from cart successfully',
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Checkout the cart
   */
  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(Permission.CHECKOUT)
  async checkout(
    @Req() req: RequestWithUser
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      const userId = req.user.id;
      const result = await this.cartService.checkout(userId);
      return {
        success: true,
        message: result.message,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
