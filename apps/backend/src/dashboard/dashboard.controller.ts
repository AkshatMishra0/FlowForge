import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@Query('businessId') businessId: string) {
    return this.dashboardService.getStats(businessId);
  }

  @Get('activity')
  async getActivity(@Query('businessId') businessId: string) {
    return this.dashboardService.getRecentActivity(businessId);
  }
}
