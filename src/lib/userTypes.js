// Centralized user type catalogue.
// `kind: "customer"` distinguishes shoppers from internal/back-office users (staff).
// Used by Staff Management (non-customer only) and User Management (all).
// TODO: API INTEGRATION -> GET /api/admin/user-types => [{ id, name, kind }]
export const USER_TYPES = [
  { name: "Customer", kind: "customer" },
  { name: "Admin", kind: "staff" },
  { name: "Store Manager", kind: "staff" },
  { name: "Inventory Clerk", kind: "staff" },
  { name: "Support Agent", kind: "staff" },
  { name: "Cashier", kind: "staff" },
];

export const STAFF_USER_TYPES = USER_TYPES.filter((t) => t.kind === "staff");
export const ALL_USER_TYPE_NAMES = USER_TYPES.map((t) => t.name);
export const STAFF_USER_TYPE_NAMES = STAFF_USER_TYPES.map((t) => t.name);

export const isCustomerType = (name) =>
  USER_TYPES.find((t) => t.name === name)?.kind === "customer";

// Branch options now come from the Branch master (Masters → Branch).
// Kept as a static fallback; UI should prefer `getActiveBranchNames()` from "@/lib/branches".
export { getActiveBranchNames as getBranchOptions } from "./branches";
import { DEFAULT_BRANCHES } from "./branches";
export const BRANCH_OPTIONS = DEFAULT_BRANCHES.map((b) => b.name);
