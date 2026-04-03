import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/middleware";
import { getUserById, updateUser, deleteUser } from "@repo/api";
import { UserUpdateSchema } from "@repo/validation";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req, "Admin");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req, "User"); // At least logged in
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  
  if (auth.user.id !== id && auth.user.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = UserUpdateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = { ...parsed.data };
  if (auth.user.role !== "Admin" && data.role) {
    delete data.role; // Prevent non-admins from upgrading their role
  }

  const user = await updateUser(id, data);
  return NextResponse.json({ user });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req, "Admin");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  if (id === auth.user.id)
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  await deleteUser(id);
  return NextResponse.json({ message: "User deleted" });
}