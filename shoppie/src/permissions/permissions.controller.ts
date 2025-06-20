/* eslint-disable prettier/prettier */
import { Permission } from './permission.enum';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt/jwtAuth.guard';
import { Role } from 'generated/prisma';
import { PermissionGuard, PermissionService } from '../auth/guards/permission.guard';
import { RequirePermissions } from '../auth/decorator/permission.decorator';
import { CurrentUser, CurrentUserData } from 'src/auth/guards/jwt/jwt.module';

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  // ✅ Get permissions for the current logged-in user
  @Get('my-permissions')
  getMyPermissions(@CurrentUser() user: CurrentUserData) {
    const permissions = this.permissionService.getRolePermissions(user.role as Role);
    return {
      role: user.role,
      permissions,
      permissionCount: permissions.length,
    };
  }

  // ✅ Get all permissions for a specific role (Admin only)
  @Get('role/:role')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Permission.MANAGE_USERS)
  getRolePermissions(@Param('role') role: Role) {
    const permissions = this.permissionService.getRolePermissions(role);
    return {
      role,
      permissions,
      permissionCount: permissions.length,
    };
  }

  // ✅ Check if the current user has a specific permission
  @Get('check/:permission')
  checkPermission(
    @Param('permission') permission: Permission,
    @CurrentUser() user: CurrentUserData,
  ) {
    const hasPermission = this.permissionService.hasPermission(
      user.role as Role,
      permission,
    );
    return {
      permission,
      hasPermission,
      role: user.role,
    };
  }

  // ✅ List all available permissions in the system (Admin only)
  @Get('all-permissions')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Permission.MANAGE_USERS)
  getAllPermissions() {
    return {
      permissions: Object.values(Permission),
    };
  }
}


