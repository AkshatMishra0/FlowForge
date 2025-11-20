import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Post()
  async createBooking(@Body() dto: CreateBookingDto, @Query('businessId') businessId: string) {
    return this.bookingService.createBooking(businessId, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async updateBooking(@Param('id') id: string, @Body() dto: UpdateBookingDto) {
    return this.bookingService.updateBooking(id, dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async getBookings(@Query('businessId') businessId: string, @Query() filters: any) {
    return this.bookingService.getBookings(businessId, filters);
  }

  @Get('slots')
  async getAvailableSlots(@Query('businessId') businessId: string, @Query('date') date: string) {
    return this.bookingService.getAvailableSlots(businessId, new Date(date));
  }

  @Get(':id')
  async getBooking(@Param('id') id: string) {
    return this.bookingService.getBookingById(id);
  }
}
