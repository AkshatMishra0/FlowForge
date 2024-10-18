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

// Added analytics endpoints - Modified: 2025-12-25 20:07:23
// Added lines for commit changes
// Change line 1 for this commit
// Change line 2 for this commit
// Change line 3 for this commit
// Change line 4 for this commit
// Change line 5 for this commit
// Change line 6 for this commit
// Change line 7 for this commit
// Change line 8 for this commit
// Change line 9 for this commit
// Change line 10 for this commit
// Change line 11 for this commit
// Change line 12 for this commit
// Change line 13 for this commit
