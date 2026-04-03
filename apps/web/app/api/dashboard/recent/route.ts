import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/middleware";
import { getRecent } from "@repo/api";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);
  const data = await getRecent(auth.user.id, auth.user.role, limit);
  return NextResponse.json(data);
}
