import { IsString, IsEmail, IsOptional, IsPhoneNumber, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: 'John Doe', description: 'Customer full name' })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiProperty({ example: '+919876543210', description: 'Customer phone number (Indian format)' })
  @IsPhoneNumber('IN', { message: 'Please provide a valid Indian phone number' })
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;

  @ApiProperty({ example: 'john@example.com', required: false, description: 'Customer email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;
}

export class UpdateCustomerDto {
  @ApiProperty({ example: 'John Doe', required: false, description: 'Customer full name' })
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string;

  @ApiProperty({ example: '+919876543210', required: false, description: 'Customer phone number (Indian format)' })
  @IsPhoneNumber('IN', { message: 'Please provide a valid Indian phone number' })
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'john@example.com', required: false, description: 'Customer email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;
}