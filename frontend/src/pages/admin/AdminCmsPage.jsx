import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import { fetchCmsPages, createCmsPage, updateCmsPage, deleteCmsPage } from '../../services/adminCmsService'
import { resolveImageUrl } from '../../services/adminApi'
import ImageUploader from '../../components/admin/ImageUploader'

const emptyForm = { key: '', title: '', subtitle: '', image: '', content: '', active: true, sections: [] }
const emptySection = { title: '', subtitle: '', description: '', image: '' }

function AdminCmsPage() {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    fetchCmsPages().then(setPages).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openCreate = () => { setEditingId(null); setFormData(emptyForm); setShowForm(true) }
  const openEdit = (page) => {
    setEditingId(page._id)
    setFormData({
      key: page.key, title: page.title, subtitle: page.subtitle || '', image: page.image || '',
      content: page.content, active: page.active, sections: page.sections || [],
    })
    setShowForm(true)
  }

  const addSection = () => setFormData({ ...formData, sections: [...formData.sections, { ...emptySection }] })
  const removeSection = (index) => setFormData({ ...formData, sections: formData.sections.filter((_, i) => i !== index) })
  const updateSection = (index, patch) => {
    const sections = formData.sections.map((s, i) => (i === index ? { ...s, ...patch } : s))
    setFormData({ ...formData, sections })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingId) await updateCmsPage(editingId, formData)
      else await createCmsPage(formData)
      setShowForm(false)
      load()
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this page?')) return
    try { await deleteCmsPage(id); load() } catch (err) { setError(err.message) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">CMS Pages</h1>
          <p className="text-gray-500 text-sm mt-1">Manage static content pages (About, Privacy Policy, Terms, etc.)</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors">
          <FiPlus size={16} /> Add Page
        </button>
      </div>

      {error && <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">{error}</div>}

      {showForm && (
        <div className="bg-[#050a14] border border-[#1a2a3a] rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold">{editingId ? 'Edit Page' : 'Add New Page'}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white"><FiX size={20} /></button>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Key (e.g. about-us, privacy-policy)" value={formData.key} disabled={!!editingId}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              className="bg-[#0d1829] border border-[#1e3a4a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-primary disabled:opacity-50" />
            <input required placeholder="Page title" value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-[#0d1829] border border-[#1e3a4a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-primary" />
            <input placeholder="Subtitle (optional)" value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="bg-[#0d1829] border border-[#1e3a4a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-primary md:col-span-2" />
            <ImageUploader label="Header image (optional)" value={formData.image}
              onChange={(img) => setFormData({ ...formData, image: img })}
              className="md:col-span-2" />
            <textarea placeholder="Content (HTML or plain text)" value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="bg-[#0d1829] border border-[#1e3a4a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-primary min-h-[160px] md:col-span-2" />

            <div className="md:col-span-2 border-t border-[#1a2a3a] pt-4 mt-1">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-white font-medium">Sections</p>
                <button type="button" onClick={addSection}
                  className="flex items-center gap-1.5 bg-[#1e293b] text-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#334155] transition-colors">
                  <FiPlus size={13} /> Add Section
                </button>
              </div>

              {formData.sections.length === 0 && (
                <p className="text-gray-500 text-xs mb-2">
                  Optional content blocks (title, subtitle, description, image) rendered below the main content, styled to match the rest of the site.
                </p>
              )}

              <div className="space-y-4">
                {formData.sections.map((section, index) => (
                  <div key={index} className="bg-[#0d1829] border border-[#1e3a4a] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-gray-500 font-medium">Section {index + 1}</p>
                      <button type="button" onClick={() => removeSection(index)} className="text-gray-500 hover:text-red-400">
                        <FiX size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input placeholder="Title" value={section.title}
                        onChange={(e) => updateSection(index, { title: e.target.value })}
                        className="bg-[#050a14] border border-[#1e3a4a] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary" />
                      <input placeholder="Subtitle" value={section.subtitle}
                        onChange={(e) => updateSection(index, { subtitle: e.target.value })}
                        className="bg-[#050a14] border border-[#1e3a4a] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary" />
                      <textarea placeholder="Description" value={section.description}
                        onChange={(e) => updateSection(index, { description: e.target.value })}
                        className="bg-[#050a14] border border-[#1e3a4a] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary min-h-[70px] md:col-span-2" />
                      <ImageUploader label="Section image" value={section.image}
                        onChange={(img) => updateSection(index, { image: img })}
                        className="md:col-span-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} />
              Active (visible on storefront)
            </label>
            <button type="submit" disabled={saving}
              className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors disabled:opacity-60 md:col-span-2 w-fit">
              {saving ? 'Saving...' : editingId ? 'Update Page' : 'Create Page'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-[#050a14] border border-[#1a2a3a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase tracking-wider border-b border-[#1a2a3a]">
                <th className="px-5 py-3">Image</th><th className="px-5 py-3">Key</th><th className="px-5 py-3">Title</th><th className="px-5 py-3">Status</th><th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="text-center text-gray-500 py-10">Loading...</td></tr>}
              {!loading && pages.length === 0 && <tr><td colSpan={5} className="text-center text-gray-500 py-10">No pages yet.</td></tr>}
              {!loading && pages.map((p) => (
                <tr key={p._id} className="border-b border-[#0d1829] hover:bg-[#0d1829] transition-colors">
                  <td className="px-5 py-3">
                    {p.image ? (
                      <img src={resolveImageUrl(p.image)} alt={p.title} className="w-11 h-11 rounded-lg object-cover" />
                    ) : <div className="w-11 h-11 rounded-lg bg-[#1a2a3a]" />}
                  </td>
                  <td className="px-5 py-3 text-gray-400 font-mono text-xs">{p.key}</td>
                  <td className="px-5 py-3 text-white font-medium">{p.title}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${p.active ? 'bg-green-950 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 rounded-lg bg-[#1e293b] text-gray-300 hover:bg-primary hover:text-white transition-colors"><FiEdit2 size={14} /></button>
                      <button onClick={() => handleDelete(p._id)} className="p-2 rounded-lg bg-[#1e293b] text-gray-300 hover:bg-red-600 hover:text-white transition-colors"><FiTrash2 size={14} /></button>
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

export default AdminCmsPage
