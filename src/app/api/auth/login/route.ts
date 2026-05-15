// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  
  const correctPassword = process.env.APP_PASSWORD || "luna2026";
  
  if (password === correctPassword) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("auth_session", "authenticated", {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    return response;
  }
  
  return NextResponse.json({ error: "Onjuist wachtwoord" }, { status: 401 });
}
