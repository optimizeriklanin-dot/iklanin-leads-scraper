import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  
  if (username === "Rully" && password === "Rully8118$$") {
    const response = NextResponse.json({ success: true });
    // Beri cookie untuk masa aktif 7 hari
    response.cookies.set("iklanin_admin_auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  }
  
  return NextResponse.json({ error: "Password salah" }, { status: 401 });
}
