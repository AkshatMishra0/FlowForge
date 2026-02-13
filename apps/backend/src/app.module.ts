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
import { AnalyticsModule } from './analytics/analytics.module';
import { CacheModule } from './cache/cache.module';
import { HealthModule } from './health/health.module';
import { AiModule } from './ai/ai.module';
import { EmailModule } from './email/email.module';
import { ReportsModule } from './reports/reports.module';
import { BulkOperationsModule } from './bulk-operations/bulk-operations.module';

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
    CacheModule,
    HealthModule,
    AuthModule,
    BusinessModule,
    WhatsappModule,
    InvoiceModule,
    BookingModule,
    LeadModule,
    DashboardModule,
    SchedulerModule,
    AnalyticsModule,
    AiModule,
    EmailModule,
    ReportsModule,
    BulkOperationsModule,
  ],
})
export class AppModule {}
