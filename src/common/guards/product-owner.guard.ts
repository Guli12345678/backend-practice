import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductOwnerGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {


    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const productId = parseInt(request.params.id);
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new ForbiddenException('Product not found');
    }

    if (product.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException("You can't modify this product");
    }

    return true;
  }
}
