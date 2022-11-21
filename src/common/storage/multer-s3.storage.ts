import { UnsupportedMediaTypeException } from '@nestjs/common';
import { AWS_S3_BUCKET_NAME, EXT_LIST, s3 } from '@src/config/aws.config';
import { Request } from 'express';
import * as multerS3 from 'multer-s3';

export const TempImageStorage = multerS3({
  s3: s3,
  bucket: AWS_S3_BUCKET_NAME,
  acl: 'public-read',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req: Express.Request, file: Express.Multer.File, cb: any) {
    const extName = file.originalname.split('.').pop();
    cb(null, 'temp/' + Date.now().toString() + '.' + extName);
  },
});

export const fileFilter = (_: Request, file: Express.Multer.File, cb: any) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
    if (EXT_LIST.includes(file.originalname.split('.').pop())) {
      cb(null, true);
      return;
    }
  }
  cb(
    new UnsupportedMediaTypeException(
      '이미지가 아닌 파일은 업로드 할수 없습니다.',
    ),
    false,
  );
};
