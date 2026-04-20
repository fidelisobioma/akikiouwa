"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be under 50 characters" }),
});

const ChangePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type UpdateProfileValues = z.infer<typeof UpdateProfileSchema>;
type ChangePasswordValues = z.infer<typeof ChangePasswordSchema>;

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  // protect page
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // check if user signed up with Google
  useEffect(() => {
    if (session?.user) {
      async function checkGoogleUser() {
        try {
          const res = await fetch("/api/profile/is-google-user");
          const data = await res.json();
          setIsGoogleUser(data.isGoogleUser);
        } catch {
          setIsGoogleUser(false);
        }
      }
      checkGoogleUser();
    }
  }, [session]);

  const profileForm = useForm<UpdateProfileValues>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
    },
  });

  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // update form when session loads
  useEffect(() => {
    if (session?.user?.name) {
      profileForm.reset({ name: session.user.name });
    }
  }, [session]);

  async function onProfileSubmit(data: UpdateProfileValues) {
    setIsProfileLoading(true);
    setProfileError("");
    setProfileSuccess(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      // update session with new name
      await update({ name: data.name });
      toast.success("Profile updated successfully");
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsProfileLoading(false);
    }
  }

  async function onPasswordSubmit(data: ChangePasswordValues) {
    setIsPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess(false);
    try {
      const res = await fetch("/api/profile/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setPasswordSuccess(true);
      passwordForm.reset();
      toast.success("Password changed successfully");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsPasswordLoading(false);
    }
  }

  function getInitials(name: string | null | undefined) {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <main className="mx-auto px-4 py-10 pb-16 max-w-2xl">
      <h1 className="mb-8 font-medium text-2xl">Settings</h1>

      {/* Profile section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
          <CardDescription>
            Update your display name and profile information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarImage src={session?.user?.image ?? ""} />
              <AvatarFallback className="text-lg">
                {getInitials(session?.user?.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{session?.user?.name}</p>
              <p className="text-muted-foreground text-sm">
                {session?.user?.email}
              </p>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Profile form */}
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
            <FieldGroup>
              <Controller
                name="name"
                control={profileForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Display name</FieldLabel>
                    <Input
                      {...field}
                      id="name"
                      placeholder="Your name"
                      autoComplete="name"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            {profileError && (
              <p className="mt-3 text-destructive text-sm">{profileError}</p>
            )}

            {profileSuccess && (
              <div className="flex items-center gap-2 mt-3 text-green-500 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile updated successfully</span>
              </div>
            )}

            <Button type="submit" disabled={isProfileLoading} className="mt-4">
              {isProfileLoading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change password section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Change password</CardTitle>
          <CardDescription>
            {isGoogleUser
              ? "You signed in with Google. Password change is not available for Google accounts."
              : "Update your password to keep your account secure."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isGoogleUser ? (
            <p className="text-muted-foreground text-sm">
              Your account is managed by Google. To change your password visit
              your Google account settings.
            </p>
          ) : (
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
              <FieldGroup>
                <Controller
                  name="currentPassword"
                  control={passwordForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="currentPassword">
                        Current password
                      </FieldLabel>
                      <Input
                        {...field}
                        id="currentPassword"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="newPassword"
                  control={passwordForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="newPassword">
                        New password
                      </FieldLabel>
                      <Input
                        {...field}
                        id="newPassword"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="confirmPassword"
                  control={passwordForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="confirmPassword">
                        Confirm new password
                      </FieldLabel>
                      <Input
                        {...field}
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>

              {passwordError && (
                <p className="mt-3 text-destructive text-sm">{passwordError}</p>
              )}

              {passwordSuccess && (
                <div className="flex items-center gap-2 mt-3 text-green-500 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Password changed successfully</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isPasswordLoading}
                className="mt-4"
              >
                {isPasswordLoading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update password"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
