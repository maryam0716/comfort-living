import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi'
import { resetAdminPassword } from '../../services/adminAuthService'

function AdminResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      await resetAdminPassword(token, password)
      setSuccess(true)
      setTimeout(() => navigate('/admin/login'), 2000)
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand flex items-center justify-center px-4">
      <div className="bg-[#050a14] border border-[#1a2a3a] rounded-2xl p-10 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-1">Comfort Livings</h1>
        <p className="text-gray-400 text-sm mb-8">
          {success ? 'Password updated.' : 'Set a new password for your admin account.'}
        </p>

        {success ? (
          <div className="bg-green-950 border border-green-800 text-green-400 text-sm rounded-xl px-4 py-3">
            Your password has been reset successfully. Redirecting you to Sign In...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-[#0d1829] border border-[#1e3a4a] rounded-xl text-sm text-white outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>

            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-[#0d1829] border border-[#1e3a4a] rounded-xl text-sm text-white outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
              >
                {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Must be at least 8 characters, with an uppercase letter, lowercase letter, number and symbol.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-opacity-90 transition-colors disabled:opacity-60"
            >
              {submitting ? 'Resetting...' : 'Reset Password'}
            </button>

            <Link
              to="/admin/login"
              className="flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-primary transition-colors pt-2"
            >
              <FiArrowLeft size={14} />
              Back to Sign In
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}

export default AdminResetPasswordPage
