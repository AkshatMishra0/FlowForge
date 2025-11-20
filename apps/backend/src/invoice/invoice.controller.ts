import { Controller, Post, Get, Patch, Body, Query, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from './dto/invoice.dto';

@ApiTags('Invoice')
@Controller('invoices')
export class InvoiceController {
  constructor(private invoiceService: InvoiceService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create invoice' })
  async createInvoice(@Body() dto: CreateInvoiceDto, @Query('businessId') businessId: string) {
    return this.invoiceService.createInvoice(businessId, dto);
  }

  @Post(':id/payment-link')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Razorpay payment link for invoice' })
  async createPaymentLink(@Param('id') id: string) {
    return this.invoiceService.createPaymentLink(id);
  }

  @Post(':id/send-whatsapp')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send invoice via WhatsApp' })
  async sendWhatsApp(@Param('id') id: string) {
    return this.invoiceService.sendInvoiceWhatsApp(id);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update invoice status' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateInvoiceStatusDto) {
    return this.invoiceService.updateInvoiceStatus(id, dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all invoices' })
  async getInvoices(@Query('businessId') businessId: string, @Query() filters: any) {
    return this.invoiceService.getInvoices(businessId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID (public)' })
  async getInvoice(@Param('id') id: string) {
    return this.invoiceService.getInvoiceById(id);
  }
}
