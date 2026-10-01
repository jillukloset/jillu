// Reproduces the exact presign → PUT → HEAD pipeline used by the sell flow.
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { readFileSync } from 'node:fs';

// minimal .env parse (dotenv isn't a dependency)
for (const line of readFileSync('.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
  if (m) process.env[m[1]] ??= m[2];
}

const s3 = new S3Client({
  region: process.env.S3_REGION ?? 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
  },
});
const BUCKET = process.env.S3_BUCKET ?? 'jillu-media';

const objectKey = `debug/test-${Date.now()}.png`;
const png = readFileSync('public/logo.png'); // any real png in repo

try {
  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: BUCKET, Key: objectKey, ContentType: 'image/png' }),
    { expiresIn: 300 },
  );
  console.log('PRESIGN OK, url host:', new URL(uploadUrl).host);

  const put = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: png });
  console.log('PUT status:', put.status, (await put.text()).slice(0, 200));

  const head = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: objectKey }));
  console.log('HEAD OK, size:', head.ContentLength);
} catch (e) {
  console.log('FAILED:', e?.name, '-', e?.message);
  if (e?.$response) console.log('HTTP:', e.$response?.statusCode, JSON.stringify(e.$response?.headers ?? {}).slice(0, 300));
}
