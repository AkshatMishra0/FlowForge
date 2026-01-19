import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CacheService } from '../../cache/cache.service';
import { API_RATE_LIMITS } from '../constants';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(private readonly cacheService: CacheService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.ip;
    const key = `rate-limit:${userId}:${Date.now()}`;

    // Get current request count from cache
    const currentCount = await this.cacheService.get<number>(key);
    
    if (currentCount && currentCount >= API_RATE_LIMITS.API_REQUESTS_PER_MINUTE) {
      throw new HttpException(
        'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment request count
    await this.cacheService.set(key, (currentCount || 0) + 1, 60);

    return next.handle();
  }
}
