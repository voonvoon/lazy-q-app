import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import authConfig from "./auth.config"; // this file is to split the server side quries from the auth.ts file so it work in edge functions.
import NextAuth from "next-auth";

const { auth } = NextAuth(authConfig);

const protectedRoutes = ["/test-middleware", "/dashboard/admin", "/dashboard/super-admin"];

export default async function middleware(req: NextRequest) {
  const session = await auth();

  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (!session && isProtected) {
    const absoluteURL = new URL("/", req.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }

  return NextResponse.next();
}

//prevents middleware from running on files that don't need authentication
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
  }
