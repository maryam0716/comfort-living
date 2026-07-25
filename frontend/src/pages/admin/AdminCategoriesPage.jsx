import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import {
  fetchAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/adminCategoryService'
import { resolveImageUrl } from '../../services/adminApi'
import ImageUploader from '../../components/admin/ImageUploader'

const emptyForm = { name: '', description: '', image: '', isActive: true }

function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    fetchAdminCategories()
      .then(setCategories)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  const [searchParams] = useSearchParams()
  useEffect(load, [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (searchParams.get('new') === '1') openCreate() }, [])

  const openCreate = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setShowForm(true)
  }

  const openEdit = (cat) => {
    setEditingId(cat.id)
    setFormData({
      name: cat.name || '',
      description: cat.description || '',
      image: cat.image || '',
      isActive: cat.isActive !== false,
    })
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Category name is required')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (editingId) {
        await updateCategory(editingId, formData)
      } else {
        await createCategory(formData)
      }
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return
    try {
      await deleteCategory(id)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage product categories shown across the storefront
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
        >
          <FiPlus size={16} /> Add Category
        </button>
      </div>

      {error && (
        <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-[#050a14] border border-[#1a2a3a] rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold">
              {editingId ? 'Edit Category' : 'Add New Category'}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white">
              <FiX size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Category name" value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-[#0d1829] border border-[#1e3a4a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-primary md:col-span-2" />

            <input placeholder="Description (optional)" value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-[#0d1829] border border-[#1e3a4a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-primary md:col-span-2" />

            <ImageUploader label="Category image" value={formData.image}
              onChange={(img) => setFormData({ ...formData, image: img })}
              className="md:col-span-2" />

            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
              Active (visible on storefront)
            </label>

            <div className="md:col-span-2 flex gap-3 mt-2">
              <button type="submit" disabled={saving}
                className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors disabled:opacity-60">
                {saving ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-[#1e293b] text-gray-300 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#334155] transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#050a14] border border-[#1a2a3a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase tracking-wider border-b border-[#1a2a3a]">
                <th className="px-5 py-3">Image</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Products</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="text-center text-gray-500 py-10">Loading...</td></tr>
              )}
              {!loading && categories.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-500 py-10">No categories yet. Create one to get started.</td></tr>
              )}
              {!loading && categories.map((cat) => (
                <tr key={cat.id} className="border-b border-[#0d1829] hover:bg-[#0d1829] transition-colors">
                  <td className="px-5 py-3">
                    {cat.image ? (
                      <img src={resolveImageUrl(cat.image)} alt={cat.name} className="w-11 h-11 rounded-lg object-cover" />
                    ) : <div className="w-11 h-11 rounded-lg bg-[#1a2a3a]" />}
                  </td>
                  <td className="px-5 py-3 text-white font-medium">{cat.name}</td>
                  <td className="px-5 py-3 text-gray-300">{cat.count}</td>
                  <td className="px-5 py-3">
                    {cat.isActive ? (
                      <span className="bg-green-950 text-green-400 text-xs px-2.5 py-1 rounded-full">Active</span>
                    ) : (
                      <span className="bg-gray-800 text-gray-400 text-xs px-2.5 py-1 rounded-full">Inactive</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(cat)} title="Edit"
                        className="p-2 rounded-lg bg-[#1e293b] text-gray-300 hover:bg-primary hover:text-white transition-colors">
                        <FiEdit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} title="Delete"
                        className="p-2 rounded-lg bg-[#1e293b] text-gray-300 hover:bg-red-600 hover:text-white transition-colors">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminCategoriesPage
