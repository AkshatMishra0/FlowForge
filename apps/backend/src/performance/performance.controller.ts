import { Controller, Get, Query, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PerformanceService } from './performance.service';

@ApiTags('Performance')
@Controller('performance')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class PerformanceController {
  constructor(private performanceService: PerformanceService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get performance statistics' })
  getStatistics(@Query('operation') operation?: string) {
    return this.performanceService.getStatistics(operation);
  }

  @Get('slow')
  @ApiOperation({ summary: 'Get recent slow operations' })
  getSlowOperations(
    @Query('threshold') threshold?: number,
    @Query('limit') limit?: number
  ) {
    return this.performanceService.getSlowOperations(
      threshold ? +threshold : 1000,
      limit ? +limit : 20
    );
  }

  @Get('memory')
  @ApiOperation({ summary: 'Get memory usage' })
  getMemoryUsage() {
    return this.performanceService.getMemoryUsage();
  }

  @Get('uptime')
  @ApiOperation({ summary: 'Get application uptime' })
  getUptime() {
    return this.performanceService.getUptime();
  }

  @Post('clear')
  @ApiOperation({ summary: 'Clear performance metrics' })
  clearMetrics() {
    this.performanceService.clearMetrics();
    return { message: 'Metrics cleared successfully' };
  }
}
