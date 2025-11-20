import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: '919876543210' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Hello! This is a test message.', required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ example: 'text', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  templateName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  languageCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  templateComponents?: any[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  leadId?: string;
}
