// Centralized branch master.
// Source of truth for branch dropdowns in Staff/User forms.
// TODO: API INTEGRATION -> GET /api/admin/branches => [{ id, name, description, status }]
export const DEFAULT_BRANCHES = [
  { id: "b1", name: "Bengaluru", description: "Karnataka HQ", status: "Active" },
  { id: "b2", name: "Mumbai", description: "Maharashtra regional office", status: "Active" },
  { id: "b3", name: "Delhi", description: "North India hub", status: "Active" },
  { id: "b4", name: "Chennai", description: "South India hub", status: "Active" },
];

const STORAGE_KEY = "spotless.branches";

export const loadBranches = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return DEFAULT_BRANCHES;
};

export const saveBranches = (branches) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(branches)); } catch (_) {}
};

export const getActiveBranchNames = () =>
  loadBranches().filter((b) => b.status === "Active").map((b) => b.name);
