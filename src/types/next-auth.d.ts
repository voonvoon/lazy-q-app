//.d.ts = TypeScript Declaration file
// types/next-auth.d.ts

//DefaultUser = Auth.js's original user type
//DefaultSession = Auth.js's original session type
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

//declare is like You're saying: "Hey TS, I want to ADD to 'next-auth' package types"
declare module "next-auth" {
  // Modify the Session interface from next-auth
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
  // Modify the User interface from next-auth
  interface User extends DefaultUser {
    role: string;// ← Adding this
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: string;// ← Adding this
  }
}
