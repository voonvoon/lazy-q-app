import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/auth";

function isStrongPassword(password: string) {
  //.test() method is JVS RegExp obj.checks if string matches the pattern.
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password) &&
    /\d/.test(password) &&
    /[a-zA-Z]/.test(password)
  );
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!isStrongPassword(newPassword)) {
      return NextResponse.json(
        {
          error:
            "New password must be at least 8 characters, include at least one letter, one number, and one special character.",
        },
        { status: 400 }
      );
    }

    await dbConnect();
    const user = await User.findById(session.user.id).select("+password"); //explicitly include password field cuz protected in schema

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    user.password = hashed;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
