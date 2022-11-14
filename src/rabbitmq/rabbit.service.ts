import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { EXT_LIST } from '@src/common/storage/multer-s3.storage';
import { AWS_S3_BUCKET_NAME, s3 } from '@src/config/aws.config';
import { ProfileFormDto, ProfileFormResultDto } from '@src/dto/upload.dto';

@Injectable()
export class RabbitService {
  @RabbitRPC({
    exchange: 'fanfixiv.main',
    routingKey: 'profile-img.form',
    queue: 'profile-img.form',
  })
  public async profileImgFormHandler(
    dto: ProfileFormDto,
  ): Promise<ProfileFormResultDto> {
    try {
      const realKey = dto.key.split('/').pop();

      const [nameCheck, extCheck] = realKey.split('.');

      if (!/[^0-9]/.test(nameCheck) || !EXT_LIST.includes(extCheck)) {
        throw new Error('프로필 이미지 링크가 올바르지 않습니다.');
      }

      await s3.send(
        new CopyObjectCommand({
          Bucket: AWS_S3_BUCKET_NAME,
          Key: 'profile/origin/' + realKey,
          CopySource: AWS_S3_BUCKET_NAME + '/temp/' + realKey,
        }),
      );
      await s3.send(
        new DeleteObjectCommand({
          Bucket: AWS_S3_BUCKET_NAME,
          Key: dto.key,
        }),
      );

      return { status: 200, key: 'profile/origin/' + realKey };
    } catch (e: unknown) {
      console.error(e);
      let message = null;
      if (e instanceof Error) message = e.message;
      return { status: 400, key: '', message };
    }
  }
}
