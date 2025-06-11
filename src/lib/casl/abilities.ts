// lib/casl/abilities.ts
import {
  createMongoAbility,
  defineAbility,
  AbilityBuilder,
} from "@casl/ability";

export type Actions = "manage" | "create" | "read" | "update" | "delete";
export type Subjects =
  | "Merchant"
  | "Product"
  | "Order"
  | "User"
  | "Analytics"
  | "all";

export function defineAbilityFor(user: any) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (user?.role === "super_admin") {
    // Super admin can do everything
    can("manage", "all");
    //test
    //cannot("manage", "all");
  }

  if (user?.role === "admin") {
    // Admin can manage their own merchants
    can("read", "Merchant", { owner: user.id });
    can("update", "Merchant", { owner: user.id });
    can("delete", "Merchant", { owner: user.id });

    // Can manage products and orders for their merchants
    can("manage", "Product");
    can("manage", "Order");
    can("read", "Analytics", { merchantOwner: user.id });
  }

  if (user?.role === "customer") {
    // Customers can only read public products and manage their orders
    can("read", "Product", { isPublic: true });
    can("create", "Order");
    can("read", "Order", { customerId: user.id });

    // Cannot access any merchant management
    cannot("manage", "Merchant");
  }

  return build();
}
