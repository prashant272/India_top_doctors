'use client'

import { useState, useContext } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Crown } from 'lucide-react'
import { AuthContext } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'

export default function SignIn({ userRole, onSwitchToSignUp, onForgotPassword }) {
  const auth = useContext(AuthContext)
  const authhook = useAuth()
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authhook.signIn({
        email: formData.email,
        password: formData.password,
        role: userRole
      }, userRole)

      if (response.status === 200 && response.data?.success) {
        const userData = response.data
        const backendRole = userData?.role || response.data[userRole]?.role

        if (backendRole !== 'admin' && backendRole !== 'superadmin') {
          setError('Access denied. Admin credentials only.')
          return
        }

        const authPayload = {
          token: response.data.token,
          refreshToken: response.data.refreshToken,
          userId: userData?._id || userData?.id,
          role: backendRole,
          email: userData?.email,
          name: userData?.name,
          profileImage: userData?.profileImage || null,
          roleData: {
            permissions: userData?.permissions || [],
          }
        }

        auth.Userdispatch({
          type: "SIGN_IN",
          payload: authPayload
        })

        const redirectPaths = {
          admin: '/admin/dashboard',
          superadmin: '/superadmin/dashboard'
        }

        router.push(redirectPaths[backendRole] || '/admin/dashboard')
      } else {
        setError(response.data?.msg || 'Invalid credentials')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isSuperAdmin = userRole === 'superadmin'
  const accentColor = isSuperAdmin
    ? 'focus:ring-violet-500 focus:border-violet-500'
    : 'focus:ring-teal-500 focus:border-teal-500'

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          {isSuperAdmin
            ? <Crown className="w-7 h-7 text-violet-400" />
            : <Shield className="w-7 h-7 text-teal-400" />
          }
          <h2 className="text-3xl font-bold text-white">Welcome Back!</h2>
        </div>
        <p className="text-slate-400">
          Sign in as {isSuperAdmin ? 'Super Admin' : 'Admin'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/40 border border-red-500/50 text-red-300 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter admin email"
              className={`w-full pl-12 pr-4 py-3.5 text-white text-base font-medium bg-slate-700/60 border-2 border-slate-600 rounded-xl placeholder:text-slate-500 placeholder:font-normal focus:outline-none focus:ring-2 ${accentColor} transition-all duration-200`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
              className={`w-full pl-12 pr-12 py-3.5 text-white text-base font-medium bg-slate-700/60 border-2 border-slate-600 rounded-xl placeholder:text-slate-500 placeholder:font-normal focus:outline-none focus:ring-2 ${accentColor} transition-all duration-200`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors duration-200 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              className="w-4 h-4 text-teal-500 bg-slate-700 border-2 border-slate-500 rounded focus:ring-2 focus:ring-teal-500 cursor-pointer"
            />
            <span className="text-sm text-slate-400 font-medium group-hover:text-slate-200 transition-colors">
              Remember me
            </span>
          </label>

          <button
            type="button"
            onClick={onForgotPassword}
            className={`text-sm font-semibold transition-colors duration-200 ${
              isSuperAdmin
                ? 'text-violet-400 hover:text-violet-300'
                : 'text-teal-400 hover:text-teal-300'
            }`}
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 text-white text-base font-bold rounded-xl active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
            isSuperAdmin
              ? 'bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800'
              : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700'
          }`}
        >
          {loading ? 'Signing In...' : 'Sign In'}
          {!loading && <ArrowRight className="w-5 h-5" />}
        </button>

        <div className="text-center pt-4">
          <p className="text-sm text-slate-500">
            Need to register an admin?{' '}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-teal-400 hover:text-teal-300 font-semibold transition-colors duration-200"
            >
              Sign Up
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}
