import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { RazorpayClient } from './razorpay.client';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [WhatsappModule],
  controllers: [InvoiceController],
  providers: [InvoiceService, RazorpayClient],
  exports: [InvoiceService],
})
export class InvoiceModule {}
