import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductWithImageDto {
  @ApiProperty({ description: 'Product name', example: 'iPhone 15 Pro' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Latest iPhone with advanced features',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Product price', example: 999.99 })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Product active status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    description: 'Product image as base64 string',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: 'Category ID', example: 1 })
  @IsInt()
  categoryId: number;
}
