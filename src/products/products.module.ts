import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ImageUploadService } from '../common/services/image-upload.service';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [ProductsController],
  providers: [ProductsService, ImageUploadService],
})
export class ProductsModule {}
