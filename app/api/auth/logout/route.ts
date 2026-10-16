import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return NextResponse.json({ message: "Logout berhasil." });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Gagal logout." }, { status: 500 });
  }
}
