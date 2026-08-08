import React, { useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

import { useAuthStore } from './store/authStore';
import { useCartStore } from './store/cartStore';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/ui/ProtectedRoute';
import { Button } from './components/ui/Button';

import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Account } from './pages/Account';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminProductForm } from './pages/admin/AdminProductForm';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminOrders } from './pages/admin/AdminOrders';

const StorefrontLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

const NotFound = () => (
  <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
    <div className="w-16 h-16 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center mx-auto">
      <Compass className="w-8 h-8" />
    </div>
    <h1 className="text-2xl font-bold text-slate-900 font-serif">Page Not Found</h1>
    <p className="text-sm text-slate-500">The page you're looking for doesn't exist.</p>
    <Link to="/">
      <Button variant="primary" className="mt-2">Back Home</Button>
    </Link>
  </div>
);

function App() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      fetchCart();
    }
  }, [isHydrated, isAuthenticated, fetchCart]);

  return (
    <Routes>
      <Route path="/" element={<StorefrontLayout><Home /></StorefrontLayout>} />
      <Route path="/shop" element={<StorefrontLayout><Shop /></StorefrontLayout>} />
      <Route path="/product/:slug" element={<StorefrontLayout><ProductDetail /></StorefrontLayout>} />
      <Route path="/cart" element={<StorefrontLayout><Cart /></StorefrontLayout>} />
      <Route
        path="/checkout"
        element={
          <StorefrontLayout>
            <ProtectedRoute><Checkout /></ProtectedRoute>
          </StorefrontLayout>
        }
      />
      <Route
        path="/order-confirmation/:orderId"
        element={
          <StorefrontLayout>
            <ProtectedRoute><OrderConfirmation /></ProtectedRoute>
          </StorefrontLayout>
        }
      />
      <Route path="/login" element={<StorefrontLayout><Login /></StorefrontLayout>} />
      <Route path="/register" element={<StorefrontLayout><Register /></StorefrontLayout>} />
      <Route
        path="/account"
        element={
          <StorefrontLayout>
            <ProtectedRoute><Account /></ProtectedRoute>
          </StorefrontLayout>
        }
      />

      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/products" element={<ProtectedRoute requireAdmin><AdminProducts /></ProtectedRoute>} />
      <Route path="/admin/products/new" element={<ProtectedRoute requireAdmin><AdminProductForm /></ProtectedRoute>} />
      <Route path="/admin/products/:id" element={<ProtectedRoute requireAdmin><AdminProductForm /></ProtectedRoute>} />
      <Route path="/admin/categories" element={<ProtectedRoute requireAdmin><AdminCategories /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><AdminOrders /></ProtectedRoute>} />

      <Route path="*" element={<StorefrontLayout><NotFound /></StorefrontLayout>} />
    </Routes>
  );
}

export default App;
