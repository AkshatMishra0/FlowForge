import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private client: RedisClientType;
  private isConnected = false;

  constructor(private configService: ConfigService) {
    this.initializeRedis();
  }

  private async initializeRedis() {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';

    this.client = createClient({
      url: redisUrl,
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      this.logger.log('Redis Client Connected');
      this.isConnected = true;
    });

    try {
      await this.client.connect();
    } catch (error) {
      this.logger.error('Failed to connect to Redis', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) {
      this.logger.warn('Redis not connected, skipping cache get');
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}`, error);
      return null;
    }
  }

  /**
   * Get multiple keys at once (batch operation)
   */
  async mGet<T>(keys: string[]): Promise<(T | null)[]> {
    if (!this.isConnected || keys.length === 0) {
      this.logger.warn('Redis not connected or empty keys array');
      return keys.map(() => null);
    }

    try {
      const values = await this.client.mGet(keys);
      return values.map((value) => (value ? JSON.parse(value) : null));
    } catch (error) {
      this.logger.error('Error getting multiple cache keys', error);
      return keys.map(() => null);
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn('Redis not connected, skipping cache set');
      return;
    }

    try {
      await this.retryOperation(async () => {
        await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      });
      this.logger.debug(`Cache set: ${key} (TTL: ${ttlSeconds}s)`);
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}`, error);
    }
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        this.logger.warn(`Cache operation failed (attempt ${attempt}/${maxRetries})`);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, attempt * 100));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Set multiple keys at once (batch operation)
   */
  async mSet(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    if (!this.isConnected || entries.length === 0) {
      this.logger.warn('Redis not connected or empty entries array');
      return;
    }

    try {
      // Use pipeline for efficient batch operations
      const pipeline = this.client.multi();
      
      for (const entry of entries) {
        const ttl = entry.ttl || 3600;
        pipeline.setEx(entry.key, ttl, JSON.stringify(entry.value));
      }
      
      await pipeline.exec();
    } catch (error) {
      this.logger.error('Error setting multiple cache keys', error);
    }
  }

  /**
   * Get value from cache or compute and set it if not exists
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds: number = 3600,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}`, error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      this.logger.error(`Error deleting cache pattern ${pattern}`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking cache key ${key}`, error);
      return false;
    }
  }

  async increment(key: string, by: number = 1): Promise<number> {
    if (!this.isConnected) {
      return 0;
    }

    try {
      return await this.client.incrBy(key, by);
    } catch (error) {
      this.logger.error(`Error incrementing cache key ${key}`, error);
      return 0;
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.client.expire(key, ttlSeconds);
    } catch (error) {
      this.logger.error(`Error setting expiry for cache key ${key}`, error);
    }
  }

  /**
   * Get remaining TTL for a key in seconds
   */
  async getTTL(key: string): Promise<number> {
    if (!this.isConnected) {
      return -2;
    }

    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error(`Error getting TTL for cache key ${key}`, error);
      return -2;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    connected: boolean;
    keysCount?: number;
    memoryUsed?: string;
  }> {
    if (!this.isConnected) {
      return { connected: false };
    }

    try {
      const dbSize = await this.client.dbSize();
      const info = await this.client.info('memory');
      const memoryMatch = info.match(/used_memory_human:(.+)/);
      
      return {
        connected: true,
        keysCount: dbSize,
        memoryUsed: memoryMatch ? memoryMatch[1].trim() : 'unknown',
      };
    } catch (error) {
      this.logger.error('Error getting cache stats', error);
      return { connected: true };
    }
  }

  async flushAll(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.client.flushAll();
      this.logger.log('Cache flushed');
    } catch (error) {
      this.logger.error('Error flushing cache', error);
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.client.quit();
    }
  }
}

// Implemented Redis caching - Modified: 2025-12-25 20:07:24
// Added lines for commit changes
// Change line 1 for this commit
// Change line 2 for this commit
// Change line 3 for this commit
// Change line 4 for this commit
// Change line 5 for this commit
// Change line 6 for this commit
// Change line 7 for this commit
// Change line 8 for this commit
// Change line 9 for this commit
// Change line 10 for this commit
// Change line 11 for this commit
// Change line 12 for this commit
// Change line 13 for this commit
// Change line 14 for this commit
// Change line 15 for this commit
// Change line 16 for this commit
// Change line 17 for this commit
