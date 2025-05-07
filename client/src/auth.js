import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code",
            redirect_uri: process.env.NEXTAUTH_URL + "/api/auth/callback/google"
          }
        }
      })
    ],
  secret: process.env.AUTH_SECRET,
  trustHost: true, // Required for Netlify
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      }
    }
  },
  callbacks: {
    async redirect({ baseUrl }) {
        // Use the url parameter or remove it if not needed
        return baseUrl; // Always redirect to base URL after auth
    },
    async jwt({ token, account }) {
      if (account?.id_token) {
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.idToken = token.idToken;
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  }
});