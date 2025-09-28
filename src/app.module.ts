import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProductsModule,
    PrismaModule,
    CategoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
