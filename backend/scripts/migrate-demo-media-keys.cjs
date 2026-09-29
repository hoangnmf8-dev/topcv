// Usage: node scripts/migrate-demo-media-keys.cjs [--apply]
// --apply copies each referenced legacy object to a UUIDv7 key, updates the DB,
// then deletes the old R2 object. Without --apply, this script only reports work.
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env"), quiet: true });

const {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");
const { Client } = require("pg");
const { uuidv7 } = require("uuidv7");

const apply = process.argv.includes("--apply");
const publicBucket = process.env.R2_PUBLIC_BUCKET_NAME || process.env.R2_BUCKET_NAME;
const privateBucket = process.env.R2_PRIVATE_BUCKET_NAME || process.env.R2_BUCKET_NAME;
const uuidV7 = "[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";

if (!publicBucket || !privateBucket) throw new Error("Missing R2 bucket configuration");

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
const db = new Client({ connectionString: process.env.DATABASE_URL });

function extensionFromContentType(contentType) {
  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
  };
  const extension = extensions[contentType || ""];
  if (!extension) throw new Error(`Unsupported R2 content type: ${contentType || "missing"}`);
  return extension;
}

function isCurrentKey(item) {
  const extensions = item.kind === "cv" ? "pdf" : "jpg|png|webp";
  return new RegExp(
    `^seed/topcv/${item.folder}/${item.accountId}/${item.kind}-${uuidV7}\\.(${extensions})$`,
    "i",
  ).test(item.key);
}

function copySource(bucket, key) {
  return `${bucket}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

async function copyAndVerify(item) {
  const source = await s3.send(new HeadObjectCommand({ Bucket: item.bucket, Key: item.key }));
  const extension = extensionFromContentType(source.ContentType);
  const newKey = `seed/topcv/${item.folder}/${item.accountId}/${item.kind}-${uuidv7()}.${extension}`;

  await s3.send(
    new CopyObjectCommand({
      Bucket: item.bucket,
      Key: newKey,
      CopySource: copySource(item.bucket, item.key),
    }),
  );

  const copied = await s3.send(new HeadObjectCommand({ Bucket: item.bucket, Key: newKey }));
  if (copied.ContentLength !== source.ContentLength || copied.ETag !== source.ETag) {
    throw new Error(`R2 copy verification failed for ${item.key}`);
  }

  return { ...item, newKey };
}

async function loadReferences() {
  const avatars = await db.query(
    `SELECT id, account_id, avatar_key FROM candidate WHERE avatar_key IS NOT NULL`,
  );
  const companies = await db.query(
    `SELECT id, account_id, logo_key, banner_key FROM company WHERE logo_key IS NOT NULL OR banner_key IS NOT NULL`,
  );
  const cvs = await db.query(
    `SELECT cv.id, candidate.account_id, cv.file_key FROM cvs cv JOIN candidate ON candidate.id = cv.candidate_id WHERE cv.file_key IS NOT NULL`,
  );

  return [
    ...avatars.rows.map((row) => ({
      table: "candidate",
      id: row.id,
      column: "avatar_key",
      key: row.avatar_key,
      accountId: row.account_id,
      folder: "candidates",
      kind: "avatar",
      bucket: publicBucket,
    })),
    ...companies.rows.flatMap((row) => [
      row.logo_key && {
        table: "company",
        id: row.id,
        column: "logo_key",
        key: row.logo_key,
        accountId: row.account_id,
        folder: "companies",
        kind: "logo",
        bucket: publicBucket,
      },
      row.banner_key && {
        table: "company",
        id: row.id,
        column: "banner_key",
        key: row.banner_key,
        accountId: row.account_id,
        folder: "companies",
        kind: "banner",
        bucket: publicBucket,
      },
    ].filter(Boolean)),
    ...cvs.rows.map((row) => ({
      table: "cvs",
      id: row.id,
      column: "file_key",
      key: row.file_key,
      accountId: row.account_id,
      folder: "candidates",
      kind: "cv",
      bucket: privateBucket,
    })),
  ];
}

(async () => {
  try {
    await db.connect();
    const references = await loadReferences();
    const legacy = references.filter((item) => !isCurrentKey(item));
    console.log(JSON.stringify({ referenced: references.length, legacy: legacy.length, apply }));
    if (!apply || legacy.length === 0) return;

    const migrated = [];
    for (const item of legacy) migrated.push(await copyAndVerify(item));

    await db.query("BEGIN");
    try {
      for (const item of migrated) {
        await db.query(
          `UPDATE ${item.table} SET ${item.column} = $1 WHERE id = $2 AND ${item.column} = $3`,
          [item.newKey, item.id, item.key],
        );
      }
      await db.query("COMMIT");
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }

    const oldObjects = new Map();
    for (const item of migrated) oldObjects.set(`${item.bucket}:${item.key}`, item);
    for (const item of oldObjects.values()) {
      await s3.send(new DeleteObjectCommand({ Bucket: item.bucket, Key: item.key }));
    }

    console.log(JSON.stringify({ migrated: migrated.length, deletedOldObjects: oldObjects.size }));
  } finally {
    await db.end();
  }
})().catch((error) => {
  console.error(error.name, error.message);
  process.exitCode = 1;
});
