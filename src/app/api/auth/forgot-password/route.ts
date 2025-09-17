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
    from: "reset@pelicanwebdev.com",
    to: user.email,
    subject: "Lazy Q Password Reset Instructions",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Password Reset Requested</h2>
        <p>Hello${user.name ? ` ${user.name}` : ""},</p>
        <p>
          We received a request to reset your password for your Lazy Q account. If you did not make this request, you can safely ignore this email.
        </p>
        <p>
          To reset your password, please click the button below. This link will expire in <strong>1 hour</strong> for your security.
        </p>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="background: #0070f3; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Reset Password
          </a>
        </p>
        <p>
          If the button above does not work, copy and paste the following URL into your browser:<br>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
        <hr>
        <p style="font-size: 12px; color: #888;">
          If you have any questions or need further assistance, please contact our support team.
        </p>
      </div>
    `,
  });

  return NextResponse.json({ message: "If your email exists, you will receive a reset link." });
}