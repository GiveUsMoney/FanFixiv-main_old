import { Test, TestingModule } from '@nestjs/testing';
import { ClassSerializerInterceptor, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { TagEntity } from '@src/entities/tag.entity';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { TagTypes } from '@src/interfaces/tag.interface';
import { ValidationPipe } from '@nestjs/common/pipes';
import { TypeOrmConfigService } from '@src/config/db.config';
import { TagModule } from '@src/tag/tag.module';
import { ConfigModule } from '@nestjs/config';
import { instanceToPlain } from 'class-transformer';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TagDetailDto, TagResultDto } from '@src/dto/tag.dto';
import { ArtistProfileEntity } from '@src/entities/artist-profile.entity';

describe('TagController - list (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;

  let tagRepository: Repository<TagEntity>;
  let profileRepository: Repository<ArtistProfileEntity>;

  let testArtistTag: TagEntity;

  let testArtistProfile1: ArtistProfileEntity;
  let testArtistProfile2: ArtistProfileEntity;

  let testTag: TagEntity;
  let testAdultTag: TagEntity;

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
        TypeOrmModule.forFeature([ArtistProfileEntity]),
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
          provide: getRepositoryToken(ArtistProfileEntity),
          useClass: Repository<ArtistProfileEntity>,
        },
      ],
    }).compile();

    app = module.createNestApplication();

    tagRepository = module.get<Repository<TagEntity>>(
      getRepositoryToken(TagEntity),
    );
    profileRepository = module.get<Repository<ArtistProfileEntity>>(
      getRepositoryToken(ArtistProfileEntity),
    );

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();

    testArtistTag = await tagRepository.save(
      new TagEntity({
        type: TagTypes.ARTIST,
        name: '태그-리스트 테스트 작가',
        description: '테스트용 캐릭터입니다.',
        status: true,
        isAdult: false,
      }),
    );

    testArtistProfile1 = await profileRepository.save(
      new ArtistProfileEntity({
        artistProfile: 'www.twitter.com',
        tag: testArtistTag,
      }),
    );

    testArtistProfile2 = await profileRepository.save(
      new ArtistProfileEntity({
        artistProfile: 'www.pixiv.com',
        tag: testArtistTag,
      }),
    );

    testTag = await tagRepository.save(
      new TagEntity({
        type: TagTypes.CHARACTOR,
        name: '태그-리스트 테스트 캐릭터',
        description: '테스트용 캐릭터입니다.',
        status: true,
        isAdult: false,
      }),
    );

    testAdultTag = await tagRepository.save(
      new TagEntity({
        type: TagTypes.CHARACTOR,
        name: '태그-리스트 테스트 캐릭터 (성인)',
        description: '테스트용 캐릭터입니다. (성인)',
        status: true,
        isAdult: true,
      }),
    );
  });

  describe('/tag/list (GET)', () => {
    let normalResult: Record<string, any>;
    let adultResult: Record<string, any>;
    let artistResult: Record<string, any>;

    beforeAll(async () => {
      normalResult = instanceToPlain([new TagResultDto(testTag)]);
      adultResult = instanceToPlain([
        new TagResultDto(testTag),
        new TagResultDto(testAdultTag),
      ]);
      artistResult = instanceToPlain([new TagResultDto(testArtistTag)]);
    });

    test('200', () => {
      return request(app.getHttpServer())
        .get(`/tag/list?limit=5&type=CHARACTOR`)
        .expect(200)
        .expect(normalResult);
    });

    test('200 (adult)', () => {
      return request(app.getHttpServer())
        .get(`/tag/list?limit=5&type=CHARACTOR`)
        .set('Authorization', 'Bearer ADULT')
        .expect(200)
        .expect(adultResult);
    });

    test('200 (artist profile)', () => {
      return request(app.getHttpServer())
        .get(`/tag/list?limit=5&type=ARTIST`)
        .expect(200)
        .expect(artistResult);
    });

    test('400', () => {
      return request(app.getHttpServer()).get(`/tag/list`).expect(400);
    });
  });

  describe('/tag/detail/:seq (GET)', () => {
    let tagSeq: number;
    let tagAdultSeq: number;
    let tagArtistSeq: number;

    let normalResult: Record<string, any>;
    let adultResult: Record<string, any>;
    let artistResult: Record<string, any>;

    beforeAll(async () => {
      tagSeq = testTag.seq;
      tagAdultSeq = testAdultTag.seq;
      tagArtistSeq = testArtistTag.seq;

      normalResult = instanceToPlain(new TagDetailDto(testTag));
      normalResult.profiles = [];
      adultResult = instanceToPlain(new TagDetailDto(testAdultTag));
      adultResult.profiles = [];
      artistResult = instanceToPlain(new TagDetailDto(testArtistTag));
      artistResult.profiles = ['www.twitter.com', 'www.pixiv.com'];
    });

    test('200', () => {
      return request(app.getHttpServer())
        .get(`/tag/detail/${tagSeq}`)
        .expect(200)
        .expect(normalResult);
    });

    test('200 (adult)', () => {
      return request(app.getHttpServer())
        .get(`/tag/detail/${tagAdultSeq}`)
        .set('Authorization', 'Bearer ADULT')
        .expect(200)
        .expect(adultResult);
    });

    test('200 (artist profile)', () => {
      return request(app.getHttpServer())
        .get(`/tag/detail/${tagArtistSeq}`)
        .expect(200)
        .expect(artistResult);
    });

    test('400', () => {
      return request(app.getHttpServer()).get(`/tag/detail/test`).expect(400);
    });
  });

  afterAll(async () => {
    await profileRepository.remove(testArtistProfile1);
    await profileRepository.remove(testArtistProfile2);

    await tagRepository.remove(testArtistTag);
    await tagRepository.remove(testTag);
    await tagRepository.remove(testAdultTag);

    await app.close();
    await module.close();
  });
});
