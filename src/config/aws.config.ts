import { S3Client } from '@aws-sdk/client-s3';
import { config } from 'dotenv';

config({
  path: `.env.${process.env.NODE_ENV}`,
});

export const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
