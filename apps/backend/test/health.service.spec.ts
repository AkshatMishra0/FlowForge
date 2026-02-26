import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from '../src/health/health.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { CacheService } from '../src/cache/cache.service';

describe('HealthService', () => {
  let service: HealthService;
  let prismaService: PrismaService;
  let cacheService: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    prismaService = module.get<PrismaService>(PrismaService);
    cacheService = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('check', () => {
    it('should return basic health status', async () => {
      const result = await service.check();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('uptimeFormatted');
      expect(result).toHaveProperty('memory');
      expect(result).toHaveProperty('cpu');
      expect(result).toHaveProperty('system');
    });

    it('should include system information', async () => {
      const result = await service.check();

      expect(result.system).toHaveProperty('platform');
      expect(result.system).toHaveProperty('arch');
      expect(result.system).toHaveProperty('nodeVersion');
      expect(result.system).toHaveProperty('totalMemory');
      expect(result.system).toHaveProperty('freeMemory');
      expect(result.system).toHaveProperty('cpuCount');
    });

    it('should format memory in MB', async () => {
      const result = await service.check();

      expect(typeof result.memory.rss).toBe('number');
      expect(typeof result.memory.heapUsed).toBe('number');
      expect(typeof result.memory.heapTotal).toBe('number');
      expect(typeof result.memory.external).toBe('number');
    });
  });

  describe('detailedCheck', () => {
    it('should return detailed health status when all services are healthy', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([{ result: 1 }]);
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);

      const result = await service.detailedCheck();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('services');
      expect(result.services).toHaveProperty('database');
      expect(result.services).toHaveProperty('redis');
      expect(result.services).toHaveProperty('whatsapp');
      expect(result.services).toHaveProperty('razorpay');
    });

    it('should return degraded status when database is down', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockRejectedValue(new Error('Connection failed'));
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);

      const result = await service.detailedCheck();

      expect(result.status).toBe('degraded');
      expect(result.services.database.status).toBe('error');
      expect(result.services.database).toHaveProperty('error');
    });

    it('should return degraded status when Redis is down', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([{ result: 1 }]);
      jest.spyOn(cacheService, 'get').mockRejectedValue(new Error('Redis connection failed'));

      const result = await service.detailedCheck();

      expect(result.status).toBe('degraded');
      expect(result.services.redis.status).toBe('error');
    });

    it('should include response times for each service', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([{ result: 1 }]);
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);

      const result = await service.detailedCheck();

      expect(result.services.database).toHaveProperty('responseTime');
      expect(result.services.redis).toHaveProperty('responseTime');
      expect(typeof result.services.database.responseTime).toBe('number');
      expect(typeof result.services.redis.responseTime).toBe('number');
    });

    it('should track health history', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([{ result: 1 }]);
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);

      await service.detailedCheck();
      const history = service.getHealthHistory();

      expect(history).toHaveProperty('history');
      expect(history).toHaveProperty('stats');
      expect(Array.isArray(history.history)).toBe(true);
      expect(history.history.length).toBeGreaterThan(0);
    });
  });

  describe('getHealthHistory', () => {
    it('should return empty history initially', () => {
      const history = service.getHealthHistory();

      expect(history.stats.totalChecks).toBe(0);
      expect(history.stats.averageResponseTime).toBe(0);
      expect(history.stats.uptimePercentage).toBe(100);
    });

    it('should calculate statistics correctly', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([{ result: 1 }]);
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);

      // Perform multiple health checks
      await service.detailedCheck();
      await service.detailedCheck();
      await service.detailedCheck();

      const history = service.getHealthHistory();

      expect(history.stats.totalChecks).toBe(3);
      expect(history.stats.healthyCount).toBe(3);
      expect(history.stats.degradedCount).toBe(0);
      expect(history.stats.uptimePercentage).toBe(100);
    });
  });
});
