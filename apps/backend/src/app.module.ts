import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { InvoiceModule } from './invoice/invoice.module';
import { BookingModule } from './booking/booking.module';
import { LeadModule } from './lead/lead.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { BusinessModule } from './business/business.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    PrismaModule,
    AuthModule,
    BusinessModule,
    WhatsappModule,
    InvoiceModule,
    BookingModule,
    LeadModule,
    DashboardModule,
    SchedulerModule,
  ],
})
export class AppModule {}
