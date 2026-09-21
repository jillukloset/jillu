import { S3Client } from '@aws-sdk/client-s3';

export const s3 = new S3Client({
  region: process.env.S3_REGION ?? 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
  },
});

export const S3_BUCKET = process.env.S3_BUCKET ?? 'jillu-media';

export function publicUrlForKey(objectKey: string) {
  const base = process.env.S3_PUBLIC_URL ?? '';
  return `${base.replace(/\/$/, '')}/${objectKey}`;
}
