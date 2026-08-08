import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { getCategoriesApi } from '../../api/categories';
import { getProductBySlugApi, createProductApi, updateProductApi } from '../../api/products';

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  price: '',
  compareAtPrice: '',
  category: '',
  images: '',
  stock: '0',
  sku: '',
  isFeatured: false,
  isActive: true
};

export const AdminProductForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategoriesApi();
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    const fetchProduct = async () => {
      try {
        const res = await getProductBySlugApi(id);
        const p = res.data;
        setForm({
          name: p.name || '',
          slug: p.slug || '',
          description: p.description || '',
          price: p.price ?? '',
          compareAtPrice: p.compareAtPrice ?? '',
          category: p.category?._id || p.category || '',
          images: (p.images || []).join('\n'),
          stock: p.stock ?? '0',
          sku: p.sku || '',
          isFeatured: Boolean(p.isFeatured),
          isActive: p.isActive !== undefined ? p.isActive : true
        });
      } catch (err) {
        console.error('Failed to load product:', err);
        setError('Could not load this product.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, isEditing]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      description: form.description,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      category: form.category,
      images: form.images.split('\n').map((s) => s.trim()).filter(Boolean),
      stock: Number(form.stock),
      sku: form.sku || undefined,
      isFeatured: form.isFeatured,
      isActive: form.isActive
    };

    try {
      if (isEditing) {
        await updateProductApi(id, payload);
      } else {
        await createProductApi(payload);
      }
      navigate('/admin/products');
    } catch (err) {
      console.error('Failed to save product:', err);
      setError(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title={isEditing ? 'Edit Product' : 'Add Product'}>
      {loading ? (
        <Spinner size="lg" />
      ) : (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          <Input
            label="Product Name"
            required
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />

          <Input
            label="Slug (optional, auto-generated from name if blank)"
            value={form.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            placeholder="e.g. midori-md-notebook-a5"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full px-3.5 py-2 text-sm bg-white border border-brand-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (THB)"
              type="number"
              min="0"
              required
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
            />
            <Input
              label="Compare-at Price (optional)"
              type="number"
              min="0"
              value={form.compareAtPrice}
              onChange={(e) => handleChange('compareAtPrice', e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-brand-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Image URLs (one per line)</label>
            <textarea
              value={form.images}
              onChange={(e) => handleChange('images', e.target.value)}
              rows={3}
              placeholder="https://example.com/image1.jpg"
              className="w-full px-3.5 py-2 text-sm bg-white border border-brand-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Stock Quantity"
              type="number"
              min="0"
              required
              value={form.stock}
              onChange={(e) => handleChange('stock', e.target.value)}
            />
            <Input
              label="SKU (optional)"
              value={form.sku}
              onChange={(e) => handleChange('sku', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => handleChange('isFeatured', e.target.checked)}
                className="w-4 h-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
              />
              Featured Product
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="w-4 h-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
              />
              Active (visible on storefront)
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} className="gap-2">
              <Save className="w-4 h-4" />
              {isEditing ? 'Save Changes' : 'Create Product'}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => navigate('/admin/products')}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
};
