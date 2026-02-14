import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Global search across all entities' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'businessId', required: true })
  @ApiQuery({ name: 'types', required: false, description: 'Entity types to search' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async globalSearch(
    @Query('q') query: string,
    @Query('businessId') businessId: string,
    @Query('types') types?: string,
    @Query('limit') limit?: number
  ) {
    return this.searchService.globalSearch({
      query,
      businessId,
      types: types?.split(',') as any,
      limit: limit ? +limit : 10,
    });
  }

  @Get('leads')
  @ApiOperation({ summary: 'Search leads only' })
  async searchLeads(
    @Query('q') query: string,
    @Query('businessId') businessId: string,
    @Query('limit') limit?: number
  ) {
    return this.searchService.searchLeads(query, businessId, limit ? +limit : 10);
  }

  @Get('leads/advanced')
  @ApiOperation({ summary: 'Advanced lead search with filters' })
  async advancedLeadSearch(
    @Query('businessId') businessId: string,
    @Query('q') query?: string,
    @Query('status') status?: string,
    @Query('source') source?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return this.searchService.advancedLeadSearch({
      businessId,
      query,
      status,
      source,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      assignedTo,
      limit: limit ? +limit : 50,
      offset: offset ? +offset : 0,
    });
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions' })
  async getSuggestions(
    @Query('q') query: string,
    @Query('businessId') businessId: string
  ) {
    return this.searchService.getSearchSuggestions(query, businessId);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Search invoices only' })
  async searchInvoices(
    @Query('q') query: string,
    @Query('businessId') businessId: string,
    @Query('limit') limit?: number
  ) {
    return this.searchService.searchInvoices(query, businessId, limit ? +limit : 10);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Search bookings only' })
  async searchBookings(
    @Query('q') query: string,
    @Query('businessId') businessId: string,
    @Query('limit') limit?: number
  ) {
    return this.searchService.searchBookings(query, businessId, limit ? +limit : 10);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Search messages only' })
  async searchMessages(
    @Query('q') query: string,
    @Query('businessId') businessId: string,
    @Query('limit') limit?: number
  ) {
    return this.searchService.searchMessages(query, businessId, limit ? +limit : 10);
  }
}
