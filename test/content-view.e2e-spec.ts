import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import {
  ContentEntity,
  ContentImageEntity,
  ContentSourceEntity,
} from '@src/entities/content.entity';
import { Repository } from 'typeorm';
import { TagEntity } from '@src/entities/tag.entity';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { TagTypes } from '@src/interfaces/tag.interface';
import { instanceToPlain } from 'class-transformer';
import { ContentViewDto } from '@src/dto/content.dto';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmConfigService } from '@src/config/db.config';
import { ContentModule } from '@src/content/content.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from '@src/common/guard/jwt-auth.guard';
import { JwtStrategy } from '@src/common/strategy/jwt.strategy';
import { SeriesEntity } from '@src/entities/series.entity';
import { SourceType } from '@src/interfaces/content.interface';

describe('ContentController - View (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;

  let tagRepository: Repository<TagEntity>;
  let contentRepository: Repository<ContentEntity>;
  let imgRepository: Repository<ContentImageEntity>;
  let contentSourceRepository: Repository<ContentSourceEntity>;
  let seriesRepository: Repository<SeriesEntity>;

  let testArtistTag: TagEntity;

  const testImages: ContentImageEntity[] = [];

  let contentSource: ContentSourceEntity;

  let series: SeriesEntity;

  let contentTest: ContentEntity;
  let contentTestStatusFalse: ContentEntity;

  function contentToPlain(contents: ContentEntity) {
    contents.imgs = testImages;
    const content = new ContentViewDto(contents);
    content.like = 0;
    content.doLike = false;
    const plain = instanceToPlain(content);
    plain.createdAt = (plain.createdAt as Date).toISOString();
    return plain;
  }

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
        TypeOrmModule.forFeature([
          SeriesEntity,
          ContentSourceEntity,
          ContentImageEntity,
        ]),
        ContentModule,
      ],
      providers: [
        JwtStrategy,
        {
          provide: APP_INTERCEPTOR,
          useClass: ClassSerializerInterceptor,
        },
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        },
        {
          provide: getRepositoryToken(TagEntity),
          useClass: Repository<TagEntity>,
        },
        {
          provide: getRepositoryToken(ContentEntity),
          useClass: Repository<ContentEntity>,
        },
      ],
    }).compile();

    app = module.createNestApplication();

    tagRepository = module.get<Repository<TagEntity>>(
      getRepositoryToken(TagEntity),
    );
    contentRepository = module.get<Repository<ContentEntity>>(
      getRepositoryToken(ContentEntity),
    );
    imgRepository = module.get<Repository<ContentImageEntity>>(
      getRepositoryToken(ContentImageEntity),
    );
    contentSourceRepository = module.get<Repository<ContentSourceEntity>>(
      getRepositoryToken(ContentSourceEntity),
    );
    seriesRepository = module.get<Repository<SeriesEntity>>(
      getRepositoryToken(SeriesEntity),
    );

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();

    testArtistTag = await tagRepository.save(
      new TagEntity({
        type: TagTypes.ARTIST,
        name: '컨텐츠-뷰 테스트 작가',
        description: '테스트용 작가입니다.',
        status: true,
        isAdult: false,
      }),
    );

    series = await seriesRepository.save(
      new SeriesEntity({
        title: '컨텐츠-뷰 테스트 시리즈',
      }),
    );

    contentSource = await contentSourceRepository.save(
      new ContentSourceEntity({
        type: SourceType.ARTIST,
        link: 'http://example.com',
      }),
    );

    contentTestStatusFalse = await contentRepository.save(
      new ContentEntity({
        createdAt: new Date(),
        title: '컨텐츠-뷰 테스트 컨텐츠',
        thumbnail: 'http://example.com/image.jpg',
        isAdult: false,
        translateReview: '번역 후기',
        tags: [testArtistTag],
        series: series,
        source: [contentSource],
        artist: testArtistTag,
        status: false,
        uploaderSeq: -1,
      }),
    );

    contentTest = await contentRepository.save(
      new ContentEntity({
        createdAt: new Date(),
        title: '컨텐츠-뷰 테스트 컨텐츠',
        thumbnail: 'http://example.com/image.jpg',
        isAdult: false,
        translateReview: '번역 후기',
        tags: [testArtistTag],
        series: series,
        source: [contentSource],
        artist: testArtistTag,
        status: true,
        uploaderSeq: -1,
      }),
    );

    for (let i = 0; i < 5; i++) {
      const img = await imgRepository.save(
        new ContentImageEntity({
          link: `http://example.com/${i}`,
          content: contentTest,
        }),
      );
      testImages.push(img);
    }
  });

  describe('/content (GET)', () => {
    let result: Record<string, any>;

    beforeAll(async () => {
      result = contentToPlain(contentTest);
    });

    test('200', () => {
      return request(app.getHttpServer())
        .get(`/content/view/${contentTest.seq}`)
        .expect(200)
        .expect(result);
    });

    test('400 (NO SEQ)', () => {
      return request(app.getHttpServer())
        .get(`/content/view/${contentTest.seq + 100}`)
        .expect(400);
    });

    test('400 (Status False)', () => {
      return request(app.getHttpServer())
        .get(`/content/view/${contentTestStatusFalse.seq}`)
        .expect(400);
    });

    test('400 (Wrong SEQ)', () => {
      return request(app.getHttpServer()).get(`/content/view/test`).expect(400);
    });
  });

  afterAll(async () => {
    for (let i = 0; i < 5; i++) {
      await imgRepository.remove(testImages[i]);
    }
    await contentSourceRepository.remove(contentSource);
    await contentRepository.remove(contentTest);
    await contentRepository.remove(contentTestStatusFalse);
    await tagRepository.remove(testArtistTag);
    await seriesRepository.remove(series);

    await app.close();
    await module.close();
  });
});
