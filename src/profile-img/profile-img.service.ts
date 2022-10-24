import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { AWS_S3_BUCKET_NAME, s3 } from '@src/config/aws.config';
import { ProfileFormDto, ProfileFormResultDto } from '@src/dto/upload.dto';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';

@Injectable()
export class ProfileImgService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async toProfile(dto: ProfileFormDto): Promise<ProfileFormResultDto> {
    const auth = await this.redis.get('REDIS_AUTH');

    if (auth !== dto.auth)
      return {
        status: 400,
        key: '',
        message: '사용자는 접근할수 없는 API입니다.',
      };
    else await this.redis.set('REDIS_AUTH', uuidv4());

    try {
      const realKey = dto.key.split('/').pop();

      await s3.send(
        new CopyObjectCommand({
          Bucket: AWS_S3_BUCKET_NAME,
          Key: 'profile/' + realKey,
          CopySource: AWS_S3_BUCKET_NAME + '/temp/' + realKey,
        }),
      );
      await s3.send(
        new DeleteObjectCommand({
          Bucket: AWS_S3_BUCKET_NAME,
          Key: dto.key,
        }),
      );

      return { status: 200, key: 'profile/' + realKey };
    } catch (e: unknown) {
      console.error(e);
      let message = null;
      if (e instanceof Error) message = e.message;
      return { status: 400, key: '', message };
    }
  }
}
