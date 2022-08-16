import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  let doc: OpenAPIObject;

  if (process.env.NODE_ENV === 'dev') {
    const _config = new DocumentBuilder()
      .setTitle('FanFixiv 업로드 Swagger')
      .setDescription('Fanfixiv 인증 RestApi Swagger입니다.')
      .setVersion('1.0')
      .addTag('temp');

    if (process.env.DEV_SERVER) {
      _config.addServer('/upload');
    }

    const config = _config.build();
    config.openapi = '3.0.0';
    doc = SwaggerModule.createDocument(app, config);
  }
  SwaggerModule.setup('api', app, doc);

  await app.listen(3000);
}
bootstrap();
