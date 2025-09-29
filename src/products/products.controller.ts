import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductWithImageDto } from './dto/create-product-with-image.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UserPayload } from '../common/types/user-payload';
import { GetCurrentUser } from '../common/decorators/get-current-user.decorator';
import { ProductOwnerGuard } from '../common/guards/product-owner.guard';
import { AuthGuard } from '../common/guards/jwt-auth.guard';
import { ImageUploadService } from '../common/services/image-upload.service';
import { PrismaService } from '../prisma/prisma.service';
import { UploadInterceptor } from '../common/interceptors/upload.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly imageUploadService: ImageUploadService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create product with base64 image (Alternative method)',
  })
  @ApiBody({
    description:
      'Create product with base64 encoded image. Use /with-file endpoint for file uploads.',
  })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Valid JWT token required.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or base64 image',
  })
  async create(
    @Body() createProductDto: CreateProductWithImageDto,
    @GetCurrentUser() user: UserPayload,
  ) {
    try {
      let imageUrl = '';

      if (createProductDto.image) {
        const fileName = await this.imageUploadService.saveImage(
          createProductDto.image,
        );
        imageUrl = this.imageUploadService.getImageUrl(fileName);
      }

      const productData: CreateProductDto = {
        ...createProductDto,
        image: imageUrl,
        userId: user.id,
      };

      return this.productsService.create(productData, user.id);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories for product creation' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  async getCategories() {
    return this.prisma.category.findMany();
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, ProductOwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update product (Owner only)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Access denied. Only product owner can update.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Valid JWT token required.',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, ProductOwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete product (Owner only)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Access denied. Only product owner can delete.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Valid JWT token required.',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
