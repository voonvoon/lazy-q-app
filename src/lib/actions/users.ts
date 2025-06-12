// lib/actions/users.ts
"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import { checkPermission } from "@/lib/casl/permissions";

export async function getAdminUsers() {
  ``;
  try {
    // Only super admin can see all users
    await checkPermission("manage", "all");

    const session = await auth();
    if (session?.user?.role !== "super_admin") {
      throw new Error("Only super admin can access user list");
    }

    await dbConnect();

    const User = (await import("@/models/User")).default;
    const adminUsers = await User.find({ role: "admin" })
      .select("_id name email")
      .sort({ createdAt: -1 }) // ← Sort by newest first (descending)
      .limit(10) // ← Only get latest 10
      .lean();

    // Convert ObjectIds to strings for client serialization
    const serializedUsers = adminUsers.map((user) => ({
      _id: (user._id as any).toString(), // ← Convert ObjectId to string /// ← Type assertion: tell TS it's convertible/
      name: user.name,
      email: user.email,
    }));

    return { users: serializedUsers };
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to fetch users",
      users: [],
    };
  }
}
