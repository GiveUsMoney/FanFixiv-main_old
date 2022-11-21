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
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from '@src/common/guard/jwt-auth.guard';
import { ArtistProfileEntity } from '@src/entities/artist-profile.entity';
import { TagRequestDto } from '@src/dto/tag-request.dto';
import { JwtStrategy } from '@src/common/strategy/jwt.strategy';

describe('TagController (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;

  let tagRepository: Repository<TagEntity>;
  let artistProfileRepository: Repository<ArtistProfileEntity>;

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
        TagModule,
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
          provide: getRepositoryToken(ArtistProfileEntity),
          useClass: Repository<ArtistProfileEntity>,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    tagRepository = module.get<Repository<TagEntity>>(
      getRepositoryToken(TagEntity),
    );
    artistProfileRepository = module.get<Repository<ArtistProfileEntity>>(
      getRepositoryToken(ArtistProfileEntity),
    );

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();
  });

  describe('/tag (POST)', () => {
    let charatorTag: TagRequestDto;
    let artistTag: TagRequestDto;
    let artistTagWithSameProfile: TagRequestDto;
    let artistTagWithoutProfile: TagRequestDto;

    beforeAll(async () => {
      charatorTag = new TagRequestDto({
        type: TagTypes.CHARACTOR,
        name: '태그요청 테스트 캐릭터',
        description: '테스트 캐릭터입니다.',
      });
      artistTag = new TagRequestDto({
        type: TagTypes.ARTIST,
        name: '태그요청 테스트 작가 1',
        description: '테스트 작가입니다.',
        profiles: ['http://example.com', 'http://test.com'],
      });
      artistTagWithSameProfile = new TagRequestDto({
        type: TagTypes.ARTIST,
        name: '태그요청 테스트 작가 2',
        description: '테스트 작가2입니다.',
        profiles: ['http://example.com', 'http://test2.com'],
      });
      artistTagWithoutProfile = new TagRequestDto({
        type: TagTypes.ARTIST,
        name: '태그요청 테스트 작가 2',
        description: '테스트 작가2 입니다.',
      });
    });

    test('200 (CharactorTag)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/tag`)
        .set('Authorization', 'Bearer ADULT')
        .send(charatorTag)
        .expect(201);

      expect(res.body.seq).toEqual(expect.any(Number));
      expect(res.body.name).toEqual(charatorTag.name);
      expect(res.body.description).toEqual(charatorTag.description);

      const tagData = await tagRepository.findOne({
        where: {
          seq: res.body.seq,
        },
      });

      expect(tagData.seq).toEqual(expect.any(Number));
      expect(tagData.name).toEqual(charatorTag.name);
      expect(tagData.description).toEqual(charatorTag.description);
    });

    test('200/400 (ArtistTag)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/tag`)
        .set('Authorization', 'Bearer ADULT')
        .send(artistTag)
        .expect(201);

      expect(res.body.seq).toEqual(expect.any(Number));
      expect(res.body.name).toEqual(artistTag.name);
      expect(res.body.description).toEqual(artistTag.description);

      const tagData = await tagRepository.findOne({
        where: {
          seq: res.body.seq,
        },
      });

      expect(tagData.seq).toEqual(expect.any(Number));
      expect(tagData.name).toEqual(artistTag.name);
      expect(tagData.description).toEqual(artistTag.description);

      const profileData = await artistProfileRepository.find({
        relations: ['tag'],
        where: {
          tag: {
            seq: tagData.seq,
          },
        },
      });

      for (const i in profileData) {
        expect(profileData[i].seq).toEqual(expect.any(Number));
        expect(profileData[i].artistProfile).toEqual(artistTag.profiles[i]);
      }

      await request(app.getHttpServer())
        .post(`/tag`)
        .set('Authorization', 'Bearer ADULT')
        .send(artistTag)
        .expect(400);

      await request(app.getHttpServer())
        .post(`/tag`)
        .set('Authorization', 'Bearer ADULT')
        .send(artistTagWithSameProfile)
        .expect(400);
    });

    test('400 (ArtistTag without Profile)', () => {
      return request(app.getHttpServer())
        .post(`/tag`)
        .set('Authorization', 'Bearer ADULT')
        .send(artistTagWithoutProfile)
        .expect(400);
    });
  });

  afterAll(async () => {
    await artistProfileRepository.remove(await artistProfileRepository.find());
    await tagRepository.remove(await tagRepository.find());

    await app.close();
    await module.close();
  });
});
