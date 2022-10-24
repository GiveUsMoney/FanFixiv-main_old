import { AWS_S3_BUCKET_NAME, s3 } from '@src/config/aws.config';
import * as multerS3 from 'multer-s3';

export const TempImageStorage = multerS3({
  s3: s3,
  bucket: AWS_S3_BUCKET_NAME,
  acl: 'public-read',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req: Express.Request, file: Express.Multer.File, cb: any) {
    cb(
      null,
      'temp/' +
        Date.now().toString() +
        '.' +
        file.originalname.split('.').pop(),
    );
  },
});
