import { createId } from '@/lib/id';
import { HeadObjectCommand, DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppError } from '@/lib/api-result';
import { extensionForContentType } from '@/lib/media-config';
import { publicUrlForKey, s3, S3_BUCKET } from '@/lib/s3';
import type { PresignRequestInput } from './schemas';

const UPLOAD_URL_TTL_SECONDS = 300;

export async function createPresignedUpload(userId: string, input: PresignRequestInput) {
  const ext = extensionForContentType(input.contentType);
  const objectKey = `${input.folder}/${userId}/${createId()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: objectKey,
    ContentType: input.contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: UPLOAD_URL_TTL_SECONDS });

  return { uploadUrl, objectKey, publicUrl: publicUrlForKey(objectKey) };
}

async function streamToBuffer(body: unknown): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of body as AsyncIterable<Buffer | Uint8Array>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/**
 * A signed PutObject URL only proves the client sent the Content-Type header it claimed at
 * presign time — S3/MinIO never inspect the actual bytes. Without this, someone could upload
 * arbitrary content (HTML, a script, anything) labeled as an image. Check the file's magic
 * bytes match what its declared content type actually looks like.
 */
async function verifyImageMagicBytes(objectKey: string) {
  const range = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: objectKey, Range: 'bytes=0-15' }));
  const bytes = await streamToBuffer(range.Body);

  const isPng = bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isWebp =
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
    bytes.subarray(8, 12).toString('ascii') === 'WEBP';

  if (!isPng && !isJpeg && !isWebp) {
    await deleteObject(objectKey);
    throw new AppError('INVALID_IMAGE', 'That file does not look like a valid image.');
  }
}

export async function verifyUploadedObject(objectKey: string, maxBytes: number) {
  let head;
  try {
    head = await s3.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: objectKey }));
  } catch {
    throw new AppError('UPLOAD_NOT_FOUND', 'We could not find that upload. Please try again.', 404);
  }

  const size = head.ContentLength ?? 0;
  if (size === 0) {
    throw new AppError('EMPTY_UPLOAD', 'That upload appears to be empty.');
  }
  if (size > maxBytes) {
    await deleteObject(objectKey);
    throw new AppError('FILE_TOO_LARGE', 'That image is too large.');
  }

  await verifyImageMagicBytes(objectKey);

  return head;
}

export async function deleteObject(objectKey: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: objectKey }));
}

export function ensureOwnedObjectKey(objectKey: string, userId: string, folder: string) {
  if (!objectKey.startsWith(`${folder}/${userId}/`)) {
    throw new AppError('FORBIDDEN', 'You do not have access to that upload.', 403);
  }
}
