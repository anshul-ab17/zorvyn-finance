import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/middleware";
import { getSummary, getCategoryWise, getTrends, getInsights } from "@repo/api";
import { cacheGet, cacheSet } from "@repo/cache";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, "User");
  if (auth instanceof NextResponse) return auth;

  const range = req.nextUrl.searchParams.get("range") || undefined;
  const type = req.nextUrl.searchParams.get("type") || undefined;

  const key = `dashboard:${auth.user.id}:insights:${range || 'all'}:${type || 'all'}`;
  const cached = await cacheGet(key);
  if (cached) return NextResponse.json(cached);

  const [summary, categories, trends] = await Promise.all([
    getSummary(auth.user.id, auth.user.role, { range, type }),
    getCategoryWise(auth.user.id, auth.user.role, { range, type }),
    getTrends(auth.user.id, auth.user.role, { range, type }),
  ]);

  const insights = getInsights({
    income: summary.income,
    expenses: summary.expenses,
    totalRecords: summary.totalRecords,
    categories,
    trends,
  });

  const result = { insights };
  await cacheSet(key, result, 300);
  return NextResponse.json(result);
}
