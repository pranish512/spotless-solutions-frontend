import { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

// TODO: API INTEGRATION -> GET /api/admin/products?page=1&search= => { products[], totalPages }
const mockProducts = [
  { id: "1", name: "Premium Multi-Surface Cleaner 500ml", category: "Cleaning Liquids", price: 249, stock: 150, status: "Active" },
  { id: "2", name: "Heavy Duty Rubber Gloves", category: "Gloves", price: 149, stock: 300, status: "Active" },
  { id: "3", name: "N95 Protective Mask – Pack of 10", category: "Masks & Safety", price: 399, stock: 0, status: "Out of Stock" },
  { id: "4", name: "Complete Car Cleaning Kit", category: "Car Cleaning", price: 899, stock: 45, status: "Active" },
  { id: "5", name: "Microfiber Mop with Handle", category: "Cleaning Tools", price: 599, stock: 80, status: "Active" },
];

const ProductManagement = () => {
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = mockProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-muted/30">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-bold text-2xl text-foreground">Product Management</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body"
          />
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Product</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Category</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Price</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Stock</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{product.category}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">₹{product.price}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{product.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-md ${
                        product.status === "Active"
                          ? "bg-accent text-accent-foreground"
                          : "bg-destructive/10 text-destructive"
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* TODO: API INTEGRATION -> PUT /api/admin/products/{id} { ...productData } => { updatedProduct } */}
                        <button className="p-2 rounded-md hover:bg-muted text-primary transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        {/* TODO: API INTEGRATION -> DELETE /api/admin/products/{id} => { success } */}
                        <button className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="bg-card rounded-xl shadow-modal w-full max-w-lg mx-4 p-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-display font-bold text-xl text-foreground mb-6">Add New Product</h3>
              {/* TODO: API INTEGRATION -> POST /api/admin/products { name, category, price, stock, description, images } => { product } */}
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Product Name *</label>
                  <input className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body" placeholder="Enter product name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Category *</label>
                    <select className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body">
                      <option>Cleaning Liquids</option>
                      <option>Gloves</option>
                      <option>Masks & Safety</option>
                      <option>Car Cleaning</option>
                      <option>Cleaning Tools</option>
                      <option>Kitchen Care</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Price (₹) *</label>
                    <input type="number" className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body" placeholder="0" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Stock Quantity *</label>
                  <input type="number" className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                  <textarea rows={3} className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body resize-none" placeholder="Product description..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 h-11 rounded-lg border border-border text-foreground font-display font-bold text-sm hover:bg-muted transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity">
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductManagement;
