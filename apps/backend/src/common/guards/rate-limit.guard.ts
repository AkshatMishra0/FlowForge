import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
    blocked: boolean;
    blockUntil?: number;
  };
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);
  private store: RateLimitStore = {};
  private readonly defaultLimit = 100; // requests
  private readonly defaultWindow = 15 * 60 * 1000; // 15 minutes in ms
  private readonly blockDuration = 60 * 60 * 1000; // 1 hour block after threshold

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key = this.getKey(request);
    const now = Date.now();

    // Get custom rate limit from decorator if exists
    const limit = this.reflector.get<number>('rateLimit', context.getHandler()) || this.defaultLimit;
    const window = this.reflector.get<number>('rateLimitWindow', context.getHandler()) || this.defaultWindow;

    // Initialize or get existing rate limit data
    if (!this.store[key] || now > this.store[key].resetTime) {
      this.store[key] = {
        count: 0,
        resetTime: now + window,
        blocked: false,
      };
    }

    // Check if client is blocked
    if (this.store[key].blocked && this.store[key].blockUntil && now < this.store[key].blockUntil) {
      const remainingTime = Math.ceil((this.store[key].blockUntil! - now) / 1000 / 60);
      this.logger.warn(`Blocked request from ${key}. Remaining: ${remainingTime}min`);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Rate limit exceeded. You have been temporarily blocked.`,
          blockedUntil: new Date(this.store[key].blockUntil!).toISOString(),
          remainingMinutes: remainingTime,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Clear block if time has passed
    if (this.store[key].blocked && this.store[key].blockUntil && now >= this.store[key].blockUntil) {
      this.store[key].blocked = false;
      this.store[key].count = 0;
      this.store[key].resetTime = now + window;
      this.logger.log(`Block expired for ${key}`);
    }

    // Increment request count
    this.store[key].count++;

    // Check if limit exceeded
    if (this.store[key].count > limit) {
      const retryAfter = Math.ceil((this.store[key].resetTime - now) / 1000);
      
      // Block user if exceeded by significant margin (2x)
      if (this.store[key].count > limit * 2) {
        this.store[key].blocked = true;
        this.store[key].blockUntil = now + this.blockDuration;
        this.logger.warn(`Client ${key} blocked for excessive requests`);
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests. Please try again later.',
          retryAfter,
          limit,
          remaining: 0,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Add rate limit headers
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Limit', limit);
    response.setHeader('X-RateLimit-Remaining', limit - this.store[key].count);
    response.setHeader('X-RateLimit-Reset', new Date(this.store[key].resetTime).toISOString());

    // Clean up old entries periodically
    if (Math.random() < 0.001) {
      this.cleanup(now);
    }

    return true;
  }

  private getKey(request: Request): string {
    // Use IP address and optionally user ID for authenticated users
    const ip = request.ip || request.socket.remoteAddress || 'unknown';
    const userId = (request as any).user?.id;
    
    if (userId) {
      return `user:${userId}`;
    }
    
    return `ip:${ip}`;
  }

  private cleanup(now: number): void {
    let cleaned = 0;
    Object.keys(this.store).forEach((key) => {
      // Remove expired and unblocked entries
      if (now > this.store[key].resetTime && !this.store[key].blocked) {
        delete this.store[key];
        cleaned++;
      }
    });
    
    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired rate limit entries`);
    }
  }

  // Method to manually clear rate limits (useful for testing or admin actions)
  clearRateLimit(identifier: string): void {
    delete this.store[identifier];
    this.logger.log(`Rate limit cleared for ${identifier}`);
  }

  // Get current stats for monitoring
  getStats() {
    const now = Date.now();
    const activeClients = Object.keys(this.store).length;
    const blockedClients = Object.values(this.store).filter(s => s.blocked && s.blockUntil && now < s.blockUntil).length;
    
    return {
      activeClients,
      blockedClients,
      totalTracked: activeClients,
    };
  }
}
