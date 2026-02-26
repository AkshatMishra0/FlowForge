import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard, Permission } from '../src/common/guards/permissions.guard';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const createMockContext = (user?: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access when no permissions are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const context = createMockContext({ id: 1, role: 'USER' });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access when user is not authenticated', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.READ_LEADS]);
      const context = createMockContext(undefined);

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should allow ADMIN to access everything', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
        Permission.READ_LEADS,
        Permission.DELETE_LEADS,
        Permission.MANAGE_BUSINESS,
        Permission.EXPORT_DATA,
      ]);
      
      const context = createMockContext({ id: 1, role: 'ADMIN' });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should check explicit user permissions', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.READ_LEADS]);
      
      const context = createMockContext({
        id: 1,
        role: 'USER',
        permissions: [Permission.READ_LEADS, Permission.CREATE_LEADS],
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access when user lacks required permission', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.DELETE_LEADS]);
      
      const context = createMockContext({
        id: 1,
        role: 'USER',
        permissions: [Permission.READ_LEADS],
      });

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should use default MANAGER permissions', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
        Permission.READ_LEADS,
        Permission.CREATE_LEADS,
        Permission.UPDATE_LEADS,
        Permission.VIEW_ANALYTICS,
      ]);
      
      const context = createMockContext({ id: 1, role: 'MANAGER' });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny MANAGER from deleting leads (default permissions)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.DELETE_LEADS]);
      
      const context = createMockContext({ id: 1, role: 'MANAGER' });

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should use default AGENT permissions', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
        Permission.READ_LEADS,
        Permission.CREATE_LEADS,
        Permission.SEND_MESSAGES,
      ]);
      
      const context = createMockContext({ id: 1, role: 'AGENT' });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny AGENT from managing business', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.MANAGE_BUSINESS]);
      
      const context = createMockContext({ id: 1, role: 'AGENT' });

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should check all required permissions', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
        Permission.READ_INVOICES,
        Permission.CREATE_INVOICES,
        Permission.DELETE_INVOICES, // MANAGER doesn't have this
      ]);
      
      const context = createMockContext({ id: 1, role: 'MANAGER' });

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should allow when all required permissions are present', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
        Permission.READ_INVOICES,
        Permission.CREATE_INVOICES,
        Permission.SEND_INVOICES,
      ]);
      
      const context = createMockContext({ id: 1, role: 'MANAGER' });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should handle users with custom role and explicit permissions', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.EXPORT_DATA]);
      
      const context = createMockContext({
        id: 1,
        role: 'CUSTOM_ROLE',
        permissions: [Permission.EXPORT_DATA, Permission.VIEW_REPORTS],
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny users with unknown role and no explicit permissions', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.READ_LEADS]);
      
      const context = createMockContext({
        id: 1,
        role: 'UNKNOWN_ROLE',
      });

      expect(guard.canActivate(context)).toBe(false);
    });
  });

  describe('Permission Categories', () => {
    it('should properly categorize lead permissions for AGENT', () => {
      const agentUser = { id: 1, role: 'AGENT' };

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.READ_LEADS]);
      expect(guard.canActivate(createMockContext(agentUser))).toBe(true);

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.CREATE_LEADS]);
      expect(guard.canActivate(createMockContext(agentUser))).toBe(true);

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.UPDATE_LEADS]);
      expect(guard.canActivate(createMockContext(agentUser))).toBe(true);

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.DELETE_LEADS]);
      expect(guard.canActivate(createMockContext(agentUser))).toBe(false);
    });

    it('should properly categorize invoice permissions for MANAGER', () => {
      const managerUser = { id: 1, role: 'MANAGER' };

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.SEND_INVOICES]);
      expect(guard.canActivate(createMockContext(managerUser))).toBe(true);

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.DELETE_INVOICES]);
      expect(guard.canActivate(createMockContext(managerUser))).toBe(false);
    });

    it('should properly categorize booking permissions for USER', () => {
      const regularUser = { id: 1, role: 'USER' };

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.READ_BOOKINGS]);
      expect(guard.canActivate(createMockContext(regularUser))).toBe(true);

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.CREATE_BOOKINGS]);
      expect(guard.canActivate(createMockContext(regularUser))).toBe(false);

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.CANCEL_BOOKINGS]);
      expect(guard.canActivate(createMockContext(regularUser))).toBe(false);
    });
  });
});
