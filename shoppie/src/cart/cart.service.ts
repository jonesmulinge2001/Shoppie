/* eslint-disable prettier/prettier */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CartItem } from 'generated/prisma';
import { AddToCartDto } from 'src/dto/add.cart.dto';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from '../products/products.service';
import { getPrismaClient } from '../prisma/prisma.service'; // your existing file
import { UpdateCartQuantityDto } from 'src/dto/update.cart.dto';

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
      throw new BadRequestException(
        'Product not found or quantity is insufficient',
      );
    }

    // Calculate total cost for the quantity being added
    const totalCost = product.price * dto.quantity;

    // Decrease product quantity
    await this.productsService.decrementStock(dto.productId, dto.quantity);

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        userId,
        productId: dto.productId,
      },
    });

    if (existingItem) {
      const updatedQuantity = existingItem.quantity + dto.quantity;
      const updatedTotalCost = product.price * updatedQuantity;

      // Update existing item quantity and totalCost
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: updatedQuantity,
          totalCost: updatedTotalCost,
        },
      });

      // Return updated item
      const updated = await this.prisma.cartItem.findUnique({
        where: { id: existingItem.id },
      });
      return updated ? [updated] : [];
    }

    // Create new cart item if it doesn't exist
    const newItem = await this.prisma.cartItem.create({
      data: {
        userId,
        productId: dto.productId,
        quantity: dto.quantity,
        totalCost,
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
      throw new BadRequestException(
        'Item not found or does not belong to user',
      );
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

  // checkout user cart (place order)
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

  // reduce cart item quantity
  async reduceCartItemQuantity(
    userId: string,
    dto: UpdateCartQuantityDto,
  ): Promise<CartItem> {
    const existingItem = await this.prisma.cartItem.findFirst({
      where: { userId, productId: dto.productId },
      include: { product: true }, // for product.price
    });

    if (!existingItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (dto.reduceBy >= existingItem.quantity) {
      throw new BadRequestException(
        `You can only reduce up to ${existingItem.quantity - 1} item(s)`,
      );
    }

    const updatedQuantity = existingItem.quantity - dto.reduceBy;
    const updatedTotalCost = existingItem.product.price * updatedQuantity;

    // Update the cart item
    const updatedItem = await this.prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: updatedQuantity,
        totalCost: updatedTotalCost,
      },
    });

    // Increase product stock since user "returned" some quantity
    await this.productsService.incrementStock(dto.productId, dto.reduceBy);

    return updatedItem;
  }
}
