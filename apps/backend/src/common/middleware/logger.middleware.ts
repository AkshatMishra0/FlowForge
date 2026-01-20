import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Generate or use existing request ID
    const requestId = req.headers['x-request-id'] as string || 
      `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Attach request ID to request headers
    req.headers['x-request-id'] = requestId;

    this.logger.log(
      `[${requestId}] ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'log';

      this.logger[logLevel](
        `[${requestId}] ${method} ${originalUrl} - ${statusCode} - ${duration}ms`,
      );
    });

    next();
  }
}
