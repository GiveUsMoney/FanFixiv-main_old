import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { BadRequestFilter } from './common/filter/bad-request.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  let doc: OpenAPIObject;

  // NODE_ENV가 dev일때만 Swagger를 표시합니다
  if (process.env.NODE_ENV === 'dev') {
    const _config = new DocumentBuilder()
      .setTitle('FanFixiv 업로드 Swagger')
      .setDescription('Fanfixiv 인증 RestApi Swagger입니다.')
      .setVersion('1.0')
      .addTag('temp');

    // 개발 서버에 배포된 경우 /upload path를 추가합니다
    if (process.env.DEV_SERVER) {
      _config.addServer('/upload');
    }

    const config = _config.build();
    config.openapi = '3.0.0';
    doc = SwaggerModule.createDocument(app, config);
  }
  // /api path에 swagger를 표시합니다.
  SwaggerModule.setup('api', app, doc);

  // 전역 class-validator 검사 파이프 사용 (후일 커스텀 파이프로 교체 예정)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalFilters(new BadRequestFilter());

  await app.listen(3000);
}
bootstrap();
