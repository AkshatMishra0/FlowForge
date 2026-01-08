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
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: (Date.now() - this.startTime) / 1000,
    };
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
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        status: 'error',
        error: error.message,
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
      };
    } catch (error) {
      this.logger.error('Redis health check failed', error);
      return {
        status: 'error',
        error: error.message,
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
