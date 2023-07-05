import { Test, TestingModule } from '@nestjs/testing';
import { ClassSerializerInterceptor, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ValidationPipe } from '@nestjs/common/pipes';
import { TypeOrmConfigService } from '@src/config/db.config';
import { ConfigModule } from '@nestjs/config';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SeriesModule } from '@src/series/series.module';
import { SeriesEntity } from '@src/entities/series.entity';
import { ContentEntity } from '@src/entities/content.entity';
import { SeriesWithContentDto } from '@src/dto/series.dto';

describe('SeriesController (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;

  let seriesRepository: Repository<SeriesEntity>;
  let contentRepository: Repository<ContentEntity>;

  let series: SeriesEntity;
  let seriesAdult: SeriesEntity;

  const contents = [];
  const contentsAdult = [];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: `.env.${process.env.NODE_ENV}`,
        }),
        TypeOrmModule.forRootAsync({
          useClass: TypeOrmConfigService,
        }),
        TypeOrmModule.forFeature([ContentEntity]),
        SeriesModule,
      ],
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: ClassSerializerInterceptor,
        },
        {
          provide: getRepositoryToken(SeriesEntity),
          useClass: Repository<SeriesEntity>,
        },
        {
          provide: getRepositoryToken(ContentEntity),
          useClass: Repository<ContentEntity>,
        },
      ],
    }).compile();

    app = module.createNestApplication();

    seriesRepository = module.get<Repository<SeriesEntity>>(
      getRepositoryToken(SeriesEntity),
    );
    contentRepository = module.get<Repository<ContentEntity>>(
      getRepositoryToken(ContentEntity),
    );

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();

    series = await seriesRepository.save(
      new SeriesEntity({
        title: '시리즈 테스트 시리즈',
      }),
    );

    seriesAdult = await seriesRepository.save(
      new SeriesEntity({
        title: '시리즈 테스트 시리즈 성인용',
      }),
    );

    for (let i = 0; i < 5; i++) {
      const item = await contentRepository.save(
        new ContentEntity({
          createdAt: new Date(),
          title: `시리즈 테스트 컨텐츠 ${i}`,
          thumbnail: 'http://example.com/image.jpg',
          isAdult: false,
          translateReview: '번역 후기',
          tags: [],
          series: series,
          source: [],
          status: true,
          uploaderSeq: -1,
        }),
      );
      contents.push(item);
    }

    for (let i = 0; i < 5; i++) {
      const item = await contentRepository.save(
        new ContentEntity({
          createdAt: new Date(),
          title: `시리즈 테스트 컨텐츠 성인용 ${i}`,
          thumbnail: 'http://example.com/image.jpg',
          isAdult: true,
          translateReview: '번역 후기',
          tags: [],
          series: seriesAdult,
          source: [],
          status: true,
          uploaderSeq: -1,
        }),
      );
      contentsAdult.push(item);
    }
  });

  describe('/series/:seq (GET)', () => {
    let result: Record<string, any>;
    let resultAdult: Record<string, any>;
    let resultNoContent: Record<string, any>;

    beforeAll(async () => {
      series.content = contents;
      seriesAdult.content = contentsAdult;
      result = instanceToPlain(plainToInstance(SeriesWithContentDto, series));
      resultAdult = instanceToPlain(
        plainToInstance(SeriesWithContentDto, seriesAdult),
      );
      seriesAdult.content = [];
      resultNoContent = instanceToPlain(
        plainToInstance(SeriesWithContentDto, seriesAdult),
      );
    });

    test('200', () => {
      return request(app.getHttpServer())
        .get(`/series/${series.seq}`)
        .expect(200)
        .expect(result);
    });

    test('200 (Adult)', () => {
      return request(app.getHttpServer())
        .get(`/series/${seriesAdult.seq}`)
        .set('Authorization', 'Bearer ADULT')
        .expect(200)
        .expect(resultAdult);
    });

    test('200 (no content)', () => {
      return request(app.getHttpServer())
        .get(`/series/${seriesAdult.seq}`)
        .expect(200)
        .expect(resultNoContent);
    });

    test('400', () => {
      return request(app.getHttpServer()).get(`/series/test`).expect(400);
    });
  });

  afterAll(async () => {
    for (let i = 0; i < 5; i++) {
      await contentRepository.remove(contents[i]);
    }
    for (let i = 0; i < 5; i++) {
      await contentRepository.remove(contentsAdult[i]);
    }
    await seriesRepository.remove(series);
    await seriesRepository.remove(seriesAdult);

    await app.close();
    await module.close();
  });
});
