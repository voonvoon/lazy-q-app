import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

function isStrongPassword(password: string) {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password) &&
    /\d/.test(password) &&
    /[a-zA-Z]/.test(password)
  );
}

export async function POST(request: Request) {
  const { token, password } = await request.json();
  await dbConnect();

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }, //not expired
  }).select("+password");

  if (!user) {
    return NextResponse.json({ message: "Invalid or expired token." }, { status: 400 });
  }

  if (!isStrongPassword(password)) {
    return NextResponse.json({
      message: "Password must be at least 8 characters, include a letter, a number, and a special character.",
    }, { status: 400 });
  }

  user.password = await bcrypt.hash(password, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return NextResponse.json({ message: "Password reset successful! You can now log in." });
}