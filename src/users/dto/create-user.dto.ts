import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsInt,
  ValidateIf,
} from 'class-validator';
import { Gender, Role } from '../../../generated/prisma';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
  @IsString()
  full_name: string;

  @ApiProperty({ description: 'Phone number', example: '+1234567890' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password', example: 'password123' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Confirm password', example: 'password123' })
  @IsString()
  confirm_password: string;

  @ApiProperty({ description: 'Gender', enum: Gender, example: 'MALE' })
  gender: Gender;

  @ApiProperty({ description: 'Birth date', example: '1990-01-01' })
  @IsDateString()
  birth_date: string;

  @ApiProperty({ description: 'User role', enum: Role, example: 'USER' })
  role: Role;

  @ApiProperty({ description: 'Hashed refresh token', required: false })
  @IsOptional()
  @IsString()
  hashed_refresh_token?: string;

  @ApiProperty({ description: 'Account active status', required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ description: 'Activation link', required: false })
  activation_link?: string;
}
