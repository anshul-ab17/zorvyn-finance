import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../lib/middleware";
import { getAllUsers } from "@repo/api";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, "Admin");
  if (auth instanceof NextResponse) return auth;
  const users = await getAllUsers();
  return NextResponse.json({ users });
}
