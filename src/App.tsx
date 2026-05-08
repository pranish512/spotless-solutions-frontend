import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/store/CartContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Public pages
import Home from "@/pages/public/Home";
import Shop from "@/pages/public/Shop";
import Login from "@/pages/public/Login";
import Register from "@/pages/public/Register";
import Cart from "@/pages/public/Cart";
import Checkout from "@/pages/public/Checkout";
import PaymentSuccess from "@/pages/public/PaymentSuccess";

// User pages (authenticated)
import Profile from "@/pages/user/Profile";
import OrderTracking from "@/pages/user/OrderTracking";
import OrderHistory from "@/pages/user/OrderHistory";
import Wishlist from "@/pages/user/Wishlist";

// Admin pages (admin only)
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProfile from "@/pages/admin/AdminProfile";
import ProductManagement from "@/pages/admin/ProductManagement";
import CategoryManagement from "@/pages/admin/CategoryManagement";
import UserManagement from "@/pages/admin/UserManagement";
import StaffManagement from "@/pages/admin/StaffManagement";
import TagsManagement from "@/pages/admin/TagsManagement";
import UserTypeManagement from "@/pages/admin/UserTypeManagement";
import OrderManagement from "@/pages/admin/OrderManagement";
import BranchManagement from "@/pages/admin/BranchManagement";

const App = () => (
  <AuthProvider>
    <CartProvider>
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />

        {/* Authenticated User Routes */}
        <Route path="/user/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/user/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
        <Route path="/user/track-order" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
        <Route path="/user/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

        {/* Admin Routes (requireAdmin) */}
        <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/profile" element={<ProtectedRoute requireAdmin><AdminProfile /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><OrderManagement /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute requireAdmin><ProductManagement /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute requireAdmin><CategoryManagement /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requireAdmin><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/staff" element={<ProtectedRoute requireAdmin><StaffManagement /></ProtectedRoute>} />
        <Route path="/admin/tags" element={<ProtectedRoute requireAdmin><TagsManagement /></ProtectedRoute>} />
        <Route path="/admin/user-types" element={<ProtectedRoute requireAdmin><UserTypeManagement /></ProtectedRoute>} />
        <Route path="/admin/branches" element={<ProtectedRoute requireAdmin><BranchManagement /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
    </CartProvider>
  </AuthProvider>
);

export default App;
