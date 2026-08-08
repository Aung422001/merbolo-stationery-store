import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, PackageX } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { getProductsApi, deleteProductApi } from '../../api/products';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProductsApi({ includeInactive: 'true', limit: 100 });
      setProducts(res.data?.products || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeletingId(product._id);
    try {
      await deleteProductApi(product._id);
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert(err.message || 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout title="Products">
      <div className="flex justify-end mb-6">
        <Link to="/admin/products/new">
          <Button variant="primary" size="md" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {loading ? (
        <Spinner size="lg" />
      ) : products.length === 0 ? (
        <EmptyState
          icon={PackageX}
          title="No products yet"
          description="Add your first product to start selling."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <th className="py-3 pr-4">Product</th>
                <th className="py-3 pr-4">Category</th>
                <th className="py-3 pr-4">Price</th>
                <th className="py-3 pr-4">Stock</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=100&q=80'}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-semibold text-slate-800 line-clamp-1">{product.name}</p>
                        {product.isFeatured && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Featured</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{product.category?.name || '—'}</td>
                  <td className="py-3 pr-4 font-semibold text-slate-800">{formatCurrency(product.price)}</td>
                  <td className="py-3 pr-4">
                    <span className={product.stock <= 5 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      {product.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/products/${product._id}`}
                        className="p-1.5 text-slate-500 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product._id}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};
