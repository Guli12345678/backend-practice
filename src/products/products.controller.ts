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

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly imageUploadService: ImageUploadService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('with-file')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create product with file upload (RECOMMENDED)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Product image file (JPEG, PNG, GIF, WebP)',
        },
        name: {
          type: 'string',
          description: 'Product name',
          example: 'iPhone 15 Pro',
        },
        description: {
          type: 'string',
          description: 'Product description',
          example: 'Latest iPhone with advanced features',
        },
        price: {
          type: 'number',
          description: 'Product price',
          example: 999.99,
        },
        categoryId: {
          type: 'integer',
          description: 'Category ID',
          example: 1,
        },
        is_active: {
          type: 'boolean',
          description: 'Product active status',
          example: true,
        },
      },
      required: ['name', 'price', 'categoryId', 'image'],
    },
  })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Valid JWT token required.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or file' })
  async createWithFile(
    @Body() createProductDto: any,
    @UploadedFile() file: Express.Multer.File,
    @GetCurrentUser() user: UserPayload,
  ) {
    try {
      let imageUrl = '';

      if (file) {
        imageUrl = `/uploads/products/${file.filename}`;
      }

      const productData: CreateProductDto = {
        name: createProductDto.name,
        description: createProductDto.description,
        price: parseFloat(createProductDto.price),
        categoryId: parseInt(createProductDto.categoryId),
        is_active: createProductDto.is_active === 'true',
        image: imageUrl,
        userId: user.id,
      };

      return this.productsService.create(productData, user.id);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create product with base64 image (Alternative method)',
  })
  @ApiBody({
    type: CreateProductWithImageDto,
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

  @UseGuards(AuthGuard)
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload product image file only' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPEG, PNG, GIF, WebP) - Max 5MB',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Image uploaded successfully' },
        fileName: { type: 'string', example: 'uuid-filename.jpg' },
        imageUrl: {
          type: 'string',
          example: '/uploads/products/uuid-filename.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Valid JWT token required.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid image file or file too large',
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('Image file is required');
      }

      const imageUrl = `/uploads/products/${file.filename}`;

      return {
        message: 'Image uploaded successfully',
        fileName: file.filename,
        imageUrl,
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Post('upload-base64')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Upload product image (Base64) - Alternative method',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          description: 'Base64 encoded image data with data URL prefix',
          example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Image uploaded successfully' },
        fileName: { type: 'string', example: 'uuid-filename.jpg' },
        imageUrl: {
          type: 'string',
          example: '/uploads/products/uuid-filename.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Valid JWT token required.',
  })
  @ApiResponse({ status: 400, description: 'Invalid base64 image data' })
  async uploadImageBase64(@Body('image') imageData: string) {
    try {
      if (!imageData) {
        throw new BadRequestException('Image data is required');
      }

      const fileName = await this.imageUploadService.saveImage(imageData);
      const imageUrl = this.imageUploadService.getImageUrl(fileName);

      return {
        message: 'Image uploaded successfully',
        fileName,
        imageUrl,
      };
    } catch (error) {
      console.error('Error uploading image:', error);
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
