import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email } = await request.json();
  await dbConnect();

  const user = await User.findOne({ email });
  if (!user) {
    // Always return success for security
    return NextResponse.json({ message: "If your email exists, you will receive a reset link." });
  }

  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
  await user.save();

  // Send email with Resend
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from: "resetpw@pelicanwebdev.com",
    to: user.email,
    subject: "Password Reset Request",
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`,
  });

  return NextResponse.json({ message: "If your email exists, you will receive a reset link." });
}