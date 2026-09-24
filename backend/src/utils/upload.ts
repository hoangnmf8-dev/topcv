import { S3Client } from "@aws-sdk/client-s3";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const R2_BUCKET_NAME = requiredEnv("R2_BUCKET_NAME");
export const r2Client = new S3Client({
  region: "auto",
  endpoint: requiredEnv("R2_ENDPOINT"),
  credentials: {
    accessKeyId: requiredEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requiredEnv("R2_SECRET_ACCESS_KEY"),
  },
});

export const R2_PRIVATE_BUCKET_NAME =
  process.env.R2_PRIVATE_BUCKET_NAME || R2_BUCKET_NAME;
export const R2_PUBLIC_BUCKET_NAME =
  process.env.R2_PUBLIC_BUCKET_NAME || R2_BUCKET_NAME;
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");
if (R2_PUBLIC_URL && R2_PUBLIC_BUCKET_NAME === R2_PRIVATE_BUCKET_NAME) {
  throw new Error("Public images and private CVs must use different buckets");
}
export function publicImageUrl(key: string): string | null {
  return R2_PUBLIC_URL
    ? R2_PUBLIC_URL + "/" + key.split("/").map(encodeURIComponent).join("/")
    : null;
}
