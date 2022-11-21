import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { ContentEntity } from '@src/entities/content.entity';
import { Repository } from 'typeorm';
import { TagEntity } from '@src/entities/tag.entity';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ExtraTagTypes, TagTypes } from '@src/interfaces/tag.interface';
import { instanceToPlain } from 'class-transformer';
import { ContentCardDto, ContentResultDto } from '@src/dto/content.dto';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmConfigService } from '@src/config/db.config';
import { ContentModule } from '@src/content/content.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LikesModule } from '@src/likes/like.module';
import { JwtAuthGuard } from '@src/common/guard/jwt-auth.guard';
import { JwtStrategy } from '@src/common/strategy/jwt.strategy';
import { LikesEntity } from '@src/entities/likes.entity';

describe('ContentController, LikesController (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;

  let tagRepository: Repository<TagEntity>;
  let contentRepository: Repository<ContentEntity>;
  let likesRepository: Repository<LikesEntity>;

  let testTagArtist: TagEntity;

  let testTag1: TagEntity;
  let testTag2: TagEntity;
  let testTagPop: TagEntity;
  let testTagLike: TagEntity;

  let contentWith1: ContentEntity;
  let contentWith2: ContentEntity;
  let contentWith12: ContentEntity;
  let contentWith12Adult: ContentEntity;

  function contentToPlain(contents: ContentEntity[], like?: number) {
    const plain = instanceToPlain(
      contents.map((x) => {
        const content = new ContentCardDto(x);
        content.like = like ?? 0;
        content.doLike = !!like;
        return content;
      }),
    );
    plain.map((x: Record<string, any>) => {
      x.createdAt = (x.createdAt as Date).toISOString();
      return x;
    });
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
        ContentModule,
        LikesModule,
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
          provide: getRepositoryToken(LikesEntity),
          useClass: Repository<LikesEntity>,
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
    likesRepository = module.get<Repository<LikesEntity>>(
      getRepositoryToken(LikesEntity),
    );

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();

    testTagArtist = await tagRepository.save(
      new TagEntity({
        type: TagTypes.ARTIST,
        name: '컨텐츠-좋아요 테스트 작가',
        description: '테스트용 작가입니다.',
        status: true,
        isAdult: false,
      }),
    );

    testTag1 = await tagRepository.save(
      new TagEntity({
        type: TagTypes.CHARACTOR,
        name: '컨텐츠-좋아요 테스트 캐릭터 1',
        description: '테스트용 캐릭터입니다.',
        status: true,
        isAdult: false,
      }),
    );

    testTag2 = await tagRepository.save(
      new TagEntity({
        type: TagTypes.CHARACTOR,
        name: '컨텐츠-좋아요 테스트 캐릭터 2',
        description: '테스트용 캐릭터입니다.',
        status: true,
        isAdult: false,
      }),
    );

    testTagPop = await tagRepository.save(
      new TagEntity({
        type: TagTypes.EXTRA,
        name: '인기',
        description: '좋아요 5 이상의 태그',
        status: true,
        isAdult: false,
        extraTag: ExtraTagTypes.POPULARITY,
      }),
    );

    testTagLike = await tagRepository.save(
      new TagEntity({
        type: TagTypes.EXTRA,
        name: '좋아요',
        description: '좋아요해 둔 태그',
        status: true,
        isAdult: false,
        extraTag: ExtraTagTypes.LIKES,
      }),
    );

    contentWith1 = await contentRepository.save(
      new ContentEntity({
        createdAt: new Date(),
        title: '컨텐츠-좋아요 테스트 컨텐츠 1',
        thumbnail: 'http://example.com/image.jpg',
        isAdult: false,
        translateReview: '번역 후기',
        tags: [testTag1],
        artist: testTagArtist,
        status: true,
        uploaderSeq: -1,
      }),
    );

    contentWith2 = await contentRepository.save(
      new ContentEntity({
        createdAt: new Date(),
        title: '컨텐츠-좋아요 테스트 컨텐츠 2',
        thumbnail: 'http://example.com/image.jpg',
        isAdult: false,
        translateReview: '번역 후기',
        tags: [testTag2],
        artist: testTagArtist,
        status: true,
        uploaderSeq: -1,
      }),
    );

    contentWith12 = await contentRepository.save(
      new ContentEntity({
        createdAt: new Date(),
        title: '컨텐츠-좋아요 테스트 컨텐츠 1,2',
        thumbnail: 'http://example.com/image.jpg',
        isAdult: false,
        translateReview: '번역 후기',
        tags: [testTag1, testTag2],
        artist: testTagArtist,
        status: true,
        uploaderSeq: -1,
      }),
    );

    contentWith12Adult = await contentRepository.save(
      new ContentEntity({
        createdAt: new Date(),
        title: '컨텐츠-좋아요 성인 테스트 컨텐츠 1,2',
        thumbnail: 'http://example.com/image.jpg',
        isAdult: true,
        translateReview: '번역 후기',
        tags: [testTag1, testTag2],
        artist: testTagArtist,
        status: true,
        uploaderSeq: -1,
      }),
    );
  });

  describe('/content (GET)', () => {
    let contents: ContentEntity[];

    let result: Record<string, any>;
    let result1: Record<string, any>;
    let result2: Record<string, any>;
    let result12: Record<string, any>;
    let result12Adult: Record<string, any>;

    let resultPaging: Record<string, any>;

    let tagSeq1: number;
    let tagSeq2: number;

    beforeAll(async () => {
      tagSeq1 = testTag1.seq;
      tagSeq2 = testTag2.seq;
      contents = [contentWith12, contentWith2, contentWith1];
      const cardTag = contentToPlain(contents);
      result = instanceToPlain(
        new ContentResultDto({
          pageCount: 1,
          content: cardTag,
        }),
      );

      contents = [contentWith12, contentWith1];
      const cardTag1 = contentToPlain(contents);
      result1 = instanceToPlain(
        new ContentResultDto({
          pageCount: 1,
          content: cardTag1,
        }),
      );

      contents = [contentWith12, contentWith2];
      const cardTag2 = contentToPlain(contents);
      result2 = instanceToPlain(
        new ContentResultDto({
          pageCount: 1,
          content: cardTag2,
        }),
      );

      contents = [contentWith12];
      const cardTag12 = contentToPlain(contents);
      result12 = instanceToPlain(
        new ContentResultDto({
          pageCount: 1,
          content: cardTag12,
        }),
      );

      contents = [contentWith12Adult, contentWith12];
      const cardTag12Adult = contentToPlain(contents);
      result12Adult = instanceToPlain(
        new ContentResultDto({
          pageCount: 1,
          content: cardTag12Adult,
        }),
      );

      contents = [contentWith2];
      const cardTagPaging = contentToPlain(contents);
      resultPaging = instanceToPlain(
        new ContentResultDto({
          pageCount: 3,
          content: cardTagPaging,
        }),
      );
    });

    test('200 (no Tag)', () => {
      return request(app.getHttpServer())
        .get(`/content?count=3&page=1`)
        .expect(200)
        .expect(result);
    });

    test('200 (with Tag1)', () => {
      return request(app.getHttpServer())
        .get(`/content?count=3&page=1&tags=${tagSeq1}`)
        .expect(200)
        .expect(result1);
    });

    test('200 (with Tag2)', () => {
      return request(app.getHttpServer())
        .get(`/content?count=3&page=1&tags=${tagSeq2}`)
        .expect(200)
        .expect(result2);
    });

    test('200 (with Tag1 and Tag2)', () => {
      return request(app.getHttpServer())
        .get(`/content?count=3&page=1&tags=${tagSeq1},${tagSeq2}`)
        .expect(200)
        .expect(result12);
    });

    test('200 (Adult)', () => {
      return request(app.getHttpServer())
        .get(`/content?count=3&page=1&tags=${tagSeq1},${tagSeq2}`)
        .set('Authorization', 'Bearer ADULT')
        .expect(200)
        .expect(result12Adult);
    });

    test('200 (Paging)', () => {
      return request(app.getHttpServer())
        .get(`/content?count=1&page=2`)
        .expect(200)
        .expect(resultPaging);
    });

    test('400', () => {
      return request(app.getHttpServer())
        .get(`/content?count=1&page=1&tags=sdsded`)
        .expect(400);
    });
  });

  describe('/content (GET) (EXTRA_TAG)', () => {
    let result: Record<string, any>;

    beforeAll(async () => {
      for (let i = 0; i < 5; i++) {
        await likesRepository.save(
          new LikesEntity({
            userSeq: 1,
            content: contentWith1,
          }),
        );
      }

      const contents = [contentWith1];
      const cardTagLike = contentToPlain(contents, 5);
      result = instanceToPlain(
        new ContentResultDto({
          pageCount: 1,
          content: cardTagLike,
        }),
      );
    });

    test('200 (LIKES)', () => {
      return request(app.getHttpServer())
        .get(`/content?count=1&page=1&tags=${testTagLike.seq}`)
        .set('Authorization', 'Bearer ADULT')
        .expect(200)
        .expect(result);
    });

    test('200 (POP)', () => {
      return request(app.getHttpServer())
        .get(`/content?count=1&page=1&tags=${testTagPop.seq}`)
        .set('Authorization', 'Bearer ADULT')
        .expect(200)
        .expect(result);
    });
  });

  describe('/like (POST)', () => {
    let result: Record<string, any>;
    let contentSeq: number;

    let tagSeq1: number;
    let tagSeq2: number;

    beforeAll(async () => {
      contentSeq = contentWith12.seq;
      tagSeq1 = testTag1.seq;
      tagSeq2 = testTag2.seq;

      const contents = [contentWith12];
      const cardTag12 = contentToPlain(contents, 1);
      result = instanceToPlain(
        new ContentResultDto({
          pageCount: 1,
          content: cardTag12,
        }),
      );
    });

    test('200', async () => {
      await request(app.getHttpServer())
        .post(`/likes/${contentSeq}`)
        .set('Authorization', 'Bearer ADULT')
        .expect(200)
        .expect({ like: 1 });
      await request(app.getHttpServer())
        .get(`/content?count=1&page=1&tags=${tagSeq1},${tagSeq2}`)
        .expect(200)
        .expect(result);
      await request(app.getHttpServer())
        .post(`/likes/${contentSeq}`)
        .set('Authorization', 'Bearer ADULT')
        .expect(200)
        .expect({ like: 0 });
    });

    test('400', () => {
      return request(app.getHttpServer()).post(`/likes/0`).expect(400);
    });
  });

  afterAll(async () => {
    await tagRepository.remove(testTag1);
    await tagRepository.remove(testTag2);
    await tagRepository.remove(testTagPop);
    await tagRepository.remove(testTagLike);
    await contentRepository.remove(contentWith1);
    await contentRepository.remove(contentWith2);
    await contentRepository.remove(contentWith12);
    await contentRepository.remove(contentWith12Adult);
    await tagRepository.remove(testTagArtist);

    await app.close();
    await module.close();
  });
});
