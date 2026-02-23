import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

interface RequestMetrics {
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  timestamp: Date;
  userAgent: string;
  ip: string;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private requestMetrics: RequestMetrics[] = [];
  private readonly maxMetricsSize = 1000;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, body } = request;
    const userAgent = request.get('user-agent') || '';
    const userId = request.user?.id || 'anonymous';
    const now = Date.now();
    const timestamp = new Date();

    // Log incoming request with user context
    this.logger.log(`→ ${method} ${url} - ${ip} - User: ${userId}`);
    
    if (Object.keys(body || {}).length > 0 && !this.isSensitiveEndpoint(url)) {
      const sanitizedBody = this.sanitizeBody(body);
      this.logger.debug(`Request body: ${JSON.stringify(sanitizedBody).substring(0, 200)}`);
    }

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const duration = Date.now() - now;

        // Track metrics
        this.trackRequest({
          method,
          url,
          statusCode,
          duration,
          timestamp,
          userAgent,
          ip,
        });

        // Color-coded logging based on duration
        const logMethod = duration > 1000 ? 'warn' : 'log';
        this.logger[logMethod](
          `← ${method} ${url} ${statusCode} - ${duration}ms - ${this.formatBytes(response.get('content-length') || 0)} - ${userAgent.substring(0, 50)}`,
        );
      }),
      catchError((error) => {
        const duration = Date.now() - now;
        this.logger.error(
          `✗ ${method} ${url} ${error.status || 500} - ${duration}ms - ${error.message}`,
        );
        
        // Track failed requests
        this.trackRequest({
          method,
          url,
          statusCode: error.status || 500,
          duration,
          timestamp,
          userAgent,
          ip,
        });

        return throwError(() => error);
      }),
    );
  }

  private sanitizeBody(body: any): any {
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization'];
    const sanitized = { ...body };
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });
    
    return sanitized;
  }

  private isSensitiveEndpoint(url: string): boolean {
    const sensitivePatterns = ['/auth/login', '/auth/signup', '/auth/reset-password'];
    return sensitivePatterns.some(pattern => url.includes(pattern));
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  private trackRequest(metrics: RequestMetrics) {
    this.requestMetrics.push(metrics);
    if (this.requestMetrics.length > this.maxMetricsSize) {
      this.requestMetrics.shift();
    }
  }

  getMetrics() {
    const totalRequests = this.requestMetrics.length;
    const avgDuration = totalRequests > 0
      ? this.requestMetrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests
      : 0;
    
    const statusCodeDistribution = this.requestMetrics.reduce((acc, m) => {
      const category = `${Math.floor(m.statusCode / 100)}xx`;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const slowRequests = this.requestMetrics.filter(m => m.duration > 1000).length;
    
    return {
      totalRequests,
      avgDuration: Math.round(avgDuration),
      slowRequests,
      statusCodeDistribution,
      recentRequests: this.requestMetrics.slice(-10),
    };
  }
}
