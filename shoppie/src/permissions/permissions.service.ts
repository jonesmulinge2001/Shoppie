/* eslint-disable prettier/prettier */
 
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Permission } from '../permissions/permission.enum';
import { Role } from 'generated/prisma/client';

@Injectable()
export class PermissionService {
  private readonly rolePermissions: Record<Role, Permission[]> = {
    ADMIN: [
      Permission.MANAGE_PRODUCTS,
      Permission.MANAGE_USERS,
      Permission.VIEW_PRODUCTS,
      Permission.VIEW_ORDERS,
    ],
    CUSTOMER: [
      Permission.VIEW_PRODUCTS,
      Permission.ADD_TO_CART,
      Permission.VIEW_CART,
      Permission.PLACE_ORDER,
      Permission.CHECKOUT,
      Permission.REMOVE_FROM_CART,
    ],
  };

  getRolePermissions(role: Role): Permission[] {
    return this.rolePermissions[role] || [];
  }

  hasPermission(role: Role, permission: Permission): boolean {
    return this.getRolePermissions(role).includes(permission);
  }
}
