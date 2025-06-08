// src/auth.ts
import NextAuth from "next-auth";
//import { MongoDBAdapter } from "@auth/mongodb-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const client = new MongoClient(process.env.MONGODB_URI!);

export const { handlers, auth, signIn, signOut } = NextAuth({
  //adapter: MongoDBAdapter(client),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await dbConnect();
        const user = await User.findOne({ email: credentials.email }).select(
          "+password"
        );

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (isValid) {
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  //not needed as i have a custom sign in page
  // pages: {
  //   signIn: '/auth/signin',
  // },

  //Callbacks:func run at specific times during authentication to customize data.
  //So your React components can access session.user.role
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; //Takes the user's role and puts it inside the token
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        //sub = 'subject'(standard JWT)
        //it contains the user's ID
        //NextAuth automatically adds the user's ID to the token
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
    //Link user accounts
    //User signs in → Provider authenticates
    //NextAuth receives data → Creates user, account, profile objects
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });

        if (existingUser) {
          // Link to existing user
          // Override Google data with MongoDB data for consistency
          user.id = existingUser._id.toString();
          user.role = existingUser.role;

          // If user was manually created but not verified, verify them now
          if (!existingUser.emailVerified) {
            await User.findByIdAndUpdate(existingUser._id, {
              emailVerified: new Date(),
              image: user.image, // Also add Google profile image
            });
          }
          return true; //true allows sign-in to proceed
        } else {
          // Create new user for Google sign-in
          try {
            const newUser = await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
              role: "customer",
              emailVerified: new Date(),
              // Don't set password for Google users
            });
            // Set user ID and role for session
            user.id = newUser._id.toString();
            user.role = newUser.role;
            return true;
          } catch (error) {
            console.error("Error creating Google user:", error);
            return false;
          }
        }
      }
      return true;
    },
  },
});
