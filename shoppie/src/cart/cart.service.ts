/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { CartItem } from 'generated/prisma';
import { AddToCartDto } from 'src/dto/add.cart.dto';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from '../products/products.service';
import { getPrismaClient } from '../prisma/prisma.service'; // your existing file

@Injectable()
export class CartService {
  private readonly prisma = getPrismaClient();

  constructor(
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) {}

  // add to cart 
  async addToCart(userId: string, dto: AddToCartDto): Promise<CartItem[]> {
    const product = await this.productsService.getProductById(dto.productId);
    if (!product || product.quantity < dto.quantity) {
      throw new BadRequestException('Product not found or quantity is not available');
    }
    
    // decrease product quantity
    await this.productsService.decrementStock(dto.productId, dto.quantity);

    // check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        userId, productId: dto.productId,
      },
    });
    if (existingItem) {
      // update existing item quantity
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + dto.quantity },
      });
      // return updated item
      const updated = await this.prisma.cartItem.findUnique({ where: { id: existingItem.id } });
      return updated ? [updated] : [];
    }

    // create new cart item if not exists
    const newItem = await this.prisma.cartItem.create({
      data: {
        userId,
        productId: dto.productId,
        quantity: dto.quantity,
      },
    });
    return [newItem];
  }

  // remove item from cart
  async removeFromCart(userId: string, cartItemId: string): Promise<void> {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });
    if (!item || item.userId !== userId) {
      throw new BadRequestException('Item not found or does not belong to user');
    }
    await this.productsService.incrementStock(item.productId, item.quantity);
    await this.prisma.cartItem.delete({ where: { id: cartItemId } });
  }

  // get user cart
  async getCart(userId: string): Promise<CartItem[]> {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
    });
  }

  // checkout user cart
  async checkout(userId: string): Promise<{ message: string }> {
    const cartItems = await this.getCart(userId);
    if (!cartItems.length) {
      throw new BadRequestException('Cart is empty');
    }
    // to be expanded in a real app: Create order, handle payment.
    // Clear cart after checkout
    await this.prisma.cartItem.deleteMany({
      where: { userId },
    });
    return {
      message: 'Checkout successful',
    };
  }
}
