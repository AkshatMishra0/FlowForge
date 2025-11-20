import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { WhatsappClient } from './whatsapp.client';

@Module({
  controllers: [WhatsappController],
  providers: [WhatsappService, WhatsappClient],
  exports: [WhatsappService],
})
export class WhatsappModule {}
