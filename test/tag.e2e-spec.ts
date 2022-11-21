import { Test, TestingModule } from '@nestjs/testing';
import { ClassSerializerInterceptor, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { TagEntity, TagNameEntity } from '@src/entities/tag.entity';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { TagTypes } from '@src/interfaces/tag.interface';
import { ValidationPipe } from '@nestjs/common/pipes';
import { TypeOrmConfigService } from '@src/config/db.config';
import { TagModule } from '@src/tag/tag.module';
import { ConfigModule } from '@nestjs/config';
import { instanceToPlain } from 'class-transformer';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TagDescriptionDto, TagResultDto } from '@src/dto/tag.dto';

describe('TagController (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;

  let tagRepository: Repository<TagEntity>;
  let tagNameRepository: Repository<TagNameEntity>;

  let testTag: TagEntity;
  let testAdultTag: TagEntity;
  let testTagName: TagNameEntity;

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
        TypeOrmModule.forFeature([TagNameEntity]),
        TagModule,
      ],
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: ClassSerializerInterceptor,
        },
        {
          provide: getRepositoryToken(TagEntity),
          useClass: Repository<TagEntity>,
        },
        {
          provide: getRepositoryToken(TagNameEntity),
          useClass: Repository<TagNameEntity>,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    tagRepository = module.get<Repository<TagEntity>>(
      getRepositoryToken(TagEntity),
    );
    tagNameRepository = module.get<Repository<TagNameEntity>>(
      getRepositoryToken(TagNameEntity),
    );

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();

    testTagName = await tagNameRepository.save(
      new TagNameEntity({
        typeSeq: TagTypes.CHARACTOR,
        typeName: '캐릭터',
      }),
    );

    testTag = await tagRepository.save(
      new TagEntity({
        type: TagTypes.CHARACTOR,
        name: '태그 테스트 캐릭터',
        description: '테스트용 캐릭터입니다.',
        status: true,
        isAdult: false,
      }),
    );

    testAdultTag = await tagRepository.save(
      new TagEntity({
        type: TagTypes.CHARACTOR,
        name: '태그 테스트 캐릭터 (성인)',
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
        .set('Authorization', 'Bearer ADULT')
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
        .set('Authorization', 'Bearer ADULT')
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
    await tagNameRepository.remove(testTagName);

    await app.close();
    await module.close();
  });
});
