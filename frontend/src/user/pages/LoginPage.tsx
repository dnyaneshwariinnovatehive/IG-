import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ChevronLeft, Zap } from 'lucide-react'
import { Button } from '@ui/button'
import { useAuth } from '@hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { loginAsync, isLoggingIn, loginError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLocalError(null)

    if (!email.trim()) {
      setLocalError('Email address is required.')
      return
    }
    if (!password) {
      setLocalError('Password is required.')
      return
    }

    try {
      await loginAsync({ email: email.trim(), password })
      navigate('/admin/dashboard', { replace: true })
    } catch {
      // loginError from hook will surface below
    }
  }

  const errorMessage =
    localError ??
    (loginError
      ? (loginError as { message?: string })?.message ?? 'Invalid email or password. Please try again.'
      : null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* ── Card ── */}
        <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.08)] border border-slate-100 p-8">
          {/* Logo + Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-indigo-600 flex items-center justify-center shadow-md mb-4">
              <Zap size={28} className="text-white fill-white" />
            </div>
            <h1 className="font-sora font-bold text-2xl text-[#0F172A] tracking-tight">
              InnovateGuide
            </h1>
            <h2 className="font-sora font-semibold text-lg text-[#0F172A] mt-1">
              Admin Login
            </h2>
            <p className="text-sm text-slate-500 mt-1 text-center">
              Sign in to manage projects and review submissions
            </p>
          </div>

          {/* Error banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5"
              role="alert"
            >
              <span className="font-medium">Error:</span>
              {errorMessage}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#0F172A] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-slate-400" />
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setLocalError(null)
                  }}
                  placeholder="admin@innovateguide.in"
                  className="w-full pl-9 pr-4 h-11 rounded-xl border border-slate-200 bg-slate-50 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all duration-200"
                  disabled={isLoggingIn}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#0F172A] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-slate-400" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setLocalError(null)
                  }}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-11 h-11 rounded-xl border border-slate-200 bg-slate-50 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all duration-200"
                  disabled={isLoggingIn}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={isLoggingIn}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? 'Signing in...' : 'Login'}
            </Button>
          </form>
        </div>

        {/* Back to Home */}
        <div className="mt-5 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-accent transition-colors"
          >
            <ChevronLeft size={14} />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
