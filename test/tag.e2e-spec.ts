import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { TagEntity } from '@src/entities/tag.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '@src/app.module';
import { TagTypes } from '@src/interfaces/tag.interface';
import { TagDescriptionDto, TagResultDto } from '@src/dto/tag.dto';
import { ValidationPipe } from '@nestjs/common/pipes';
import { instanceToPlain } from 'class-transformer';

describe('TagController (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;

  let tagRepository: Repository<TagEntity>;

  let testTag: TagEntity;
  let testAdultTag: TagEntity;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: getRepositoryToken(TagEntity),
          useClass: Repository<TagEntity>,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    tagRepository = module.get<Repository<TagEntity>>(
      getRepositoryToken(TagEntity),
    );

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();

    testTag = await tagRepository.save(
      new TagEntity({
        type: TagTypes.CHARACTOR,
        name: '테스트 캐릭터',
        description: '테스트용 캐릭터입니다.',
        status: true,
        isAdult: false,
      }),
    );

    testAdultTag = await tagRepository.save(
      new TagEntity({
        type: TagTypes.CHARACTOR,
        name: '테스트 캐릭터 (성인)',
        description: '테스트용 캐릭터입니다. (성인)',
        status: true,
        isAdult: true,
      }),
    );
  });

  describe('/tag/all (GET)', () => {
    let tags: any[];
    let normalResult: Record<string, any>;
    let adultResult: Record<string, any>;

    beforeAll(async () => {
      tags = [testTag];
      normalResult = instanceToPlain(
        tags.map((item) => new TagDescriptionDto(item)),
      );

      tags = [testTag, testAdultTag];
      adultResult = instanceToPlain(
        tags.map((item) => new TagDescriptionDto(item)),
      );
    });

    test('200', () => {
      return request(app.getHttpServer())
        .get(`/tag/all?limit=${5}`)
        .expect(200)
        .expect(normalResult);
    });

    test('200 (adult)', () => {
      return request(app.getHttpServer())
        .get(`/tag/all?limit=${5}`)
        .set('Authorization', 'Bearer TESTTOKEN')
        .expect(200)
        .expect(adultResult);
    });

    test('400', () => {
      return request(app.getHttpServer())
        .get(`/tag/all?limit=test`)
        .expect(400);
    });
  });

  describe('/tag (GET)', () => {
    const limit = 5;
    const _s = '테스트 캐릭터';
    const s = encodeURIComponent(_s);
    let tags: any[];
    let normalResult: Record<string, any>;
    let adultResult: Record<string, any>;

    beforeAll(async () => {
      tags = [testTag];
      normalResult = instanceToPlain(
        tags.map((item) => new TagResultDto(item)),
      );

      tags = [testTag, testAdultTag];
      adultResult = instanceToPlain(tags.map((item) => new TagResultDto(item)));
    });

    test('200', () => {
      return request(app.getHttpServer())
        .get(`/tag?s=${s}&limit=${limit}`)
        .expect(200)
        .expect(normalResult);
    });

    test('200 (adult)', () => {
      return request(app.getHttpServer())
        .get(`/tag?s=${s}&limit=${limit}`)
        .set('Authorization', 'Bearer TOKEN')
        .expect(200)
        .expect(adultResult);
    });

    test('400 (limit type wrong)', () => {
      return request(app.getHttpServer())
        .get(`/tag?s=${s}&limit=test`)
        .expect(400);
    });

    test('400 (s missing)', () => {
      return request(app.getHttpServer()).get(`/tag?limit=test`).expect(400);
    });
  });

  afterAll(async () => {
    await tagRepository.remove(testTag);
    await tagRepository.remove(testAdultTag);
    await app.close();
    await module.close();
  });
});
