import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMail, FiArrowLeft } from 'react-icons/fi'
import { forgotAdminPassword } from '../../services/adminAuthService'

function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await forgotAdminPassword(email)
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand flex items-center justify-center px-4">
      <div className="bg-[#050a14] border border-[#1a2a3a] rounded-2xl p-10 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-1">Comfort Livings</h1>
        <p className="text-gray-400 text-sm mb-8">
          {submitted
            ? 'Check your inbox for the reset link.'
            : 'Enter your email to receive a password reset link.'}
        </p>

        {submitted ? (
          <div className="space-y-6">
            <div className="bg-green-950 border border-green-800 text-green-400 text-sm rounded-xl px-4 py-3">
              If an account exists for <span className="font-semibold">{email}</span>, we've sent a
              password reset link to it. The link expires in 30 minutes.
            </div>
            <Link
              to="/admin/login"
              className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
            >
              <FiArrowLeft size={14} />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#0d1829] border border-[#1e3a4a] rounded-xl text-sm text-white outline-none focus:border-primary transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-opacity-90 transition-colors disabled:opacity-60"
            >
              {submitting ? 'Sending...' : 'Send Reset Link'}
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

export default AdminForgotPasswordPage
