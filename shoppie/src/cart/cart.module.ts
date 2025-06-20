/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { PermissionsModule } from 'src/permissions/permissions.module';

@Module({
  imports: [ProductsModule, UsersModule,PermissionsModule], 
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
