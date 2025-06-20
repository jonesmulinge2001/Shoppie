/* src/products/products.module.ts */
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PermissionsModule, AuthModule],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
