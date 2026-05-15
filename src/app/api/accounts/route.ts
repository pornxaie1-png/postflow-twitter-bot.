import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/accounts — list all connected accounts
export async function GET() {
  const accounts = await prisma.connectedAccount.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(accounts);
}

// DELETE /api/accounts?platform=twitter — disconnect an account
export async function DELETE(req: NextRequest) {
  const platform = req.nextUrl.searchParams.get("platform");
  if (!platform) {
    return NextResponse.json({ error: "platform is required" }, { status: 400 });
  }
  await prisma.connectedAccount.delete({ where: { platform } });
  return NextResponse.json({ success: true });
}
