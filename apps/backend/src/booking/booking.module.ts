import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { GoogleCalendarService } from './google-calendar.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { SchedulerModule } from '../scheduler/scheduler.module';

@Module({
  imports: [WhatsappModule, SchedulerModule],
  controllers: [BookingController],
  providers: [BookingService, GoogleCalendarService],
  exports: [BookingService],
})
export class BookingModule {}
