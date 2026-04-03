import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../lib/middleware";
import { createRecord, getRecords } from "@repo/api";
import { RecordCreateSchema, RecordFilterSchema } from "@repo/validation";
import { cacheGet, cacheSet, invalidatePattern } from "@repo/cache";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const rawFilters = Object.fromEntries(searchParams.entries());
  const parsed = RecordFilterSchema.safeParse(rawFilters);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const cacheKey = `records:${auth.user.id}:${JSON.stringify(parsed.data)}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  const result = await getRecords(auth.user.id, auth.user.role, parsed.data);
  await cacheSet(cacheKey, result, 60);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, "Analyst");
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const parsed = RecordCreateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const record = await createRecord(auth.user.id, parsed.data);
  await invalidatePattern(`records:${auth.user.id}:*`);
  await invalidatePattern(`dashboard:${auth.user.id}:*`);
  return NextResponse.json({ record }, { status: 201 });
}
