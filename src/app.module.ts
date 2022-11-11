import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContentModule } from './content/content.module';
import { TypeOrmConfigService } from './config/db.config';
import { TagModule } from './tag/tag.module';
import { JwtStrategy } from './common/strategy/jwt.strategy';
import { ProfileImgModule } from './profile-img/profile-img.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { RedisConfigService } from './config/redis.config';
import { RabbitModule } from './rabbitmq/rabbit.module';
import { ShutDownService } from './common/event/shutdown.event';
import { LikesModule } from './likes/like.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitConfigService } from '@src/config/rabbit.config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './common/guard/jwt-auth.guard';
import { ActionInterceptor } from './common/interceptor/action.interceptor';

@Module({
  imports: [
    // .env 파일 가져오기
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    // TypeOrm 모듈 사용
    // 모든 Config는 TypeOrmConfigService에 존재.
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    RedisModule.forRootAsync({
      useClass: RedisConfigService,
    }),
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useClass: RabbitConfigService,
    }),
    // 이하는 API 모듈 일람
    TagModule,
    ContentModule,
    LikesModule,
    ProfileImgModule,
    RabbitModule,
  ],
  // 후일 삭제 바람.
  controllers: [AppController],
  providers: [
    // 후일 삭제 바람.
    AppService,
    //JWT 설정
    JwtStrategy,
    // 전역 직렬화 인터셉터 추가. (후일 전역이 아닌 다른 방식으로 교체 예정)
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    // 관리자 액션 전송 인터셉터
    {
      provide: APP_INTERCEPTOR,
      useClass: ActionInterceptor,
    },
    // 모든 API에 가드 추가 (Roles 추가가 되지 않으면 그냥 통과됨.)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    ShutDownService,
  ],
})
export class AppModule {}
