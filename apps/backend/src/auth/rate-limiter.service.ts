import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';

interface LoginAttempt {
  count: number;
  firstAttempt: Date;
  lastAttempt: Date;
  blocked: boolean;
}

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly MAX_ATTEMPTS = 5;
  private readonly BLOCK_DURATION = 15 * 60; // 15 minutes in seconds
  private readonly ATTEMPT_WINDOW = 60 * 60; // 1 hour in seconds

  constructor(private cacheService: CacheService) {}

  /**
   * Record a failed login attempt
   */
  async recordFailedAttempt(identifier: string): Promise<void> {
    const key = `login_attempts:${identifier}`;
    const attempts = await this.getLoginAttempts(identifier);

    const now = new Date();
    const updatedAttempts: LoginAttempt = {
      count: attempts.count + 1,
      firstAttempt: attempts.firstAttempt || now,
      lastAttempt: now,
      blocked: attempts.count + 1 >= this.MAX_ATTEMPTS,
    };

    await this.cacheService.set(key, JSON.stringify(updatedAttempts), this.ATTEMPT_WINDOW);

    if (updatedAttempts.blocked) {
      this.logger.warn(`Account temporarily blocked: ${identifier} after ${this.MAX_ATTEMPTS} failed attempts`);
      await this.cacheService.set(
        `blocked:${identifier}`,
        'true',
        this.BLOCK_DURATION
      );
    }
  }

  /**
   * Clear login attempts after successful login
   */
  async clearAttempts(identifier: string): Promise<void> {
    await this.cacheService.delete(`login_attempts:${identifier}`);
    await this.cacheService.delete(`blocked:${identifier}`);
  }

  /**
   * Check if account is currently blocked
   */
  async isBlocked(identifier: string): Promise<boolean> {
    const blocked = await this.cacheService.get(`blocked:${identifier}`);
    return blocked === 'true';
  }

  /**
   * Get remaining attempts before block
   */
  async getRemainingAttempts(identifier: string): Promise<number> {
    const attempts = await this.getLoginAttempts(identifier);
    return Math.max(0, this.MAX_ATTEMPTS - attempts.count);
  }

  /**
   * Get login attempt details
   */
  private async getLoginAttempts(identifier: string): Promise<LoginAttempt> {
    const key = `login_attempts:${identifier}`;
    const cached = await this.cacheService.get(key);

    if (cached) {
      return JSON.parse(cached);
    }

    return {
      count: 0,
      firstAttempt: null,
      lastAttempt: null,
      blocked: false,
    };
  }

  /**
   * Get time until unblock
   */
  async getBlockTimeRemaining(identifier: string): Promise<number> {
    const ttl = await this.cacheService.getTTL(`blocked:${identifier}`);
    return ttl > 0 ? ttl : 0;
  }
}
