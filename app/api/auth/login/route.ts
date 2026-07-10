import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password harus diisi" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      const [rows]: any = await connection.execute(
        "SELECT id, email, password_hash, role FROM users WHERE email = ?",
        [email]
      );

      if (!rows || rows.length === 0) {
        return NextResponse.json(
          { error: "Invalid login credentials" },
          { status: 401 }
        );
      }

      const user = rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Invalid login credentials" },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      const response = NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });

      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60,
      });

      return response;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
