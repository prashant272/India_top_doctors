'use client'

import { useState, useContext } from 'react'
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, Shield, Crown, Key } from 'lucide-react'
import Link from 'next/link'
import { AuthContext } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'

export default function SignUp({ userRole, onSwitchToSignIn }) {
  const auth = useContext(AuthContext)
  const authhook = useAuth()
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    department: '',
    secretKey: '',
    permissions: [],
    termsAccepted: false
  })

  const allPermissions = [
    'manage_doctors',
    'manage_patients',
    'manage_appointments',
    'manage_hospitals',
    'view_reports',
    'manage_billing',
    'manage_admins',
  ]

  const togglePermission = (perm) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (!formData.termsAccepted) {
      setError('Please accept terms and conditions')
      return
    }

    setLoading(true)

    try {
      const requestBody = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        department: formData.department,
        secretKey: formData.secretKey,
        permissions: userRole === 'superadmin' ? allPermissions : formData.permissions,
        role: userRole
      }

      const response = await authhook.signUp(requestBody, userRole)

      if (response.status === 201 && response.data?.success) {
        const userData = response.data[userRole]

        auth.Userdispatch({
          type: "SIGN_IN",
          payload: {
            token: response.data.token,
            refreshToken: response.data.refreshToken,
            userId: userData._id || userData.id,
            email: userData.email,
            fullName: userData.fullName,
            profileImage: userData.profileImage || null,
            role: userRole,
            roleData: {
              permissions: userData.permissions || [],
              department: userData.department
            }
          }
        })

        onSwitchToSignIn()
      } else {
        setError(response.data?.msg || 'Sign up failed. Please try again.')
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isSuperAdmin = userRole === 'superadmin'
  const accentFocus = isSuperAdmin ? 'focus:ring-violet-500 focus:border-violet-500' : 'focus:ring-teal-500 focus:border-teal-500'
  const inputBase = `w-full py-3.5 text-white text-base font-medium bg-slate-700/60 border-2 border-slate-600 rounded-xl placeholder:text-slate-500 placeholder:font-normal focus:outline-none focus:ring-2 ${accentFocus} transition-all duration-200`
  const inputWithIcon = `${inputBase} pl-12 pr-4`
  const inputPlain = `${inputBase} px-4`

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          {isSuperAdmin
            ? <Crown className="w-7 h-7 text-violet-400" />
            : <Shield className="w-7 h-7 text-teal-400" />
          }
          <h2 className="text-3xl font-bold text-white">Create Admin</h2>
        </div>
        <p className="text-slate-400">
          Register a new {isSuperAdmin ? 'Super Admin' : 'Admin'} account
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/40 border border-red-500/50 text-red-300 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter full name"
              className={inputWithIcon}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
                className={inputWithIcon}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone number"
                className={inputWithIcon}
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className={inputPlain}
            >
              <option value="">Select Department</option>
              <option value="Operations">Operations</option>
              <option value="Finance">Finance</option>
              <option value="Technology">Technology</option>
              <option value="Medical Affairs">Medical Affairs</option>
              <option value="HR">Human Resources</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Access Code</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                required
                value={formData.secretKey}
                onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                placeholder="Organization access code"
                className={inputWithIcon}
              />
            </div>
          </div>
        </div>

        {!isSuperAdmin && (
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {allPermissions.map((perm) => (
                <label key={perm} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(perm)}
                    onChange={() => togglePermission(perm)}
                    className="w-4 h-4 text-teal-500 bg-slate-700 border-2 border-slate-500 rounded focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-400 font-medium group-hover:text-slate-200 transition-colors capitalize">
                    {perm.replace(/_/g, ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {isSuperAdmin && (
          <div className="p-3 bg-violet-900/30 border border-violet-500/30 rounded-xl">
            <p className="text-xs text-violet-300 font-medium flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Super Admin is granted all permissions automatically.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min 8 characters"
                className={`${inputBase} pl-12 pr-12`}
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

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm password"
                className={`${inputBase} pl-12 pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors duration-200 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 pt-2">
          <input
            type="checkbox"
            required
            checked={formData.termsAccepted}
            onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
            className="w-4 h-4 text-teal-500 bg-slate-700 border-2 border-slate-500 rounded focus:ring-2 focus:ring-teal-500 cursor-pointer mt-1"
          />
          <label className="text-sm text-slate-400 font-medium">
            I agree to the{' '}
            <Link href="/terms" className="text-teal-400 hover:text-teal-300 font-semibold transition-colors duration-200">
              Terms and Conditions
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-teal-400 hover:text-teal-300 font-semibold transition-colors duration-200">
              Privacy Policy
            </Link>
          </label>
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
          {loading ? 'Creating Account...' : `Create ${isSuperAdmin ? 'Super Admin' : 'Admin'}`}
          {!loading && <ArrowRight className="w-5 h-5" />}
        </button>

        <div className="text-center pt-4">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-teal-400 hover:text-teal-300 font-semibold transition-colors duration-200"
            >
              Sign In
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}