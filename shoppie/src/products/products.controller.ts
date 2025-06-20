/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { RequirePermissions } from 'src/auth/decorator/permission.decorator';
import { Permission } from 'src/permissions/permission.enum';
import { CreateProductDto } from 'src/dto/create.product.dto';
import { ApiResponse } from 'src/interfaces/apiResponse';
import { Category, Product, ProductStatus } from 'generated/prisma';
import { UpdateProductDto } from 'src/dto/update.product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * @ post()
   * @ params data
   * @ returns products[]
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(Permission.MANAGE_PRODUCTS)
  async createProduct(
    @Body() data: CreateProductDto,
  ): Promise<ApiResponse<Product>> {
    try {
      const product = await this.productsService.createProduct(data);
      return {
        success: true,
        data: product,
        message: 'Product created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error creating product',
        error: error instanceof Error ? error.message : 'Uknown error',
      };
    }
  }

  /**
   * @Get () all products
   * @return products[]
   */
  @Get()
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(Permission.VIEW_PRODUCTS)
  async getAllProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const products = await this.productsService.getAllProducts();
      return {
        success: true,
        data: products,
        message: `${products.length} products retrieved successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving products',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * @Get() product by id
   * @ return product
   */
  @Get(':id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(Permission.VIEW_PRODUCTS)
  async getProductById(@Param('id') id: string): Promise<ApiResponse<Product>> {
    try {
      const product = await this.productsService.getProductById(id);
      return {
        success: true,
        data: product,
        message: `${product.name} retrieved successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving product',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * @Get() product by name
   * @return product
   */
  @Get('name/:name')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(Permission.VIEW_PRODUCTS)
  async getProductByName(
    @Param('name') name: string,
  ): Promise<ApiResponse<Product>> {
    try {
      const product = await this.productsService.getProductByName(name);
      return {
        success: true,
        data: product,
        message: `${product.name} retrieved successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving product',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * @ Patch()
   * @ return product
   * @ param id
   */
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(Permission.MANAGE_PRODUCTS)
  async updateProduct(
    @Param('id') id: string,
    @Body() data: UpdateProductDto,
  ): Promise<ApiResponse<Product>> {
    try {
      const product = await this.productsService.updateProduct(id, data);
      return {
        success: true,
        data: product,
        message: `${product.name} updated successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error updating product',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * @ Delete ()
   * @ param id
   */
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(Permission.MANAGE_PRODUCTS)
  async deleteProduct(@Param('id') id: string): Promise<void> {
    try {
      await this.productsService.deleteProduct(id);
      return;
    } catch (error) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
  }

  /**
   * search/ filter products
   * @ Get()
   * @ param query
   * @ return products[]
   */

  @Get('search')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(Permission.VIEW_PRODUCTS)
  async searchProducts(
    @Query('category') category?: string,
    @Query('name') name?: string,
    @Query('price') price?: string,
    @Query('status') status?: string,
  ): Promise<ApiResponse<Product[]>> {
    try {
      const parsedPrice = price ? parseFloat(price) : undefined;

      const products = await this.productsService.searchProducts({
        category: category as Category,
        name,
        price: parsedPrice,
        status: status as ProductStatus,
      });

      return {
        success: true,
        data: products,
        message: `${products.length} products matched your filters`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error filtering products',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
