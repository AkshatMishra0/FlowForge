import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async check() {
    const memUsage = process.memoryUsage();
    const uptimeSeconds = (Date.now() - this.startTime) / 1000;
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: uptimeSeconds,
      uptimeFormatted: this.formatUptime(uptimeSeconds),
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      },
    };
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m ${secs}s`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  }

  async detailedCheck() {
    const startTime = Date.now();
    const services = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      whatsapp: this.checkWhatsApp(),
      razorpay: this.checkRazorpay(),
    };

    const allHealthy = Object.values(services).every((s) => s.status === 'ok');
    const totalResponseTime = Date.now() - startTime;

    return {
      status: allHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: (Date.now() - this.startTime) / 1000,
      totalCheckDuration: totalResponseTime,
      services,
      memory: {
        used: process.memoryUsage().heapUsed / 1024 / 1024,
        total: process.memoryUsage().heapTotal / 1024 / 1024,
      },
    };
  }

  private async checkDatabase() {
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;
      
      return {
        status: 'ok',
        responseTime,
        message: 'Database connection is healthy',
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        status: 'error',
        responseTime: 0,
        error: error.message,
        message: 'Database connection failed',
      };
    }
  }

  private async checkRedis() {
    try {
      const start = Date.now();
      await this.cacheService.get('health_check');
      const responseTime = Date.now() - start;
      
      return {
        status: 'ok',
        responseTime,
        message: 'Redis cache is healthy',
      };
    } catch (error) {
      this.logger.error('Redis health check failed', error);
      return {
        status: 'error',
        responseTime: 0,
        error: error.message,
        message: 'Redis connection failed',
      };
    }
  }

  private checkWhatsApp() {
    const configured = !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID);
    
    return {
      status: 'ok',
      configured,
    };
  }

  private checkRazorpay() {
    const configured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
    
    return {
      status: 'ok',
      configured,
    };
  }
}
