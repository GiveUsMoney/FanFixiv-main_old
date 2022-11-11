import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@src/app.module';
import { ContentEntity } from '@src/entities/content.entity';
import { Repository } from 'typeorm';
import { TagEntity } from '@src/entities/tag.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TagTypes } from '@src/interfaces/tag.interface';
import { instanceToPlain } from 'class-transformer';
import { ContentCardDto, ContentResultDto } from '@src/dto/content.dto';

describe('ContentController (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;

  let tagRepository: Repository<TagEntity>;
  let contentRepository: Repository<ContentEntity>;

  let testTag1: TagEntity;
  let testTag2: TagEntity;

  let contentWith1: ContentEntity;
  let contentWith2: ContentEntity;
  let contentWith12: ContentEntity;
  let contentWith12Adult: ContentEntity;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
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

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();

    testTag1 = await tagRepository.save(
      new TagEntity({
        type: TagTypes.CHARACTOR,
        name: '테스트 캐릭터 1',
        description: '테스트용 캐릭터입니다.',
        status: true,
        isAdult: false,
      }),
    );

    testTag2 = await tagRepository.save(
      new TagEntity({
        type: TagTypes.CHARACTOR,
        name: '테스트 캐릭터 2',
        description: '테스트용 캐릭터입니다.',
        status: true,
        isAdult: false,
      }),
    );

    contentWith1 = await contentRepository.save(
      new ContentEntity({
        createdAt: new Date(),
        title: '테스트 컨텐츠 1',
        thumbnail: 'http://example.com/image.jpg',
        isAdult: false,
        translateReview: '번역 후기',
        tags: [testTag1],
      }),
    );

    contentWith2 = await contentRepository.save(
      new ContentEntity({
        createdAt: new Date(),
        title: '테스트 컨텐츠 2',
        thumbnail: 'http://example.com/image.jpg',
        isAdult: false,
        translateReview: '번역 후기',
        tags: [testTag2],
      }),
    );

    contentWith12 = await contentRepository.save(
      new ContentEntity({
        createdAt: new Date(),
        title: '테스트 컨텐츠 1,2',
        thumbnail: 'http://example.com/image.jpg',
        isAdult: false,
        translateReview: '번역 후기',
        tags: [testTag1, testTag2],
      }),
    );

    contentWith12Adult = await contentRepository.save(
      new ContentEntity({
        createdAt: new Date(),
        title: '성인 테스트 컨텐츠 1,2',
        thumbnail: 'http://example.com/image.jpg',
        isAdult: true,
        translateReview: '번역 후기',
        tags: [testTag1, testTag2],
      }),
    );
  });

  describe('/content (GET)', () => {
    let seq1: number;
    let seq2: number;

    let contents: ContentEntity[];

    let result: Record<string, any>;
    let result1: Record<string, any>;
    let result2: Record<string, any>;
    let result12: Record<string, any>;
    let result12Adult: Record<string, any>;

    let resultPaging: Record<string, any>;

    beforeAll(async () => {
      seq1 = testTag1.seq;
      seq2 = testTag2.seq;

      function contentToPlain(contents: ContentEntity[]) {
        const plain = instanceToPlain(
          contents.map((x) => {
            const content = new ContentCardDto(x);
            content.like = 0;
            content.doLike = false;
            return content;
          }),
        );
        plain.map((x: Record<string, any>) => {
          x.createdAt = (x.createdAt as Date).toISOString();
          return x;
        });
        return plain;
      }

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

    test('200', () => {
      return request(app.getHttpServer())
        .get(`/content?count=3&page=1`)
        .expect(200)
        .expect(result);
    });

    test('200 (with Tag1)', () => {
      return request(app.getHttpServer())
        .get(`/content?count=3&page=1&tags=${seq1}`)
        .expect(200)
        .expect(result1);
    });

    test('200 (with Tag2)', () => {
      return request(app.getHttpServer())
        .get(`/content?count=3&page=1&tags=${seq2}`)
        .expect(200)
        .expect(result2);
    });

    test('200 (with Tag1 and Tag2)', () => {
      return request(app.getHttpServer())
        .get(`/content?count=3&page=1&tags=${seq1},${seq2}`)
        .expect(200)
        .expect(result12);
    });

    test('200 (adult)', () => {
      return request(app.getHttpServer())
        .get(`/content?count=3&page=1&tags=${seq1},${seq2}`)
        .set('Authorization', 'Bearer TESTTOKEN')
        .expect(200)
        .expect(result12Adult);
    });

    test('200 (paging)', () => {
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

  afterAll(async () => {
    await tagRepository.remove(testTag1);
    await tagRepository.remove(testTag2);
    await contentRepository.remove(contentWith1);
    await contentRepository.remove(contentWith2);
    await contentRepository.remove(contentWith12);
    await contentRepository.remove(contentWith12Adult);

    await app.close();
    await module.close();
  });
});
