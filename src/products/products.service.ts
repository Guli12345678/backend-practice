import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createProductDto: CreateProductDto, userId: number) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id: createProductDto.categoryId },
      });

      if (!category) {
        throw new BadRequestException(
          `Category ID ${createProductDto.categoryId} does not exist.`,
        );
      }

      return this.prisma.product.create({
        data: {
          image: createProductDto.image,
          name: createProductDto.name,
          price: createProductDto.price,
          categoryId: createProductDto.categoryId,
          userId,
          description: createProductDto.description,
          is_active: createProductDto.is_active,
        },
      });
    } catch (error) {
      console.error('Error creating product:', error);
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Invalid category reference. The category does not exist.',
        );
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  remove(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }
}
