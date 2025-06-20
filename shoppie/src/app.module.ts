/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PermissionsModule } from './permissions/permissions.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [PermissionsModule, CartModule],
  controllers: [AppController],  
  providers: [AppService],
})
export class AppModule {}
