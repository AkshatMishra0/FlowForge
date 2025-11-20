import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LeadService } from './lead.service';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';

@ApiTags('Leads')
@Controller('leads')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class LeadController {
  constructor(private leadService: LeadService) {}

  @Post()
  async createLead(@Body() dto: CreateLeadDto, @Query('businessId') businessId: string) {
    return this.leadService.createLead(businessId, dto);
  }

  @Patch(':id')
  async updateLead(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leadService.updateLead(id, dto);
  }

  @Get()
  async getLeads(@Query('businessId') businessId: string, @Query() filters: any) {
    return this.leadService.getLeads(businessId, filters);
  }

  @Get(':id')
  async getLead(@Param('id') id: string) {
    return this.leadService.getLeadById(id);
  }

  @Delete(':id')
  async deleteLead(@Param('id') id: string) {
    return this.leadService.deleteLead(id);
  }
}
