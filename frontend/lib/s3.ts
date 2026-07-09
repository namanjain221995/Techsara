import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET_NAME!;
const REGION = process.env.AWS_REGION!;

// Upload text/JSON/HTML to S3
export async function uploadToS3(
  key: string,
  body: string | Buffer,
  contentType: string
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  s3Cache.delete(key);
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

// Simple in-memory cache for S3 reads
const s3Cache = new Map<string, { value: string; expiresAt: number }>();
const CACHE_TTL_MS = 60_000; // 60 seconds

// Read file content from S3 as string
export async function readFromS3(key: string): Promise<string> {
  const cached = s3Cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }
  const res = await s3.send(
    new GetObjectCommand({ Bucket: BUCKET, Key: key })
  );
  const value = (await res.Body?.transformToString()) ?? '';
  s3Cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
}

// Delete a file from S3
export async function deleteFromS3(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({ Bucket: BUCKET, Key: key })
  );
  s3Cache.delete(key);
}

// List all files under a prefix (folder)
export async function listS3Folder(prefix: string) {
  const res = await s3.send(
    new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix })
  );
  return res.Contents ?? [];
}

// Build public URL for an image in images/ folder
export function getPublicImageUrl(key: string): string {
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

export { s3, BUCKET };
