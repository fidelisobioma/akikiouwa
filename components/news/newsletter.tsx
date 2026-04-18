"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

interface NewsletterProps {
  variant?: "homepage" | "article";
}

export function Newsletter({ variant = "homepage" }: NewsletterProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setIsSuccess(true);
      setEmail("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  // success state
  if (isSuccess) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-3 text-center
          ${variant === "homepage" ? "py-16 px-4" : "py-10 px-4"}`}
      >
        <CheckCircle2 className="w-10 h-10 text-green-500" />
        <h3 className="font-medium text-lg">You are subscribed</h3>
        <p className="max-w-sm text-muted-foreground text-sm">
          Thank you for subscribing. Check your inbox for a welcome email from
          Akikouwa.
        </p>
      </div>
    );
  }

  // homepage variant — full width section
  if (variant === "homepage") {
    return (
      <section className="bg-muted/40 border-y">
        <div className="mx-auto px-4 py-16 max-w-7xl">
          <div className="mx-auto max-w-xl text-center">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="flex justify-center items-center bg-primary/10 rounded-full w-12 h-12">
                <Mail className="w-5 h-5 text-primary" />
              </div>
            </div>

            {/* Heading */}
            <h2 className="mb-2 font-semibold text-2xl">Stay informed</h2>
            <p className="mb-8 text-muted-foreground">
              Get the latest news delivered to your inbox every morning. No
              spam, unsubscribe at any time.
            </p>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex sm:flex-row flex-col gap-3"
            >
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading} className="shrink-0">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </Button>
            </form>

            {/* Error */}
            {error && <p className="mt-3 text-destructive text-sm">{error}</p>}

            {/* Privacy note */}
            <p className="mt-4 text-muted-foreground text-xs">
              By subscribing you agree to receive news updates from Akikouwa. We
              respect your privacy.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // article variant — compact inline section
  return (
    <section className="mx-auto mt-10 px-4 max-w-2xl">
      <div className="bg-muted/40 p-6 sm:p-8 border rounded-xl">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex justify-center items-center bg-primary/10 mt-1 rounded-full w-10 h-10 shrink-0">
            <Mail className="w-4 h-4 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Heading */}
            <h3 className="mb-1 font-medium text-base">
              Enjoyed this article?
            </h3>
            <p className="mb-4 text-muted-foreground text-sm">
              Subscribe to our newsletter and get the latest news delivered to
              your inbox every morning.
            </p>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex sm:flex-row flex-col gap-3"
            >
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="sm"
                disabled={isLoading}
                className="shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </Button>
            </form>

            {/* Error */}
            {error && <p className="mt-2 text-destructive text-xs">{error}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
