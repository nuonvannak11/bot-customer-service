import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import HashData from "@/helper/hash_data";
import { get_env } from "@/utils/util";

const auth = NextAuth({
  providers: [
    Google({
      clientId: get_env("GOOGLE_CLIENT_ID"),
      clientSecret: get_env("GOOGLE_CLIENT_SECRET"),
    }),
  ],
  secret: get_env("AUTH_SECRET"),
  trustHost: true,
  callbacks: {
    async signIn({ account }) {
      const googleToken = account?.id_token;
      if (googleToken) {
        const hasher = new HashData();
        const encrypted = hasher.encryptData(googleToken);

        if (encrypted) {
          try {
            await fetch("http://localhost:3001/google_login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ googleToken: encrypted }),
            });
          } catch (error) {
            console.error("Failed to notify backend of Google login", error);
          }
        }
      }

      return true;
    },
    async jwt({ token, account }) {
      if (account?.id_token) {
        token.googleIdToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.googleIdToken) {
        session.googleIdToken = token.googleIdToken as string;
      }
      return session;
    },
  },
});

export const { handlers, auth: authMiddleware, signIn, signOut } = auth;
export const { GET, POST } = handlers;
