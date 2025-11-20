import { Controller, Post, Get, Body, Query, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WhatsappService } from './whatsapp.service';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('WhatsApp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(private whatsappService: WhatsappService) {}

  @Post('send')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send WhatsApp message' })
  async sendMessage(@Body() dto: SendMessageDto, @Query('businessId') businessId: string) {
    return this.whatsappService.sendMessage(businessId, dto);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'WhatsApp webhook endpoint' })
  async webhook(@Body() payload: any, @Query('hub.mode') mode?: string, @Query('hub.verify_token') token?: string, @Query('hub.challenge') challenge?: string) {
    // Webhook verification
    if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      return challenge;
    }

    // Handle incoming messages
    await this.whatsappService.handleWebhook(payload);
    return { success: true };
  }

  @Get('messages')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get message logs' })
  async getMessages(@Query('businessId') businessId: string, @Query() filters: any) {
    return this.whatsappService.getMessages(businessId, filters);
  }

  @Get('messages/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get message by ID' })
  async getMessage(@Param('id') id: string) {
    return this.whatsappService.getMessageById(id);
  }
}
