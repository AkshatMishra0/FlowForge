import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Generate comprehensive business report' })
  async generateReport(
    @Param('businessId') businessId: string,
    @Query('format') format: 'json' | 'csv' = 'json',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const options = {
      format,
      ...(startDate && endDate && {
        dateRange: {
          start: new Date(startDate),
          end: new Date(endDate),
        },
      }),
    };

    return this.reportsService.generateBusinessReport(businessId, options);
  }

  @Get('leads/:businessId/export')
  @ApiOperation({ summary: 'Export leads data' })
  async exportLeads(
    @Param('businessId') businessId: string,
    @Query('format') format: 'json' | 'csv' = 'json'
  ) {
    return this.reportsService.exportLeads(businessId, { format });
  }

  @Get('invoices/:businessId/export')
  @ApiOperation({ summary: 'Export invoices data' })
  async exportInvoices(
    @Param('businessId') businessId: string,
    @Query('format') format: 'json' | 'csv' = 'json'
  ) {
    return this.reportsService.exportInvoices(businessId, { format });
  }

  @Get('revenue/:businessId')
  @ApiOperation({ summary: 'Get revenue report' })
  async getRevenueReport(
    @Param('businessId') businessId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.reportsService.getRevenueReport(
      businessId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('lead-conversion/:businessId')
  @ApiOperation({ summary: 'Get lead conversion report' })
  async getLeadConversion(@Param('businessId') businessId: string) {
    return this.reportsService.getLeadConversionReport(businessId);
  }

  @Get('booking-analytics/:businessId')
  @ApiOperation({ summary: 'Get booking analytics' })
  async getBookingAnalytics(
    @Param('businessId') businessId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.reportsService.getBookingAnalytics(
      businessId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('monthly/:businessId')
  @ApiOperation({ summary: 'Get monthly summary' })
  async getMonthlySummary(
    @Param('businessId') businessId: string,
    @Query('year') year: number,
    @Query('month') month: number
  ) {
    return this.reportsService.getMonthlySummary(businessId, +year, +month);
  }
}
