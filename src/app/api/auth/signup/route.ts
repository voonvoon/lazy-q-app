// src/app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { checkPermission } from "@/lib/casl/permissions"; // Assuming you have a permissions utility

// Password strength checker
function isStrongPassword(password: string) {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password) && // special char
    /\d/.test(password) &&                    // number
    /[a-zA-Z]/.test(password)                 // letter
  );
}

export async function POST(request: Request) {
  try {
    const { email, password, name, role } = await request.json();
    const userRole = role || "customer";

    
    // ✅ If trying to create admin/merchant, check permissions
    if (userRole !== "customer") {
      try {
        await checkPermission("create", "User");
      } catch (error) {
        return NextResponse.json(
          { success: false, error: "Unauthorized to create admin users" },
          { status: 403 }
        );
      }
    }


    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

        // Password strength validation
    if (!isStrongPassword(password)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters, include at least one letter, one number, and one special character.",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "User already exists, please use Google login if you previously signed up with Google with same email",
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: userRole,
      emailVerified: null,
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
