import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import {
  ContentEntity,
  ContentSourceEntity,
} from '@src/entities/content.entity';
import { Repository } from 'typeorm';
import { TagEntity } from '@src/entities/tag.entity';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { TagTypes } from '@src/interfaces/tag.interface';
import { instanceToPlain } from 'class-transformer';
import { ContentDetailDto } from '@src/dto/content.dto';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmConfigService } from '@src/config/db.config';
import { ContentModule } from '@src/content/content.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from '@src/common/guard/jwt-auth.guard';
import { JwtStrategy } from '@src/common/strategy/jwt.strategy';
import { SeriesEntity } from '@src/entities/series.entity';
import { SourceType } from '@src/interfaces/content.interface';

describe('ContentController - details (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;

  let tagRepository: Repository<TagEntity>;
  let contentRepository: Repository<ContentEntity>;
  let contentSourceRepository: Repository<ContentSourceEntity>;
  let seriesRepository: Repository<SeriesEntity>;

  let testTag: TagEntity;
  let testTagArtist: TagEntity;

  let contentSource: ContentSourceEntity;

  let series: SeriesEntity;

  let content: ContentEntity;
  let contentStatusFalse: ContentEntity;

  function contentToPlain(cnt: ContentEntity) {
    const c = new ContentDetailDto(cnt);
    c.like = 0;
    c.doLike = false;
    const plain = instanceToPlain(c);
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
        TypeOrmModule.forFeature([SeriesEntity, ContentSourceEntity]),
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
        {
          provide: getRepositoryToken(ContentSourceEntity),
          useClass: Repository<ContentSourceEntity>,
        },
        {
          provide: getRepositoryToken(SeriesEntity),
          useClass: Repository<SeriesEntity>,
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
    contentSourceRepository = module.get<Repository<ContentSourceEntity>>(
      getRepositoryToken(ContentSourceEntity),
    );
    seriesRepository = module.get<Repository<SeriesEntity>>(
      getRepositoryToken(SeriesEntity),
    );

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();

    testTagArtist = await tagRepository.save(
      new TagEntity({
        type: TagTypes.ARTIST,
        name: '컨텐츠-디테일 테스트 작가',
        description: '테스트용 작가입니다.',
        status: true,
        isAdult: false,
      }),
    );

    testTag = await tagRepository.save(
      new TagEntity({
        type: TagTypes.CHARACTOR,
        name: '컨텐츠-디테일 테스트 캐릭터',
        description: '테스트용 캐릭터입니다.',
        status: true,
        isAdult: false,
      }),
    );

    series = await seriesRepository.save(
      new SeriesEntity({
        title: '컨텐츠-디테일 테스트 시리즈',
      }),
    );

    contentSource = await contentSourceRepository.save(
      new ContentSourceEntity({
        type: SourceType.ARTIST,
        link: 'http://example.com',
      }),
    );

    contentStatusFalse = await contentRepository.save(
      new ContentEntity({
        createdAt: new Date(),
        title: '컨텐츠-디테일 테스트 컨텐츠 2',
        thumbnail: 'http://example.com/image.jpg',
        isAdult: false,
        translateReview: '번역 후기',
        tags: [testTagArtist, testTag],
        series: series,
        source: [contentSource],
        status: false,
        uploaderSeq: -1,
      }),
    );

    content = await contentRepository.save(
      new ContentEntity({
        createdAt: new Date(),
        title: '컨텐츠-디테일 테스트 컨텐츠 1',
        thumbnail: 'http://example.com/image.jpg',
        isAdult: false,
        translateReview: '번역 후기',
        tags: [testTagArtist, testTag],
        series: series,
        source: [contentSource],
        status: true,
        uploaderSeq: -1,
      }),
    );
  });

  describe('/content (GET)', () => {
    let result: Record<string, any>;

    beforeAll(async () => {
      result = contentToPlain(content);
    });

    test('200', () => {
      return request(app.getHttpServer())
        .get(`/content/${content.seq}`)
        .expect(200)
        .expect(result);
    });

    test('400 (NO SEQ)', () => {
      return request(app.getHttpServer())
        .get(`/content/${content.seq + 100}`)
        .expect(400);
    });

    test('400 (Status False)', () => {
      return request(app.getHttpServer())
        .get(`/content/${contentStatusFalse.seq}`)
        .expect(400);
    });

    test('400 (Wrong SEQ)', () => {
      return request(app.getHttpServer()).get(`/content/test`).expect(400);
    });
  });

  afterAll(async () => {
    await tagRepository.remove(testTag);
    await tagRepository.remove(testTagArtist);
    await contentSourceRepository.remove(contentSource);
    await contentRepository.remove(content);
    await contentRepository.remove(contentStatusFalse);
    await seriesRepository.remove(series);

    await app.close();
    await module.close();
  });
});
