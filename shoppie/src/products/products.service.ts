/* eslint-disable prettier/prettier */
 
import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { getPrismaClient } from '../prisma/prisma.service';
import { CreateProductDto } from 'src/dto/create.product.dto';
import { Category, Product, ProductStatus } from 'generated/prisma';

@Injectable()
export class ProductsService {
  private readonly prisma = getPrismaClient();

  // create a new product
  async createProduct(data: CreateProductDto): Promise<Product> {
    const product = await this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        image: data.image,
        quantity: data.quantity ?? 1,
        status: data.status ?? 'AVAILABLE',
        size: data.size,
        color: data.color,
      },
    });
    return product;
  }

  // get all products
  async getAllProducts(): Promise<Product[]> {
    try {
      return await this.prisma.product.findMany();
    } catch {
      throw new NotFoundException('Products not found');
    }
  }

  // get a product by id
  async getProductById(id: string): Promise<Product> {
    try {
      const product = await this.prisma.product.findUnique({ where: { id } });
      if (!product) throw new NotFoundException('Product not found');
      return product;
    } catch {
      throw new NotFoundException('Product not found');
    }
  }

  // get a product by name
  async getProductByName(name: string): Promise<Product> {
    try {
      const product = await this.prisma.product.findFirst({ where: { name } });
      if (!product) throw new NotFoundException(`Product with name ${name} not found`);
      return product;
    } catch {
      throw new NotFoundException(`Product with name ${name} not found`);
    }
  }

  // delete a product
  async deleteProduct(id: string): Promise<void> {
    try {
      await this.prisma.product.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Product not found');
    }
  }

  // update a product
  async updateProduct(id: string, data: Partial<CreateProductDto>): Promise<Product> {
    try {
      return await this.prisma.product.update({ where: { id }, data });
    } catch {
      throw new NotFoundException('Product not found');
    }
  }

  // find all available products
  async findAllAvailable(): Promise<Product[]> {
    try {
      return await this.prisma.product.findMany({ where: { status: ProductStatus.AVAILABLE } });
    } catch {
      throw new InternalServerErrorException('Error finding available products');
    }
  }
  
  // filter products by category
  async filterByCategory(category: string): Promise<Product[]> {
    try {
      return await this.prisma.product.findMany({ where: { category: category as Category } });
    } catch {
      throw new InternalServerErrorException('Error filtering products by category');
    }
  }

  async searchProducts(filters: {
    name?: string;
    category?: Category;
    status?: ProductStatus;
    price?: number;
  }): Promise<Product[]>{
    try {
      const { category, name, status, price} = filters;
      return this.prisma.product.findMany({
        where: {
          ...(category && { category: category }),
          ...(name && { name: { contains: name } }),
          ...(status && { status: status }),
          ...(price && { price: { gt: price } })
        }

      });
    } catch {
      throw new InternalServerErrorException('Error searching products');
    }
  }

  // decrement stock quantity
  async decrementStock(productId: string, quantity: number): Promise<Product> {
    try {
      const product = await this.getProductById(productId);
      if (product.quantity < quantity) {
        throw new BadRequestException('Insufficient stock');
      }
      return await this.prisma.product.update({
        where: { id: productId },
        data: { quantity: product.quantity - quantity },
      });
    } catch {
      throw new InternalServerErrorException('Error decrementing stock');
    }
  }

  // increment stock quantity
  async incrementStock(productId: string, quantity: number): Promise<Product> {
    try {
      await this.getProductById(productId);
      return await this.prisma.product.update({
        where: { id: productId },
        data: { quantity: quantity + (await this.getProductById(productId)).quantity },
      });
    } catch {
      throw new InternalServerErrorException('Error incrementing stock');
    }
  }
}
