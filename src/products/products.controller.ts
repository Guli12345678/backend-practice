import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly imageUploadService: ImageUploadService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new product with image upload' })
  @ApiBody({ type: CreateProductWithImageDto })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Valid JWT token required.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Body() createProductDto: CreateProductWithImageDto,
    @GetCurrentUser() user: UserPayload,
  ) {
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
  }

  @UseGuards(AuthGuard)
  @Post('upload-image')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload product image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          description: 'Base64 encoded image data',
          example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Valid JWT token required.',
  })
  @ApiResponse({ status: 400, description: 'Invalid image data' })
  async uploadImage(@Body('image') imageData: string) {
    const fileName = await this.imageUploadService.saveImage(imageData);
    const imageUrl = this.imageUploadService.getImageUrl(fileName);

    return {
      message: 'Image uploaded successfully',
      fileName,
      imageUrl,
    };
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
