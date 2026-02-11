import { Controller, Post, Body, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BulkOperationsService } from './bulk-operations.service';

@ApiTags('Bulk Operations')
@Controller('bulk')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class BulkOperationsController {
  constructor(private bulkOpsService: BulkOperationsService) {}

  @Post('leads/update-status')
  @ApiOperation({ summary: 'Bulk update lead status' })
  async bulkUpdateLeadStatus(
    @Body() dto: { leadIds: string[]; status: string },
    @Query('businessId') businessId: string
  ) {
    return this.bulkOpsService.bulkUpdateLeadStatus(dto.leadIds, dto.status, businessId);
  }

  @Post('leads/delete')
  @ApiOperation({ summary: 'Bulk delete leads' })
  async bulkDeleteLeads(
    @Body() dto: { leadIds: string[] },
    @Query('businessId') businessId: string
  ) {
    return this.bulkOpsService.bulkDeleteLeads(dto.leadIds, businessId);
  }

  @Post('leads/assign')
  @ApiOperation({ summary: 'Bulk assign leads to user' })
  async bulkAssignLeads(
    @Body() dto: { leadIds: string[]; userId: string },
    @Query('businessId') businessId: string
  ) {
    return this.bulkOpsService.bulkAssignLeads(dto.leadIds, dto.userId, businessId);
  }

  @Post('leads/import')
  @ApiOperation({ summary: 'Bulk import leads from data' })
  async bulkImportLeads(
    @Body() dto: { data: Array<{ name: string; phone: string; email?: string; source?: string }> },
    @Query('businessId') businessId: string
  ) {
    return this.bulkOpsService.bulkImportLeads(dto.data, businessId);
  }

  @Post('invoices/send')
  @ApiOperation({ summary: 'Bulk send invoices' })
  async bulkSendInvoices(
    @Body() dto: { invoiceIds: string[] },
    @Query('businessId') businessId: string
  ) {
    return this.bulkOpsService.bulkSendInvoices(dto.invoiceIds, businessId);
  }

  @Post('invoices/update-status')
  @ApiOperation({ summary: 'Bulk update invoice status' })
  async bulkUpdateInvoiceStatus(
    @Body() dto: { invoiceIds: string[]; status: string },
    @Query('businessId') businessId: string
  ) {
    return this.bulkOpsService.bulkUpdateInvoiceStatus(dto.invoiceIds, dto.status, businessId);
  }

  @Post('bookings/cancel')
  @ApiOperation({ summary: 'Bulk cancel bookings' })
  async bulkCancelBookings(
    @Body() dto: { bookingIds: string[] },
    @Query('businessId') businessId: string
  ) {
    return this.bulkOpsService.bulkCancelBookings(dto.bookingIds, businessId);
  }
}
