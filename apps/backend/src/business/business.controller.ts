import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { CreateBusinessDto, UpdateBusinessDto } from './dto/business.dto';

@ApiTags('Business')
@Controller('business')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class BusinessController {
  constructor(private businessService: BusinessService) {}

  @Post()
  async createBusiness(@Body() dto: CreateBusinessDto, @Req() req: any) {
    return this.businessService.createBusiness(req.user.id, dto);
  }

  @Patch(':id')
  async updateBusiness(@Param('id') id: string, @Body() dto: UpdateBusinessDto) {
    return this.businessService.updateBusiness(id, dto);
  }

  @Get(':id')
  async getBusiness(@Param('id') id: string) {
    return this.businessService.getBusinessById(id);
  }

  @Get()
  async getUserBusinesses(@Req() req: any) {
    return this.businessService.getUserBusinesses(req.user.id);
  }
}
