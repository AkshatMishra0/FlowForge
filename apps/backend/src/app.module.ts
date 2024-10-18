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
    AuthModule,
    BusinessModule,
    WhatsappModule,
    InvoiceModule,
    BookingModule,
    LeadModule,
    DashboardModule,
    SchedulerModule,
    AnalyticsModule,
  ],
})
export class AppModule {}

// Integrated analytics module - Modified: 2025-12-25 20:07:24
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
