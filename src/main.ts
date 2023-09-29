import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as expressBasicAuth from 'express-basic-auth';
import * as dotenv from 'dotenv';

dotenv.config();

console.log('process.env.NODE_ENV', process.env.NODE_ENV);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const SWAGGER_ENVS = ['local', 'dev'];
  const stage = process.env.NODE_ENV;

  if (SWAGGER_ENVS.includes(stage)) {
    console.log(process.env.SWAGGER_USER, process.env.SWAGGER_PASSWORD);

    app.use(
      ['/docs', '/docs-json'],
      expressBasicAuth({
        challenge: true,
        users: {
          [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD,
        },
      }),
    );
    const config = new DocumentBuilder()
      .setTitle('NestJS project')
      .setDescription('NestJS project API description')
      .setVersion('0.1')
      .addBearerAuth()
      .build();
    const customOptions: SwaggerCustomOptions = {
      swaggerOptions: {
        persistAuthorization: true,
      },
    };
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, customOptions);
  }
  // ValidationPipe 전역 적용
  app.useGlobalPipes(
    new ValidationPipe({
      // class-transformer 적용
      transform: true,
    }),
  );

  const port = 3000;
  await app.listen(port);
  console.info(`listening on port ${port}`);
}
bootstrap();
