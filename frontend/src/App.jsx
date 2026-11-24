import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

import { useAuthStore } from './store/authStore';
import { useCartStore } from './store/cartStore';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/ui/ProtectedRoute';
import { Button } from './components/ui/Button';

import { Home } from './pages/Home';
const Shop = lazy(() => import('./pages/Shop').then(module => ({ default: module.Shop })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(module => ({ default: module.ProductDetail })));
const Cart = lazy(() => import('./pages/Cart').then(module => ({ default: module.Cart })));
const Checkout = lazy(() => import('./pages/Checkout').then(module => ({ default: module.Checkout })));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation').then(module => ({ default: module.OrderConfirmation })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Register = lazy(() => import('./pages/Register').then(module => ({ default: module.Register })));
const Account = lazy(() => import('./pages/Account').then(module => ({ default: module.Account })));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts').then(module => ({ default: module.AdminProducts })));
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm').then(module => ({ default: module.AdminProductForm })));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories').then(module => ({ default: module.AdminCategories })));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders').then(module => ({ default: module.AdminOrders })));

const PageLoading = () => (
  <div role="status" className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">Loading page…</div>
);

const StorefrontLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1"><Suspense fallback={<PageLoading />}>{children}</Suspense></main>
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
    <Suspense fallback={<PageLoading />}>
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
    </Suspense>
  );
}

export default App;
