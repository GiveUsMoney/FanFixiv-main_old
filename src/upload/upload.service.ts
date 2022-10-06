import { CopyObjectCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { AWS_S3_BUCKET_NAME, s3 } from '@src/config/aws.config';
import { FileLocationDto } from '@src/dto/upload.dto';

@Injectable()
export class UploadService {
  async toProfile(dto: FileLocationDto): Promise<{ status: number }> {
    const realKey = dto.key.split('/').pop();

    await s3.send(
      new CopyObjectCommand({
        Bucket: AWS_S3_BUCKET_NAME,
        Key: 'profile/' + realKey,
        CopySource: AWS_S3_BUCKET_NAME + '/temp/' + realKey,
      }),
    );

    return { status: 200 };
  }
}
