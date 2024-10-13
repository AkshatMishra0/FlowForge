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

// Added new customer endpoints - Modified: 2025-12-25 20:07:13
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
// Change line 11 for this commit
// Change line 12 for this commit
