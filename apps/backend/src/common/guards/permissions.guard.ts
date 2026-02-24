import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

export enum Permission {
  // Lead permissions
  READ_LEADS = 'READ_LEADS',
  CREATE_LEADS = 'CREATE_LEADS',
  UPDATE_LEADS = 'UPDATE_LEADS',
  DELETE_LEADS = 'DELETE_LEADS',
  
  // Invoice permissions
  READ_INVOICES = 'READ_INVOICES',
  CREATE_INVOICES = 'CREATE_INVOICES',
  UPDATE_INVOICES = 'UPDATE_INVOICES',
  DELETE_INVOICES = 'DELETE_INVOICES',
  SEND_INVOICES = 'SEND_INVOICES',
  
  // Booking permissions
  READ_BOOKINGS = 'READ_BOOKINGS',
  CREATE_BOOKINGS = 'CREATE_BOOKINGS',
  UPDATE_BOOKINGS = 'UPDATE_BOOKINGS',
  CANCEL_BOOKINGS = 'CANCEL_BOOKINGS',
  
  // Business permissions
  MANAGE_BUSINESS = 'MANAGE_BUSINESS',
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  MANAGE_USERS = 'MANAGE_USERS',
  
  // WhatsApp permissions
  SEND_MESSAGES = 'SEND_MESSAGES',
  VIEW_MESSAGES = 'VIEW_MESSAGES',
  
  // Reports permissions
  VIEW_REPORTS = 'VIEW_REPORTS',
  EXPORT_DATA = 'EXPORT_DATA',
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false;
    }

    // Check if user has the required permissions
    return requiredPermissions.every((permission) =>
      this.hasPermission(user, permission),
    );
  }

  private hasPermission(user: any, permission: Permission): boolean {
    // Admin has all permissions
    if (user.role === 'ADMIN') {
      return true;
    }

    // Check if user has explicit permission
    if (user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.includes(permission);
    }

    // Default role-based permissions
    return this.getDefaultPermissionsForRole(user.role).includes(permission);
  }

  private getDefaultPermissionsForRole(role: string): Permission[] {
    const rolePermissions: Record<string, Permission[]> = {
      ADMIN: Object.values(Permission),
      MANAGER: [
        Permission.READ_LEADS,
        Permission.CREATE_LEADS,
        Permission.UPDATE_LEADS,
        Permission.READ_INVOICES,
        Permission.CREATE_INVOICES,
        Permission.UPDATE_INVOICES,
        Permission.SEND_INVOICES,
        Permission.READ_BOOKINGS,
        Permission.CREATE_BOOKINGS,
        Permission.UPDATE_BOOKINGS,
        Permission.VIEW_ANALYTICS,
        Permission.VIEW_REPORTS,
        Permission.SEND_MESSAGES,
        Permission.VIEW_MESSAGES,
      ],
      AGENT: [
        Permission.READ_LEADS,
        Permission.CREATE_LEADS,
        Permission.UPDATE_LEADS,
        Permission.READ_INVOICES,
        Permission.CREATE_INVOICES,
        Permission.READ_BOOKINGS,
        Permission.CREATE_BOOKINGS,
        Permission.SEND_MESSAGES,
        Permission.VIEW_MESSAGES,
      ],
      USER: [
        Permission.READ_LEADS,
        Permission.READ_INVOICES,
        Permission.READ_BOOKINGS,
        Permission.VIEW_MESSAGES,
      ],
    };

    return rolePermissions[role] || [];
  }
}
