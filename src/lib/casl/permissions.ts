// lib/casl/permissions.ts
import { auth } from "@/auth";
import { defineAbilityFor } from "./abilities";

export async function checkPermission(action: string, subject: string, resource?: any) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("Unauthorized - Please login first");
  }

  const ability = defineAbilityFor(session.user);
  
  if (ability.cannot(action, subject, resource)) {
    throw new Error(`You don't have permission to ${action} ${subject}`);
  }

  return ability;
}

export async function getUserAbility() {
  const session = await auth();
  
  if (!session?.user) {
    return null;
  }

  return defineAbilityFor(session.user);
}