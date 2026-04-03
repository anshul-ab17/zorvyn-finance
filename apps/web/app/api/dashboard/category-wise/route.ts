import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/middleware";
import { getCategoryWise } from "@repo/api";
import { cacheGet, cacheSet } from "@repo/cache";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const key = `dashboard:${auth.user.id}:categories`;
  const cached = await cacheGet(key);
  if (cached) return NextResponse.json(cached);

  const data = await getCategoryWise(auth.user.id, auth.user.role);
  await cacheSet(key, data, 120);
  return NextResponse.json(data);
}
