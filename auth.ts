import type { JWT as AuthCoreJWT } from "@auth/core/jwt";
import bcrypt from "bcryptjs";
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { LoginSchema } from "./lib/schema";
import prisma from "./lib/prisma"; // ✅ named import

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
  interface User {
    role: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT extends AuthCoreJWT {
    id: string;
    name: string;
    email: string;
    role: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      checks: ["state"], // ✅ fixes clock skew issue
    }),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsedCredentials = LoginSchema.safeParse(credentials);
        if (!parsedCredentials.success) {
          console.log("Invalid credentials format");
          return null;
        }
        const { email, password } = parsedCredentials.data;
        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.password) {
            console.log("No user found or user has no password");
            return null;
          }
          const passwordsMatch = await comparePassWord(password, user.password);
          if (!passwordsMatch) {
            console.log("Password does not match");
            return null;
          }
          return {
            id: user.id,
            name: user.name ?? "",
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.log("Error finding user", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });
          if (!existingUser) {
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name ?? "",
                password: Math.random().toString(36).slice(-8),
                role: "user",
              },
            });
            user.id = newUser.id;
            (user as { id: string; role: string }).role = newUser.role;
          } else {
            user.id = existingUser.id;
            (user as { id: string; role: string }).role = existingUser.role;
          }
        } catch (error) {
          console.error("❌ Google signIn error:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role?: string }).role ?? "user";
      }
      if (account?.provider === "google" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },

    session({ session, token }) {
      if (typeof token.id === "string") {
        session.user.id = token.id;
      }
      if (typeof token.role === "string") {
        session.user.role = token.role;
      }
      return session;
    },
  },
});

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassWord(
  password: string,
  hashedPassword: string,
) {
  return await bcrypt.compare(password, hashedPassword);
}
