import { useRef, useState } from 'react'
import { FiUpload, FiX, FiLoader } from 'react-icons/fi'
import { adminApi, resolveImageUrl } from '../../services/adminApi'

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

// Upload-from-computer widget used across the admin panel (products,
// homepage sections, banners, team members, CMS pages). Uploads the
// chosen file to POST /api/upload and reports the returned "/uploads/.."
// path back to the parent via onChange, so parent forms keep storing a
// plain image path string exactly as before — this just replaces how
// that string gets populated (upload instead of hand-typed URL).
function ImageUploader({ value, onChange, label = 'Image', required = false, className = '' }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file) => {
    if (!file) return
    setError('')

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Only JPG, JPEG, PNG or WEBP images are allowed')
      return
    }

    setUploading(true)
    try {
      const form = new FormData()
      form.append('image', file)
      const res = await adminApi.post('/upload', form)
      onChange(res.image)
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className={className}>
      <label className="text-xs text-gray-500 block mb-1">
        {label}{required && <span className="text-red-400"> *</span>}
      </label>

      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative shrink-0">
            <img
              src={resolveImageUrl(value)}
              alt=""
              className="w-16 h-16 rounded-lg object-cover border border-[#1e3a4a]"
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-500"
              title="Remove image"
            >
              <FiX size={12} />
            </button>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-[#0d1829] border border-dashed border-[#1e3a4a] shrink-0" />
        )}

        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
            id={`img-upload-${label.replace(/\s+/g, '-')}`}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 bg-[#1e293b] text-gray-300 px-3 py-2 rounded-lg text-xs font-medium hover:bg-[#334155] transition-colors disabled:opacity-60"
          >
            {uploading ? <FiLoader size={14} className="animate-spin" /> : <FiUpload size={14} />}
            {uploading ? 'Uploading...' : value ? 'Replace image' : 'Upload from computer'}
          </button>
          <p className="text-[11px] text-gray-600 mt-1">JPG, JPEG, PNG or WEBP</p>
          {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
        </div>
      </div>
    </div>
  )
}

export default ImageUploader
