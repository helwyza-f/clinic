import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password, full_name, role = "pasien" } = await req.json();

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: "Email, password, dan full_name harus diisi" },
        { status: 400 }
      );
    }

    // For testing - allow all signups
    // In production, this would write to MySQL and validate

    const token = Buffer.from(`${email}:${role}`).toString("base64");

    const response = NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: email,
          email,
          full_name,
          role,
        },
      },
      { status: 201 }
    );

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
