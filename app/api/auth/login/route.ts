import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password harus diisi" },
        { status: 400 }
      );
    }

    // Test credentials (hardcoded for now - will be replaced with DB)
    const testUsers: Record<string, { password: string; role: string; name: string }> = {
      "admin@gmail.com": { password: "admin", role: "admin", name: "Admin User" },
      "dokter1@gmail.com": { password: "dokter1", role: "dokter", name: "Dokter 1" },
      "dokter2@gmail.com": { password: "dokter2", role: "dokter", name: "Dokter 2" },
      "dokter3@gmail.com": { password: "dokter3", role: "dokter", name: "Dokter 3" },
      "pasien1@gmail.com": { password: "pasien1", role: "pasien", name: "Pasien 1" },
      "pasien2@gmail.com": { password: "pasien2", role: "pasien", name: "Pasien 2" },
      "pasien3@gmail.com": { password: "pasien3", role: "pasien", name: "Pasien 3" },
    };

    const user = testUsers[email];

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Invalid login credentials" },
        { status: 401 }
      );
    }

    // Create session token (simple base64 for now)
    const token = Buffer.from(`${email}:${user.role}`).toString("base64");

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: email,
        email,
        role: user.role,
        name: user.name,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
