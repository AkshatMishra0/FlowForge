import { IsString, IsEmail, IsOptional, IsPhoneNumber, MinLength, MaxLength } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsPhoneNumber('IN')
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

export class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsPhoneNumber('IN')
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

// Added validation decorators - Modified: 2025-12-25 20:07:16
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
// Change line 13 for this commit
// Change line 14 for this commit
// Change line 15 for this commit
// Change line 16 for this commit
// Change line 17 for this commit
// Change line 18 for this commit
