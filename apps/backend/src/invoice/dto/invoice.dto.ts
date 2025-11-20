import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class InvoiceItemDto {
  @ApiProperty({ example: 'Web Development Service' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  unitPrice: number;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  amount: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  customerName: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @ApiProperty({ example: '919876543210' })
  @IsString()
  customerPhone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customerAddress?: string;

  @ApiProperty({ type: [InvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  tax?: number;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiProperty({ example: 'INR', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  dueDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  leadId?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  sendPaymentLink?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  sendWhatsApp?: boolean;
}

export class UpdateInvoiceStatusDto {
  @ApiProperty({ example: 'paid' })
  @IsString()
  status: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  paymentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  orderId?: string;
}
