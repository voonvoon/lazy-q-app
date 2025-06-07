//this handle all Auth.js routes:
///api/auth/signin - Sign in page
//api/auth/signout - Sign out
//api/auth/callback/google - Google OAuth callback
//api/auth/session - Get current session

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
