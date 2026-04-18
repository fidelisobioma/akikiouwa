import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function VerifyPage() {
  return (
    <main className="flex flex-col justify-center items-center p-4 min-h-screen">
      <Card className="w-full sm:max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="flex justify-center items-center bg-primary/10 mx-auto rounded-full w-12 h-12">
              <Mail className="w-5 h-5 text-primary" />
            </div>
          </div>
          <CardTitle>Check your email</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            We sent you a sign in link. Click the link in your email to sign in
            to your Akikouwa account. The link expires in 24 hours.
          </p>
          <p className="text-muted-foreground text-sm">
            Did not receive the email? Check your spam folder or try again.
          </p>
          <Button asChild variant="outline">
            <Link href="/auth/signin">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
