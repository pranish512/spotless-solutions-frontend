import AdminSidebar from "@/components/AdminSidebar";
import { Plus, Pencil, Trash2 } from "lucide-react";

// TODO: API INTEGRATION -> GET /api/admin/categories => { categories: [{ id, name, slug, productCount }] }
const mockCategories = [
  { id: "1", name: "Cleaning Liquids", slug: "liquids", productCount: 45 },
  { id: "2", name: "Gloves", slug: "gloves", productCount: 23 },
  { id: "3", name: "Masks & Safety", slug: "masks", productCount: 18 },
  { id: "4", name: "Car Cleaning", slug: "car-kits", productCount: 31 },
  { id: "5", name: "Cleaning Tools", slug: "tools", productCount: 56 },
  { id: "6", name: "Kitchen Care", slug: "kitchen", productCount: 29 },
];

const CategoryManagement = () => {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-muted/30">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-bold text-2xl text-foreground">Category Management</h2>
          {/* TODO: API INTEGRATION -> POST /api/admin/categories { name, slug } => { category } */}
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Slug</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Products</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockCategories.map((cat) => (
                <tr key={cat.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{cat.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{cat.slug}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{cat.productCount}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* TODO: API INTEGRATION -> PUT /api/admin/categories/{id} { name, slug } => { category } */}
                      <button className="p-2 rounded-md hover:bg-muted text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                      {/* TODO: API INTEGRATION -> DELETE /api/admin/categories/{id} => { success } */}
                      <button className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default CategoryManagement;
