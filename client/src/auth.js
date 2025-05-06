import NextAuth from "next-auth";
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
        authorization: {
            params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code"
            }
        }
    })],
    secret: process.env.AUTH_SECRET,
    callbacks: {
        async jwt({token, account}) {
            if(account?.id_token) {
                token.idToken = account.id_token;
            }
            return token;
        },
        async session({session, token}) {
            session.idToken = token.idToken;
            return session;
        },
    },
    pages: {
        error: '/login', // Redirect to login on error
    }
});