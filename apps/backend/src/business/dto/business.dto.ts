import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBusinessDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class UpdateBusinessDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  razorpayKeyId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  razorpayKeySecret?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  whatsappPhoneNumberId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  whatsappAccessToken?: string;
}
