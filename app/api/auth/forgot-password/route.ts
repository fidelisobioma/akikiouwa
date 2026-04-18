import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = ForgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    const { email } = parsed.data;

    // check if user exists
    const user = await prisma.user.findUnique({ where: { email } });

    // always return success even if user not found
    // this prevents email enumeration attacks
    if (!user) {
      return NextResponse.json(
        { message: "If an account exists, a reset link has been sent" },
        { status: 200 },
      );
    }

    // check if user signed up with Google
    // Google users don't have a password to reset
    if (!user.password) {
      return NextResponse.json(
        {
          error:
            "This account uses Google sign in. Please sign in with Google.",
        },
        { status: 400 },
      );
    }

    // delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    // generate a secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // save token to database
    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/reset-password?token=${token}`;

    // send reset email
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
      to: email,
      subject: "Reset your Akikouwa password",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 16px;">
            Reset your password
          </h1>
          <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 24px;">
            We received a request to reset your Akikouwa password.
            Click the button below to choose a new password.
            This link expires in 1 hour.
          </p>
          
           <a href="${resetUrl}"
            style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;"
          >
            Reset password
          </a>
          <p style="font-size: 14px; color: #555; margin-top: 24px;">
            If you did not request a password reset you can safely
            ignore this email. Your password will not be changed.
          </p>
          <p style="font-size: 12px; color: #999; margin-top: 40px;">
            This link expires in 1 hour.
          </p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "If an account exists, a reset link has been sent" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
