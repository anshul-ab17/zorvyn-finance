import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/middleware";
import { getRecordById, updateRecord, deleteRecord } from "@repo/api";
import { RecordUpdateSchema } from "@repo/validation";
import { invalidatePattern } from "@repo/cache";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const record = await getRecordById(id, auth.user.id, auth.user.role);
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ record });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req, "User");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const body = await req.json();
  const parsed = RecordUpdateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const record = await updateRecord(id, auth.user.id, auth.user.role, parsed.data);
  if (!record) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
  await invalidatePattern(`records:${auth.user.id}:*`);
  await invalidatePattern(`dashboard:${auth.user.id}:*`);
  return NextResponse.json({ record });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req, "User");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const record = await deleteRecord(id, auth.user.id, auth.user.role);
  if (!record) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
  await invalidatePattern(`records:${auth.user.id}:*`);
  await invalidatePattern(`dashboard:${auth.user.id}:*`);
  return NextResponse.json({ message: "Record deleted" });
}