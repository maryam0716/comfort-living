import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { FiPlus, FiEdit2, FiTrash2, FiRotateCcw, FiX, FiXCircle, FiMove } from 'react-icons/fi'
import {
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  restoreAdminProduct,
  permanentDeleteAdminProduct,
  deleteAdminProductImage,
  reorderAdminProductImages,
} from '../../services/adminProductService'
import { fetchAdminCategories } from '../../services/adminCategoryService'
import { resolveImageUrl } from '../../services/adminApi'

const emptyForm = {
  title: '', shortDescription: '', description: '', category: '',
  price: '', salePrice: '', stock: '', sku: '', badge: '',
  featured: false, bestSeller: false, newArrival: false,
}

function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [imageFiles, setImageFiles] = useState([])
  const [saving, setSaving] = useState(false)
  // Existing gallery images for the product currently being edited — kept
  // separate from imageFiles (new uploads) so they can be deleted /
  // reordered independently without touching the "add new images" input.
  const [existingImages, setExistingImages] = useState([])
  const [imageOrderDirty, setImageOrderDirty] = useState(false)
  const [savingImageOrder, setSavingImageOrder] = useState(false)
  const [dragIndex, setDragIndex] = useState(null)
  // Drag index for reordering the newly-picked (not-yet-uploaded) gallery
  // files — kept separate from `dragIndex` above, which is for the
  // already-saved existing images, so the two lists don't interfere.
  const [newImageDragIndex, setNewImageDragIndex] = useState(null)
  // Local (not-yet-uploaded) preview URLs for the files currently picked
  // in the thumbnail/gallery inputs, so the admin can see what they just
  // selected right away instead of only finding out after saving.
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [imagePreviews, setImagePreviews] = useState([])
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    if (!thumbnailFile) { setThumbnailPreview(''); return }
    const url = URL.createObjectURL(thumbnailFile)
    setThumbnailPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [thumbnailFile])

  useEffect(() => {
    if (!imageFiles.length) { setImagePreviews([]); return }
    const urls = imageFiles.map((file) => URL.createObjectURL(file))
    setImagePreviews(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [imageFiles])

  const loadProducts = () => {
    setLoading(true)
    fetchAdminProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  // Categories are loaded fresh every time the form opens, so any
  // category created on the Categories page (even in another tab)
  // shows up in this dropdown without a page reload.
  const loadCategories = () => {
    fetchAdminCategories()
      .then(setCategories)
      .catch((err) => setError(err.message))
  }

  const [searchParams] = useSearchParams()
  useEffect(() => { loadProducts(); loadCategories() }, [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (searchParams.get('new') === '1') openCreateForm() }, [])

  const openCreateForm = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setThumbnailFile(null)
    setImageFiles([])
    setExistingImages([])
    setImageOrderDirty(false)
    setSaveMessage('')
    loadCategories()
    setShowForm(true)
  }

  const openEditForm = (product) => {
    setEditingId(product.id)
    setFormData({
      title: product.name || '',
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      category: product.category || '',
      price: product.price || '',
      salePrice: product.salePrice || '',
      stock: product.stock || '',
      sku: product.sku || '',
      badge: product.badge || '',
      featured: !!product.featured,
      bestSeller: !!product.bestSeller,
      newArrival: !!product.newArrival,
    })
    setThumbnailFile(null)
    setImageFiles([])
    setExistingImages(product.images || [])
    setImageOrderDirty(false)
    setSaveMessage('')
    loadCategories()
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaveMessage('')
    try {
      const payload = { ...formData }
      let saved
      if (editingId) {
        saved = await updateAdminProduct(editingId, payload, { thumbnail: thumbnailFile, images: imageFiles })
      } else {
        saved = await createAdminProduct(payload, { thumbnail: thumbnailFile, images: imageFiles })
      }
      // Keep the form open and reflect exactly what was saved (including
      // the newly uploaded gallery photos) instead of closing right away —
      // previously the admin had to reopen the product from the list just
      // to confirm which photos actually got attached.
      setEditingId(saved.id)
      setExistingImages(saved.images || [])
      setThumbnailFile(null)
      setImageFiles([])
      setSaveMessage(editingId ? 'Product updated — photos below reflect what was saved.' : 'Product created — photos below reflect what was saved.')
      loadProducts()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? It will be hidden from the storefront but can be restored later.')) return
    try {
      await deleteAdminProduct(id)
      loadProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRestore = async (id) => {
    try {
      await restoreAdminProduct(id)
      loadProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  // Permanently removes the product (and its image files) so a product
  // with the same title/SKU can be recreated afterward. Irreversible,
  // so this is only offered for products already soft-deleted.
  const handlePermanentDelete = async (id) => {
    if (!confirm('Permanently delete this product? This cannot be undone and the product will be completely removed.')) return
    try {
      await permanentDeleteAdminProduct(id)
      loadProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteImage = async (image) => {
    if (!editingId) return
    if (!confirm('Remove this image from the product?')) return
    try {
      const updated = await deleteAdminProductImage(editingId, image)
      setExistingImages(updated.images || [])
      loadProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleImageDragStart = (index) => setDragIndex(index)
  const handleImageDragOver = (e) => e.preventDefault()
  const handleImageDrop = (index) => {
    if (dragIndex === null || dragIndex === index) return
    setExistingImages((prev) => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(index, 0, moved)
      return next
    })
    setDragIndex(null)
    setImageOrderDirty(true)
  }

  // Removes a not-yet-uploaded thumbnail selection (picked by mistake),
  // so the admin doesn't have to re-select the whole file input.
  const handleRemoveThumbnailFile = () => setThumbnailFile(null)

  // Removes a single not-yet-uploaded gallery file, and lets the admin
  // drag-reorder the pending files before they're uploaded.
  const handleRemoveImageFile = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }
  const handleNewImageDragStart = (index) => setNewImageDragIndex(index)
  const handleNewImageDragOver = (e) => e.preventDefault()
  const handleNewImageDrop = (index) => {
    if (newImageDragIndex === null || newImageDragIndex === index) return
    setImageFiles((prev) => {
      const next = [...prev]
      const [moved] = next.splice(newImageDragIndex, 1)
      next.splice(index, 0, moved)
      return next
    })
    setNewImageDragIndex(null)
  }

  const handleSaveImageOrder = async () => {
    if (!editingId) return
    setSavingImageOrder(true)
    setError('')
    try {
      await reorderAdminProductImages(editingId, existingImages)
      setImageOrderDirty(false)
      loadProducts()
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingImageOrder(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your product catalog</p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
        >
          <FiPlus size={16} /> Add Product
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
            <h2 className="text-white font-semibold">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white">
              <FiX size={20} />
            </button>
          </div>

          {saveMessage && (
            <div className="bg-green-950 border border-green-800 text-green-400 text-sm rounded-xl px-4 py-3 mb-5">
              {saveMessage}
            </div>
          )}

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Product title" value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-[#0d1829] border border-[#1e3a4a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-primary md:col-span-2" />

            <input placeholder="Short description" value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="bg-[#0d1829] border border-[#1e3a4a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-primary md:col-span-2" />

            <textarea placeholder="Full description" value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-[#0d1829] border border-[#1e3a4a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-primary md:col-span-2 min-h-[90px]" />

            <div>
              <select required value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#0d1829] border border-[#1e3a4a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-primary">
                <option value="">Select category</option>
                {formData.category && !categories.some((c) => c.name === formData.category) && (
                  <option value={formData.category}>{formData.category} (current)</option>
                )}
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-xs text-amber-400 mt-1">
                  No categories yet. <Link to="/admin/categories" className="underline">Create one first</Link>.
                </p>
              )}
            </div>

            <input placeholder="SKU (optional)" value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="bg-[#0d1829] border border-[#1e3a4a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-primary" />

            <input required type="number" placeholder="Price" value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="bg-[#0d1829] border border-[#1e3a4a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-primary" />

            <input required type="number" placeholder="Sale price" value={formData.salePrice}
              onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
              className="bg-[#0d1829] border border-[#1e3a4a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-primary" />

            <input required type="number" placeholder="Stock" value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="bg-[#0d1829] border border-[#1e3a4a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-primary" />

            <input placeholder="Badge (e.g. Sale, New)" value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className="bg-[#0d1829] border border-[#1e3a4a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-primary" />

            <div className="flex items-center gap-5 md:col-span-2 text-sm text-gray-300">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} />
                Featured
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.bestSeller}
                  onChange={(e) => setFormData({ ...formData, bestSeller: e.target.checked })} />
                Best Seller
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.newArrival}
                  onChange={(e) => setFormData({ ...formData, newArrival: e.target.checked })} />
                New Arrival
              </label>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">Thumbnail image</label>
              <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files[0])}
                className="text-sm text-gray-300 w-full" />
              {thumbnailPreview && (
                <div className="relative w-16 mt-2">
                  <img src={thumbnailPreview} alt="" className="w-16 h-16 rounded-lg object-cover border border-[#1e3a4a]" />
                  <button
                    type="button"
                    onClick={handleRemoveThumbnailFile}
                    title="Remove selected thumbnail"
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-500"
                  >
                    <FiXCircle size={14} />
                  </button>
                </div>
              )}
            </div>

            {editingId && existingImages.length > 0 && (
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-500">
                    Existing images — drag to reorder, click ✕ to remove
                  </label>
                  {imageOrderDirty && (
                    <button type="button" onClick={handleSaveImageOrder} disabled={savingImageOrder}
                      className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-60">
                      {savingImageOrder ? 'Saving order...' : 'Save order'}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {existingImages.map((img, index) => (
                    <div
                      key={img}
                      draggable
                      onDragStart={() => handleImageDragStart(index)}
                      onDragOver={handleImageDragOver}
                      onDrop={() => handleImageDrop(index)}
                      className="relative group cursor-move"
                      title="Drag to reorder"
                    >
                      <img src={resolveImageUrl(img)} alt="" className="w-20 h-20 rounded-lg object-cover border border-[#1e3a4a]" />
                      <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                        <FiMove size={10} className="inline -mt-0.5" />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img)}
                        title="Remove image"
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-500"
                      >
                        <FiXCircle size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-gray-500 block mb-1">Gallery images</label>
              <input type="file" accept="image/*" multiple onChange={(e) => setImageFiles(Array.from(e.target.files))}
                className="text-sm text-gray-300 w-full" />
              {imagePreviews.length > 0 && (
                <>
                  <p className="text-[11px] text-gray-600 mt-2 mb-1">Drag to reorder, click ✕ to remove a mistaken pick</p>
                  <div className="flex flex-wrap gap-3">
                    {imagePreviews.map((src, index) => (
                      <div
                        key={index}
                        draggable
                        onDragStart={() => handleNewImageDragStart(index)}
                        onDragOver={handleNewImageDragOver}
                        onDrop={() => handleNewImageDrop(index)}
                        className="relative group cursor-move"
                        title="Drag to reorder"
                      >
                        <img src={src} alt="" className="w-20 h-20 rounded-lg object-cover border border-[#1e3a4a]" />
                        <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                          <FiMove size={10} className="inline -mt-0.5" />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImageFile(index)}
                          title="Remove this photo"
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-500"
                        >
                          <FiXCircle size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="md:col-span-2 flex gap-3 mt-2">
              <button type="submit" disabled={saving}
                className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors disabled:opacity-60">
                {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
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
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="text-center text-gray-500 py-10">Loading...</td></tr>
              )}
              {!loading && products.length === 0 && (
                <tr><td colSpan={7} className="text-center text-gray-500 py-10">No products yet.</td></tr>
              )}
              {!loading && products.map((p) => (
                <tr key={p.id} className="border-b border-[#0d1829] hover:bg-[#0d1829] transition-colors">
                  <td className="px-5 py-3">
                    {p.images?.[0] ? (
                      <img src={resolveImageUrl(p.images[0])} alt={p.name} className="w-11 h-11 rounded-lg object-cover" />
                    ) : <div className="w-11 h-11 rounded-lg bg-[#1a2a3a]" />}
                  </td>
                  <td className="px-5 py-3 text-white font-medium">{p.name}</td>
                  <td className="px-5 py-3 text-gray-400">{p.category}</td>
                  <td className="px-5 py-3 text-gray-300">Rs. {p.salePrice}</td>
                  <td className="px-5 py-3 text-gray-300">{p.stock}</td>
                  <td className="px-5 py-3">
                    {p.isActive ? (
                      <span className="bg-green-950 text-green-400 text-xs px-2.5 py-1 rounded-full">Active</span>
                    ) : (
                      <span className="bg-red-950 text-red-400 text-xs px-2.5 py-1 rounded-full">Deleted</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditForm(p)} title="Edit"
                        className="p-2 rounded-lg bg-[#1e293b] text-gray-300 hover:bg-primary hover:text-white transition-colors">
                        <FiEdit2 size={14} />
                      </button>
                      {p.isActive ? (
                        <button onClick={() => handleDelete(p.id)} title="Delete"
                          className="p-2 rounded-lg bg-[#1e293b] text-gray-300 hover:bg-red-600 hover:text-white transition-colors">
                          <FiTrash2 size={14} />
                        </button>
                      ) : (
                        <>
                          <button onClick={() => handleRestore(p.id)} title="Restore"
                            className="p-2 rounded-lg bg-[#1e293b] text-gray-300 hover:bg-green-600 hover:text-white transition-colors">
                            <FiRotateCcw size={14} />
                          </button>
                          <button onClick={() => handlePermanentDelete(p.id)} title="Permanently delete"
                            className="p-2 rounded-lg bg-[#1e293b] text-gray-300 hover:bg-red-700 hover:text-white transition-colors">
                            <FiXCircle size={14} />
                          </button>
                        </>
                      )}
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

export default AdminProductsPage
