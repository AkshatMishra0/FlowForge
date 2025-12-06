import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('metrics')
  async getMetrics(
    @CurrentUser('businessId') businessId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getBusinessAnalytics(businessId, start, end);
  }

  @Get('top-services')
  async getTopServices(
    @CurrentUser('businessId') businessId: string,
    @Query('limit') limit?: number,
  ) {
    return this.analyticsService.getTopPerformingServices(businessId, limit || 10);
  }

  @Get('revenue-by-month')
  async getRevenueByMonth(
    @CurrentUser('businessId') businessId: string,
    @Query('months') months?: number,
  ) {
    return this.analyticsService.getRevenueByMonth(businessId, months || 12);
  }
}
