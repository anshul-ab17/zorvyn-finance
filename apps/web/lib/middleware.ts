import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken, hasMinRole } from "@repo/auth";
import type { Role } from "@repo/auth";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  name: string;
};

export const getAuthUser = (req: NextRequest): AuthUser | null => {
  const auth = req.headers.get("Authorization");
  return getUserFromToken(auth) as AuthUser | null;
};

export const requireAuth = (
  req: NextRequest,
  minRole: Role = "Viewer"
): { user: AuthUser } | NextResponse => {
  const user = getAuthUser(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasMinRole(user.role, minRole))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return { user };
};
