import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, FolderTree } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  getCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi
} from '../../api/categories';

const emptyForm = { name: '', slug: '', description: '', image: '' };

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategoriesApi();
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openNewForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  };

  const openEditForm = (cat) => {
    setEditingId(cat._id);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', image: cat.image || '' });
    setError('');
    setShowForm(true);
  };

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
      image: form.image
    };

    try {
      if (editingId) {
        await updateCategoryApi(editingId, payload);
      } else {
        await createCategoryApi(payload);
      }
      setShowForm(false);
      await fetchCategories();
    } catch (err) {
      console.error('Failed to save category:', err);
      setError(err.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"? Products in this category will keep their reference.`)) return;
    try {
      await deleteCategoryApi(cat._id);
      setCategories((prev) => prev.filter((c) => c._id !== cat._id));
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert(err.message || 'Failed to delete category');
    }
  };

  return (
    <AdminLayout title="Categories">
      <div className="flex justify-end mb-6">
        <Button variant="primary" size="md" className="gap-2" onClick={openNewForm}>
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">{editingId ? 'Edit Category' : 'New Category'}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name" required value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
            <Input
              label="Slug (optional, auto from name)"
              value={form.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
            />
          </div>
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
          <Input
            label="Image URL"
            value={form.image}
            onChange={(e) => handleChange('image', e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingId ? 'Save Changes' : 'Create Category'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <Spinner size="lg" />
      ) : categories.length === 0 ? (
        <EmptyState icon={FolderTree} title="No categories yet" description="Add a category before creating products." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{cat.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{cat.slug}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => openEditForm(cat)}
                    className="p-1.5 text-slate-500 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {cat.description && <p className="text-xs text-slate-500 line-clamp-2">{cat.description}</p>}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};
