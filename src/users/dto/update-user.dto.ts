import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Gender, Role } from '../../../generated/prisma';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'Updated full name',
    example: 'John Smith',
    required: false,
  })
  full_name?: string;

  @ApiProperty({
    description: 'Updated phone number',
    example: '+1234567890',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'Updated email address',
    example: 'johnsmith@example.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'Updated password',
    example: 'newpassword123',
    required: false,
  })
  password?: string;

  @ApiProperty({
    description: 'Updated gender',
    enum: Gender,
    example: 'MALE',
    required: false,
  })
  gender?: Gender;

  @ApiProperty({
    description: 'Updated birth date',
    example: '1990-01-01',
    required: false,
  })
  birth_date?: string;

  @ApiProperty({
    description: 'Updated role',
    enum: Role,
    example: 'USER',
    required: false,
  })
  role?: Role;
}
