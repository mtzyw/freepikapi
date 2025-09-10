import { NextResponse } from "next/server";
import { qstashSchedulePoll } from "@/lib/qstash";

export async function POST() {
  const out = await qstashSchedulePoll(30);
  return NextResponse.json({ ok: out.scheduled });
}

