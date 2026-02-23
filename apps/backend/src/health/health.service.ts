import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import * as os from 'os';

interface HealthHistory {
  timestamp: Date;
  status: string;
  responseTime: number;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();
  private healthHistory: HealthHistory[] = [];
  private readonly maxHistorySize = 100;

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async check() {
    const memUsage = process.memoryUsage();
    const uptimeSeconds = (Date.now() - this.startTime) / 1000;
    const cpuUsage = process.cpuUsage();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: uptimeSeconds,
      uptimeFormatted: this.formatUptime(uptimeSeconds),
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
      },
      cpu: {
        user: Math.round(cpuUsage.user / 1000),
        system: Math.round(cpuUsage.system / 1000),
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        totalMemory: Math.round(os.totalmem() / 1024 / 1024),
        freeMemory: Math.round(os.freemem() / 1024 / 1024),
        cpuCount: os.cpus().length,
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

    // Track health history
    this.addToHistory({
      timestamp: new Date(),
      status: allHealthy ? 'ok' : 'degraded',
      responseTime: totalResponseTime,
    });

    return {
      status: allHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: (Date.now() - this.startTime) / 1000,
      uptimeFormatted: this.formatUptime((Date.now() - this.startTime) / 1000),
      totalCheckDuration: totalResponseTime,
      services,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
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

  private addToHistory(entry: HealthHistory) {
    this.healthHistory.push(entry);
    if (this.healthHistory.length > this.maxHistorySize) {
      this.healthHistory.shift();
    }
  }

  getHealthHistory() {
    return {
      history: this.healthHistory,
      stats: this.calculateHistoryStats(),
    };
  }

  private calculateHistoryStats() {
    if (this.healthHistory.length === 0) {
      return {
        averageResponseTime: 0,
        healthyCount: 0,
        degradedCount: 0,
        uptimePercentage: 100,
      };
    }

    const totalResponseTime = this.healthHistory.reduce(
      (sum, entry) => sum + entry.responseTime,
      0,
    );
    const healthyCount = this.healthHistory.filter(
      (entry) => entry.status === 'ok',
    ).length;
    const degradedCount = this.healthHistory.length - healthyCount;

    return {
      averageResponseTime: Math.round(totalResponseTime / this.healthHistory.length),
      healthyCount,
      degradedCount,
      uptimePercentage: Math.round((healthyCount / this.healthHistory.length) * 100),
      totalChecks: this.healthHistory.length,
    };
  }
}
