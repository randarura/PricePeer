import { NextResponse } from "next/server";
import { appendFile, mkdir } from "fs/promises";
import path from "path";

type Body = {
  email?: string;
  saas_url?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: Body;

  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const entry = {
    email,
    saas_url: body.saas_url?.trim() || null,
    created_at: new Date().toISOString(),
  };

  try {
    const dataDir = path.join(process.cwd(), "data");
    await mkdir(dataDir, { recursive: true });
    await appendFile(
      path.join(dataDir, "waitlist.jsonl"),
      `${JSON.stringify(entry)}\n`,
      "utf8",
    );
  } catch (error) {
    // Persistent storage may be unavailable on some hosts; still accept signup
    console.error("[waitlist] failed to persist entry", error);
  }

  return NextResponse.json({ ok: true });
}
