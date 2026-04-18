import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const SubscribeSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = SubscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    const { email } = parsed.data;

    // check if already subscribed
    const existing = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This email is already subscribed" },
        { status: 409 },
      );
    }

    // save to database
    await prisma.subscriber.create({
      data: { email },
    });

    // send welcome email
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
      to: email,
      subject: "Welcome to Akikouwa Newsletter",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 16px;">
            Welcome to Akikouwa
          </h1>
          <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 24px;">
            Thank you for subscribing to the Akikouwa newsletter. You will now
            receive the latest news and updates directly in your inbox.
          </p>
          <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 24px;">
            Your World, Your News.
          </p>
          
            href="${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}"
            style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;"
          >
            Read latest news
          </a>
          <p style="font-size: 12px; color: #999; margin-top: 40px;">
            You are receiving this email because you subscribed at akikouwa.com.
          </p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "Successfully subscribed" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
