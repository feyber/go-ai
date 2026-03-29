import { S3Client } from "@aws-sdk/client-s3";

// Cloudflare R2 uses the S3-compatible API
// Think of this as the "key to the warehouse" — it creates a connection to your R2 storage
export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET = process.env.R2_BUCKET_NAME || "go-ai-video";
