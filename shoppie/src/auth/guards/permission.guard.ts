/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
 
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
// src/permissions/guards/permission.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { REQUIRE_PERMISSIONS_KEY } from '../../auth/decorator/permission.decorator';
import { PermissionService } from 'src/permissions/permissions.service';
import { Permission } from 'src/permissions/permission.enum';
  
  @Injectable()
  export class PermissionGuard implements CanActivate {
    constructor(
      private reflector: Reflector,
      private permissionService: PermissionService,
    ) {}
  
    canActivate(context: ExecutionContext): boolean {
      const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
        REQUIRE_PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()],
      );
  
      if (!requiredPermissions) return true;
  
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      console.log('User:', user);
      if(!user || !user.role){
        throw new ForbiddenException('You do not have permission to access this resource');
      };
  
      const userPermissions = this.permissionService.getRolePermissions(
        user.role);
    
      const hasAllPermissions = requiredPermissions.every((permission) =>
        userPermissions.includes(permission as Permission),
      );
  
      if (!hasAllPermissions) {
        throw new ForbiddenException('Insufficient permissions');
      }
  
      return true;
    }
  }
  export { PermissionService };
  
  