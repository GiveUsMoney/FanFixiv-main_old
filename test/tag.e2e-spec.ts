import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { TagEntity } from '@src/entities/tag.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '@src/app.module';
import { TagTypes } from '@src/interfaces/tag.interface';
import { TagService } from '@src/tag/tag.service';
import { TagDescriptionDto, TagResultDto } from '@src/dto/TagDto';
import { ValidationPipe } from '@nestjs/common/pipes';
import { plainToInstance } from 'class-transformer';

describe('TagController (e2e)', () => {
  let app: INestApplication;
  let tagService: TagService;
  let tagRepository: Repository<TagEntity>;

  let testTag: TagEntity;

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
        stauts: true,
        isAdult: false,
      }),
    );
  });

  describe('/tag/all (GET)', () => {
    const limit = 5;
    let tags: TagEntity[];
    let normalResult: TagDescriptionDto[];

    beforeAll(async () => {
      tags = await tagService.findAll(null, {
        limit,
      });

      normalResult = tags.map((item) => {
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

    test('400', () => {
      return request(app.getHttpServer())
        .get(`/tag/all?limit=test`)
        .expect(400);
    });
  });

  describe('/tag (GET)', () => {
    const limit = 5;
    const s = encodeURIComponent('테스트 캐릭터');
    let tags: TagEntity[];
    let normalResult;

    beforeAll(async () => {
      tags = await tagService.findAll(null, {
        limit,
      });

      normalResult = tags.map((item) => {
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
  });
});
