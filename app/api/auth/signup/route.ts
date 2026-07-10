import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

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
    const { email, password, full_name, role = "pasien" } = await req.json();

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: "Email, password, dan full_name harus diisi" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Check if user exists
      const [existingUsers]: any = await connection.execute(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );

      if (existingUsers && existingUsers.length > 0) {
        return NextResponse.json(
          { error: "Email sudah terdaftar" },
          { status: 400 }
        );
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      const userId = uuidv4();

      // Insert user
      await connection.execute(
        "INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)",
        [userId, email, passwordHash, role]
      );

      // Insert profile
      await connection.execute(
        "INSERT INTO profiles (id, email, full_name, role) VALUES (?, ?, ?, ?)",
        [userId, email, full_name, role]
      );

      // Generate JWT
      const token = jwt.sign(
        { id: userId, email, role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      const response = NextResponse.json(
        {
          success: true,
          token,
          user: {
            id: userId,
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
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
