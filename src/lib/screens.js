// Centralized list of application screens/modules used for RBAC permission matrices.
// Used by Staff Management and User Management access control sections.
export const APP_SCREENS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "products", label: "Products" },
  { key: "categories", label: "Categories" },
  { key: "tags", label: "Tags" },
  { key: "users", label: "Users" },
  { key: "user_types", label: "User Types" },
  { key: "staff", label: "Staff" },
  { key: "orders", label: "Orders" },
  { key: "reports", label: "Reports" },
  { key: "settings", label: "Settings" },
];

// Default empty permission shape for a single screen.
export const emptyPermission = () => ({ read: false, write: false, delete: false });

// Build a default permissions map { [screenKey]: { read, write, delete } }.
export const buildDefaultPermissions = () =>
  APP_SCREENS.reduce((acc, s) => {
    acc[s.key] = emptyPermission();
    return acc;
  }, {});
