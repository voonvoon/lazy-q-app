//this is for split the auth.ts cuz middleware.ts cannot have server queries action else not work in edge functions

import GoogleProvider from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          //placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
    }),
  ],
} satisfies NextAuthConfig;
