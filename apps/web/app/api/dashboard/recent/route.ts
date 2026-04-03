import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/middleware";
import { getRecent } from "@repo/api";
import { cacheGet, cacheSet } from "@repo/cache";
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10", 10);
  const range = req.nextUrl.searchParams.get("range") || undefined;
  const type = req.nextUrl.searchParams.get("type") || undefined;

  const key = `dashboard:${auth.user.id}:recent:${limit}:${range || 'all'}:${type || 'all'}`;
  const cached = await cacheGet(key);
  if (cached) return NextResponse.json(cached);

  const data = await getRecent(auth.user.id, auth.user.role, limit, { range, type });
  await cacheSet(key, data, 120);
  return NextResponse.json(data);
}
