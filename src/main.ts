import 'reflect-metadata';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NODE_ENV, PORT } from './constant';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { snapshot: true });

  // Swagger docs
  if (NODE_ENV !== 'production') {
    // Swagger configuration
    const options = new DocumentBuilder()
      .setTitle('Your API')
      .setDescription('API description')
      .setVersion('1.0')
      .addBearerAuth() // Enable bearer token authorization
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('docs', app, document);
  }

  app.use(helmet());

  await app.listen(PORT);
}
bootstrap();
