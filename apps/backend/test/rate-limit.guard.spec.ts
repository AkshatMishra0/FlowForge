import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitGuard } from '../src/common/guards/rate-limit.guard';

describe('RateLimitGuard', () => {
  let guard: RateLimitGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RateLimitGuard>(RateLimitGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const createMockContext = (ip: string = '127.0.0.1', userId?: string): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          ip,
          socket: { remoteAddress: ip },
          user: userId ? { id: userId } : undefined,
        }),
        getResponse: () => ({
          setHeader: jest.fn(),
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
    beforeEach(() => {
      jest.spyOn(reflector, 'get').mockReturnValue(undefined);
    });

    it('should allow requests within rate limit', () => {
      const context = createMockContext();
      
      expect(() => guard.canActivate(context)).not.toThrow();
    });

    it('should track requests per IP address', () => {
      const context = createMockContext('192.168.1.1');
      
      for (let i = 0; i < 50; i++) {
        expect(() => guard.canActivate(context)).not.toThrow();
      }
    });

    it('should throw error when rate limit exceeded', () => {
      jest.spyOn(reflector, 'get').mockImplementation((key) => {
        if (key === 'rateLimit') return 5;
        if (key === 'rateLimitWindow') return 60000;
        return undefined;
      });

      const context = createMockContext();

      // Make requests up to the limit
      for (let i = 0; i < 5; i++) {
        guard.canActivate(context);
      }

      // Next request should throw
      expect(() => guard.canActivate(context)).toThrow(HttpException);
      
      try {
        guard.canActivate(context);
      } catch (error) {
        expect(error.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        expect(error.getResponse()).toHaveProperty('message');
        expect(error.getResponse()).toHaveProperty('retryAfter');
      }
    });

    it('should use user ID for authenticated users', () => {
      const userId = 'user-123';
      const context = createMockContext('192.168.1.1', userId);
      
      jest.spyOn(reflector, 'get').mockImplementation((key) => {
        if (key === 'rateLimit') return 5;
        return undefined;
      });

      for (let i = 0; i < 5; i++) {
        guard.canActivate(context);
      }

      expect(() => guard.canActivate(context)).toThrow(HttpException);
    });

    it('should reset count after window expires', async () => {
      jest.spyOn(reflector, 'get').mockImplementation((key) => {
        if (key === 'rateLimit') return 5;
        if (key === 'rateLimitWindow') return 100; // 100ms window
        return undefined;
      });

      const context = createMockContext();

      // Exhaust the limit
      for (let i = 0; i < 5; i++) {
        guard.canActivate(context);
      }

      expect(() => guard.canActivate(context)).toThrow(HttpException);

      // Wait for window to reset
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should work again
      expect(() => guard.canActivate(context)).not.toThrow();
    });

    it('should block user after excessive requests', () => {
      jest.spyOn(reflector, 'get').mockImplementation((key) => {
        if (key === 'rateLimit') return 5;
        if (key === 'rateLimitWindow') return 60000;
        return undefined;
      });

      const context = createMockContext();

      // Make excessive requests (more than 2x limit)
      try {
        for (let i = 0; i < 15; i++) {
          guard.canActivate(context);
        }
      } catch (error) {
        // Expected to throw
      }

      // Should still be blocked
      try {
        guard.canActivate(context);
      } catch (error) {
        expect(error.getResponse()).toHaveProperty('blockedUntil');
        expect(error.getResponse()).toHaveProperty('remainingMinutes');
      }
    });

    it('should set rate limit headers', () => {
      const mockSetHeader = jest.fn();
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            ip: '127.0.0.1',
            socket: { remoteAddress: '127.0.0.1' },
          }),
          getResponse: () => ({
            setHeader: mockSetHeader,
          }),
        }),
        getHandler: jest.fn(),
      } as any;

      guard.canActivate(context);

      expect(mockSetHeader).toHaveBeenCalledWith('X-RateLimit-Limit', expect.any(Number));
      expect(mockSetHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(Number));
      expect(mockSetHeader).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(String));
    });
  });

  describe('getStats', () => {
    it('should return stats', () => {
      const stats = guard.getStats();

      expect(stats).toHaveProperty('activeClients');
      expect(stats).toHaveProperty('blockedClients');
      expect(stats).toHaveProperty('totalTracked');
    });
  });

  describe('clearRateLimit', () => {
    it('should clear rate limit for specific identifier', () => {
      jest.spyOn(reflector, 'get').mockImplementation((key) => {
        if (key === 'rateLimit') return 5;
        return undefined;
      });

      const context = createMockContext();

      // Exhaust limit
      for (let i = 0; i < 5; i++) {
        guard.canActivate(context);
      }

      expect(() => guard.canActivate(context)).toThrow(HttpException);

      // Clear rate limit
      guard.clearRateLimit('ip:127.0.0.1');

      // Should work again
      expect(() => guard.canActivate(context)).not.toThrow();
    });
  });
});
