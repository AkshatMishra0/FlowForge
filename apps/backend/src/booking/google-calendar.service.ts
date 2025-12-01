import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GoogleCalendarService {
  private calendar: any;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const oauth2Client = new google.auth.OAuth2(
      config.get('GOOGLE_CALENDAR_CLIENT_ID'),
      config.get('GOOGLE_CALENDAR_CLIENT_SECRET'),
      config.get('GOOGLE_CALENDAR_REDIRECT_URI'),
    );

    this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  }

  async createEvent(booking: any, businessId: string) {
    try {
      const business = await this.prisma.business.findUnique({
        where: { id: businessId },
      });

      if (!business?.googleCalendarToken) {
        return null;
      }

      // Set credentials
      const oauth2Client = new google.auth.OAuth2(
        this.config.get('GOOGLE_CALENDAR_CLIENT_ID'),
        this.config.get('GOOGLE_CALENDAR_CLIENT_SECRET'),
      );

      oauth2Client.setCredentials(JSON.parse(business.googleCalendarToken));

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      // Create event
      const startDateTime = new Date(booking.bookingDate);
      const [startHour, startMinute] = booking.startTime.split(':');
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0);

      const endDateTime = new Date(booking.bookingDate);
      const [endHour, endMinute] = booking.endTime.split(':');
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0);

      const event = {
        summary: `Booking: ${booking.customerName}`,
        description: booking.notes || '',
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: business.timezone,
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: business.timezone,
        },
        attendees: [{ email: booking.customerEmail }],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 },
          ],
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      // Update booking with Google event ID
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { googleEventId: response.data.id },
      });

      return response.data;
    } catch (error) {
      console.error('Google Calendar error:', error);
      return null;
    }
  }

  async updateEvent(booking: any, businessId: string) {
    try {
      const business = await this.prisma.business.findUnique({
        where: { id: businessId },
      });

      if (!business?.googleCalendarToken || !booking.googleEventId) {
        return null;
      }

      const oauth2Client = new google.auth.OAuth2(
        this.config.get('GOOGLE_CALENDAR_CLIENT_ID'),
        this.config.get('GOOGLE_CALENDAR_CLIENT_SECRET'),
      );

      oauth2Client.setCredentials(JSON.parse(business.googleCalendarToken));
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const startDateTime = new Date(booking.bookingDate);
      const [startHour, startMinute] = booking.startTime.split(':');
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0);

      const endDateTime = new Date(booking.bookingDate);
      const [endHour, endMinute] = booking.endTime.split(':');
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0);

      const event = {
        summary: `Booking: ${booking.customerName}`,
        description: booking.notes || '',
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: business.timezone,
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: business.timezone,
        },
      };

      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId: booking.googleEventId,
        requestBody: event,
      });

      return response.data;
    } catch (error) {
      console.error('Google Calendar error:', error);
      return null;
    }
  }

  async deleteEvent(booking: any, businessId: string) {
    try {
      const business = await this.prisma.business.findUnique({
        where: { id: businessId },
      });

      if (!business?.googleCalendarToken || !booking.googleEventId) {
        return null;
      }

      const oauth2Client = new google.auth.OAuth2(
        this.config.get('GOOGLE_CALENDAR_CLIENT_ID'),
        this.config.get('GOOGLE_CALENDAR_CLIENT_SECRET'),
      );

      oauth2Client.setCredentials(JSON.parse(business.googleCalendarToken));
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: booking.googleEventId,
      });

      return true;
    } catch (error) {
      console.error('Google Calendar error:', error);
      return false;
    }
  }
}
