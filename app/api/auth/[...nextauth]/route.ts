export const dynamic = "force-dynamic";
import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" }, // Required for CredentialsProvider alongside DB
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        if (
          credentials.email === process.env.ADMIN_EMAIL &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return { id: "ADMIN_ID_X", name: "Super Admin", email: credentials.email, role: "ADMIN" };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Super Admin bypass
      if (account?.provider === "credentials" && (user as any).role === "ADMIN") {
        return true;
      }

      // Google Whitelist Check
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) return false;

        // Admin bypass
        if (email === process.env.ADMIN_EMAIL) {
          return true;
        }

        const isWhitelisted = await prisma.whitelistedEmail.findUnique({
          where: { email }
        });

        if (!isWhitelisted) {
          // Returning false will automatically redirect to the error page
          return false;
        }
        return true;
      }

      return false; // Reject any other undefined providers
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;

        // Automatically grant ADMIN role to the ADMIN_EMAIL
        if (user.email === process.env.ADMIN_EMAIL) {
          token.role = "ADMIN";
        } else {
          token.role = (user as any).role || "USER"; // Track role in JWT
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: '/login',
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
