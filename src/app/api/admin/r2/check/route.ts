import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createR2Client } from "@/lib/r2";
import { HeadObjectCommand } from "@aws-sdk/client-s3";

export async function GET() {
  const report: any = {
    hasEndpoint: Boolean(env.R2_ENDPOINT),
    hasAccountId: Boolean(env.R2_ACCOUNT_ID),
    hasKeys: Boolean(env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY),
    bucket: env.R2_BUCKET || null,
    endpoint: env.R2_ENDPOINT || null,
    publicBaseUrl: env.R2_PUBLIC_BASE_URL || null,
    looksLikeCF: (env.R2_ENDPOINT || "").includes("cloudflarestorage"),
  };

  try {
    const s3 = createR2Client();
    // Probe: head a definitely-missing key. Valid creds + bucket → 404/NoSuchKey, invalid → 403/401/ENOTFOUND
    const key = `diag/does-not-exist-${Date.now()}`;
    try {
      await s3.send(new HeadObjectCommand({ Bucket: env.R2_BUCKET, Key: key }));
      report.head = { ok: true, unexpected: true };
    } catch (e: any) {
      report.head = { ok: false, code: e?.$metadata?.httpStatusCode, name: e?.name, message: e?.message };
    }
  } catch (e: any) {
    report.clientError = { message: e?.message };
  }

  return NextResponse.json(report);
}

