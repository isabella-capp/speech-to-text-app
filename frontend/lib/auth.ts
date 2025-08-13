import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [GitHub, Google, Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = "admin@admin.com"
        const password = "admin123"

        if (credentials?.email === email && credentials?.password === password) {
          return { email, password }
        }

        throw new Error("Invalid credentials.")
      },
    }),
  ]
});