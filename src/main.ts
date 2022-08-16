import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  let doc: OpenAPIObject;

  if (process.env.NODE_ENV === 'dev') {
    const config = new DocumentBuilder()
      .setTitle('FanFixiv 업로드 Swagger')
      .setDescription('Fanfixiv 인증 RestApi Swagger입니다.')
      .setVersion('1.0')
      .addTag('temp')
      .build();
    doc = SwaggerModule.createDocument(app, config);
  }
  if (process.env.DEV_SERVER) {
    Object.keys(doc.paths).forEach(function (key) {
      const newkey = '/upload' + key;
      doc.paths[newkey] = doc.paths[key];
      delete doc.paths[key];
    });
  }
  SwaggerModule.setup('api', app, doc);

  await app.listen(3000);
}
bootstrap();
