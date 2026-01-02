import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Basic health check',
    description: 'Check if the API is running and responsive. Returns basic health metrics.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'API is healthy',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-01-04T11:30:00.000Z',
        uptime: 3600.5,
        version: '1.0.0'
      }
    }
  })
  async check() {
    return this.healthService.check();
  }

  @Get('detailed')
  @ApiOperation({ 
    summary: 'Detailed health check',
    description: 'Check health status of all system components including database, redis, and external services'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Detailed health information',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-01-04T11:30:00.000Z',
        uptime: 3600.5,
        services: {
          database: { status: 'ok', responseTime: 5 },
          redis: { status: 'ok', responseTime: 2 },
          whatsapp: { status: 'ok', configured: true },
          razorpay: { status: 'ok', configured: true }
        }
      }
    }
  })
  async detailedCheck() {
    return this.healthService.detailedCheck();
  }
}
