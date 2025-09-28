import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
async function start() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  app.setGlobalPrefix('api');
  app.use(cookieParser());

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.enableCors({
    origin: 'http://localhost:4005',
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('E-commerce API')
    .setDescription('Mini E-commerce to test with frontend')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addCookieAuth('refreshToken', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refreshToken',
      description: 'Refresh token stored in httpOnly cookie',
    })
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const PORT = config.get<number>('PORT');
  await app.listen(PORT ?? 3001, () => {
    console.log('\n');
    console.log('____________________________');
    console.log('|                          |');
    console.log('|      .:::.   .:::.       |');
    console.log('|     :::::::.:::::::      |');
    console.log('|     :::::::G:::::::      |    🩷   Server is live!');
    console.log("|     ':::::::::::::'      |    🌐  http://localhost:" + PORT);
    console.log("|       ':::::::::'        |    ✨  Ready to serve with love");
    console.log("|         ':::::'          |");
    console.log("|           ':'            |");
    console.log('|__________________________|');
  });
}

start();
