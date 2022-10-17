import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { TagEntity } from '@src/entities/tag.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '@src/app.module';
import { TagTypes } from '@src/interfaces/tag.interface';
import { TagService } from '@src/tag/tag.service';
import { TagDescriptionDto, TagResultDto } from '@src/dto/tag.dto';
import { ValidationPipe } from '@nestjs/common/pipes';
import { plainToInstance } from 'class-transformer';

describe('TagController (e2e)', () => {
  let app: INestApplication;
  let tagService: TagService;
  let tagRepository: Repository<TagEntity>;

  let testTag: TagEntity;
  let testAdultTag: TagEntity;

  const adultProfile = {
    email: '',
    nickname: '',
    profile_img: '',
    descript: '',

    nn_md_date: '',
    birth: '2000-01-01',
    _tr: false,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        TagService,
        {
          provide: getRepositoryToken(TagEntity),
          useClass: Repository<TagEntity>,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    tagRepository = moduleFixture.get<Repository<TagEntity>>(
      getRepositoryToken(TagEntity),
    );
    tagService = moduleFixture.get<TagService>(TagService);

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
    const limit = 5;
    let tags: TagEntity[];
    let normalResult: TagDescriptionDto[];
    let adultResult: TagDescriptionDto[];

    beforeAll(async () => {
      tags = await tagService.findAll(null, {
        limit,
      });

      normalResult = tags.map((item) => {
        const { ...obj } = plainToInstance(TagDescriptionDto, item);
        return obj;
      });

      tags = await tagService.findAll(adultProfile, {
        limit,
      });

      adultResult = tags.map((item) => {
        const { ...obj } = plainToInstance(TagDescriptionDto, item);
        return obj;
      });
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
    let tags: TagEntity[];
    let normalResult: TagResultDto[];
    let adultResult: TagResultDto[];

    beforeAll(async () => {
      tags = await tagService.find(null, {
        s: _s,
        limit,
      });

      normalResult = tags.map((item) => {
        const { ...obj } = plainToInstance(TagResultDto, item);
        return obj;
      });

      tags = await tagService.find(adultProfile, {
        s: _s,
        limit,
      });

      adultResult = tags.map((item) => {
        const { ...obj } = plainToInstance(TagResultDto, item);
        return obj;
      });
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
    tagRepository.delete(testTag.seq);
    tagRepository.delete(testAdultTag.seq);
  });
});
