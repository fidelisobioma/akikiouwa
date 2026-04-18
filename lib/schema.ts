import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." }),
});

export type LoginSchemaType = z.infer<typeof LoginSchema>;

export const RegisterSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters long." }),

    email: z.string().email({ message: "Please enter a valid email address." }),

    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." }),

    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterSchemaType = z.infer<typeof RegisterSchema>;

export const PostSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  slug: z
    .string()
    .min(3, { message: "Slug must be at least 3 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers and hyphens",
    }),
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters" }),
  published: z.boolean(),
  categoryId: z.string().optional().nullable(),
});

export type PostSchemaType = z.infer<typeof PostSchema>;
