import { SetMetadata } from '@nestjs/common';

/**
 * Set custom rate limit for a specific endpoint
 * @param limit - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds (default: 15 minutes)
 * 
 * @example
 * ```typescript
 * @RateLimit(10, 60000) // 10 requests per minute
 * @Post('send-otp')
 * sendOtp() {
 *   // ...
 * }
 * ```
 */
export const RateLimit = (limit: number, windowMs: number = 15 * 60 * 1000) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata('rateLimit', limit)(target, propertyKey, descriptor);
    SetMetadata('rateLimitWindow', windowMs)(target, propertyKey, descriptor);
  };
};
