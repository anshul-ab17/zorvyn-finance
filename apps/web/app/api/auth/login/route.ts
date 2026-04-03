import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db";
import { comparePassword, generateToken } from "@repo/auth";
import { LoginSchema } from "@repo/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const valid = await comparePassword(password, user.password);
    if (!valid)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
