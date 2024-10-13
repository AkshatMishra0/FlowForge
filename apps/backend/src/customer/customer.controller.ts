import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Get()
  async findAll(@CurrentUser('businessId') businessId: string) {
    return this.customerService.findAll(businessId);
  }

  @Get('top')
  async getTopCustomers(
    @CurrentUser('businessId') businessId: string,
    @Query('limit') limit?: number,
  ) {
    return this.customerService.getTopCustomers(businessId, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Get(':id/insights')
  async getInsights(@Param('id') id: string) {
    return this.customerService.getCustomerInsights(id);
  }

  @Post()
  async create(
    @CurrentUser('businessId') businessId: string,
    @Body() data: { name: string; phone: string; email?: string },
  ) {
    return this.customerService.create({ ...data, businessId });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.customerService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.customerService.delete(id);
    return { message: 'Customer deleted successfully' };
  }
}
