import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import {
  ContentEntity,
  ContentImageEntity,
  ContentSourceEntity,
} from '@src/entities/content.entity';
import { ArtistProfileEntity } from '@src/entities/artist-profile.entity';
import { LikesEntity } from '@src/entities/likes.entity';
import { SeriesEntity } from '@src/entities/series.entity';
import { TagEntity, TagNameEntity } from '@src/entities/tag.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('DB_HOST'),
      port: parseInt(this.configService.get('DB_PORT')),
      username: this.configService.get('DB_USER'),
      password: this.configService.get('DB_PW'),
      database: this.configService.get('DB_NAME'),
      synchronize: true,
      logging: process.env.NODE_ENV === 'dev',
      entities: [
        TagEntity,
        TagNameEntity,
        ContentEntity,
        ContentSourceEntity,
        ContentImageEntity,
        SeriesEntity,
        LikesEntity,
        ArtistProfileEntity,
      ],
      namingStrategy: new SnakeNamingStrategy(),
    };
  }
}
