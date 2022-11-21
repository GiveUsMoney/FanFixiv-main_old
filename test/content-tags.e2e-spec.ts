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
import { TagTypes } from '@src/interfaces/tag.interface';
import { instanceToPlain } from 'class-transformer';
import { ContentCardDto, ContentResultDto } from '@src/dto/content.dto';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmConfigService } from '@src/config/db.config';
import { ContentModule } from '@src/content/content.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from '@src/common/guard/jwt-auth.guard';
import { JwtStrategy } from '@src/common/strategy/jwt.strategy';

describe('ContentController - Tag (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;

  let tagRepository: Repository<TagEntity>;
  let contentRepository: Repository<ContentEntity>;

  let testTag1: TagEntity;
  let testTag2: TagEntity;
  let testTag3: TagEntity;
  let testTag4: TagEntity;
  let testArtistTag: TagEntity;

  let contentWith1: ContentEntity;
  let contentWith2: ContentEntity;

  function contentToPlain(contents: ContentEntity[], tags: TagEntity[]) {
    const plain = instanceToPlain(
      contents.map((x) => {
        const content = new ContentCardDto(x);
        content.like = 0;
        content.doLike = false;
        content.tags = tags;
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

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();

    testArtistTag = await tagRepository.save(
      new TagEntity({
        type: TagTypes.ARTIST,
        name: '컨텐츠-태그 테스트 작가 1',
        description: '테스트용 작가입니다.',
        status: true,
        isAdult: false,
      }),
    );

    testTag1 = await tagRepository.save(
      new TagEntity({
        type: TagTypes.CHARACTOR,
        name: '컨텐츠-태그 테스트 캐릭터 1',
        description: '테스트용 캐릭터입니다.',
        status: true,
        isAdult: false,
      }),
    );

    testTag2 = await tagRepository.save(
      new TagEntity({
        type: TagTypes.CHARACTOR,
        name: '컨텐츠-태그 테스트 캐릭터 2',
        description: '테스트용 캐릭터입니다.',
        status: true,
        isAdult: false,
      }),
    );

    testTag3 = await tagRepository.save(
      new TagEntity({
        type: TagTypes.CHARACTOR,
        name: '컨텐츠-태그 테스트 캐릭터 3',
        description: '테스트용 캐릭터입니다.',
        status: true,
        isAdult: false,
      }),
    );

    testTag4 = await tagRepository.save(
      new TagEntity({
        type: TagTypes.CHARACTOR,
        name: '컨텐츠-태그 테스트 캐릭터 4',
        description: '테스트용 캐릭터입니다.',
        status: true,
        isAdult: false,
      }),
    );

    contentWith1 = await contentRepository.save(
      new ContentEntity({
        createdAt: new Date(),
        title: '컨텐츠-태그 테스트 컨텐츠 1',
        thumbnail: 'http://example.com/image.jpg',
        isAdult: false,
        translateReview: '번역 후기',
        tags: [testTag1, testTag2, testTag3, testTag4],
        status: true,
        uploaderSeq: -1,
        artist: testArtistTag,
      }),
    );

    contentWith2 = await contentRepository.save(
      new ContentEntity({
        createdAt: new Date(),
        title: '컨텐츠-태그 테스트 컨텐츠 2',
        thumbnail: 'http://example.com/image.jpg',
        isAdult: false,
        translateReview: '번역 후기',
        tags: [testTag3, testTag4],
        status: true,
        uploaderSeq: -1,
        artist: testArtistTag,
      }),
    );
  });

  describe('/content (GET)', () => {
    let contents: ContentEntity[];

    let result: Record<string, any>;

    let tagSeq2: number;

    beforeAll(async () => {
      tagSeq2 = testTag2.seq;
      contents = [contentWith1];
      const cardTag = contentToPlain(contents, [testTag3, testTag4, testTag1]);
      result = instanceToPlain(
        new ContentResultDto({
          pageCount: 1,
          content: cardTag,
        }),
      );
    });

    test('200', () => {
      return request(app.getHttpServer())
        .get(`/content?count=1&page=1&tags=${tagSeq2}`)
        .expect(200)
        .expect(result);
    });
  });

  afterAll(async () => {
    await tagRepository.remove(testTag1);
    await tagRepository.remove(testTag2);
    await tagRepository.remove(testTag3);
    await tagRepository.remove(testTag4);
    await contentRepository.remove(contentWith1);
    await contentRepository.remove(contentWith2);
    await tagRepository.remove(testArtistTag);

    await app.close();
    await module.close();
  });
});
