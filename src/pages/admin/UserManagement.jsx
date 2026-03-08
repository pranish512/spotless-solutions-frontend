import AdminSidebar from "@/components/AdminSidebar";
import { Search } from "lucide-react";

// TODO: API INTEGRATION -> GET /api/admin/users?page=1&search= => { users: [{ id, name, email, role, createdAt }], totalPages }
const mockUsers = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "customer", createdAt: "2026-01-15" },
  { id: "2", name: "Admin User", email: "admin@spotless.com", role: "admin", createdAt: "2025-12-01" },
  { id: "3", name: "Jane Smith", email: "jane@example.com", role: "customer", createdAt: "2026-02-20" },
];

const UserManagement = () => {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-muted/30">
        <h2 className="font-display font-bold text-2xl text-foreground mb-8">User Management</h2>

        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input placeholder="Search users..." className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body" />
        </div>

        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Email</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Role</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Joined</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{u.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    {/* TODO: API INTEGRATION -> PATCH /api/admin/users/{id}/role { role } => { user } */}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-md ${
                      u.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{u.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default UserManagement;
