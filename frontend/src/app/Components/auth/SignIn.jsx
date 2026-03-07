'use client'

import { useState, useContext } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Building2 } from 'lucide-react'
import { AuthContext } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import { useHospitalSignin } from '@/app/hooks/useHospital'
import { useProviderSignin } from '@/app/hooks/useProvider'

export default function SignIn({ userRole, onSwitchToSignUp, onForgotPassword }) {
  const auth = useContext(AuthContext)
  const authhook = useAuth()
  const router = useRouter()
  const { mutateAsync: hospitalSignin, isPending: hospitalLoading }   = useHospitalSignin()
  const { mutateAsync: providerSignin, isPending: providerLoading }   = useProviderSignin()

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: userRole,
    rememberMe: false,
  })

  const isSubmitting = loading || hospitalLoading || providerLoading

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (userRole === 'hospital') {
        const data = await providerSignin({
          email: formData.email,
          password: formData.password,
        })

        if (data?.data?.success) {
          const provider = data.data.provider
          auth.Userdispatch({
            type: 'SIGN_IN',
            payload: {
              token:          data.data.token,
              refreshToken:   data.data.refreshToken,
              userId:         provider?._id || provider?.id,
              email:          provider?.email,
              name:           provider?.name,
              profileImage:   provider?.profileImage || null,
              role:           'provider',
              isPremium:      false,
              isActive:       provider?.isActive ?? true,
              currentPlan:    null,
              planDetails:    null,
              planStartDate:  null,
              planExpiryDate: null,
              roleData:       { phone: provider?.phone },
            },
          })
          router.push('/hospital')
        } else {
          setError(data?.data?.message || 'Invalid email or password')
        }
        return
      }

      const response = await authhook.signIn(
        { email: formData.email, password: formData.password, role: userRole },
        userRole
      )

      if (response.status === 200 && response.data?.success) {
        const userData    = response.data[userRole]
        const backendRole = userData?.role || userRole

        let authPayload = {
          token:        response.data.token,
          refreshToken: response.data.refreshToken,
          userId:       userData?._id || userData?.id,
          role:         backendRole,
        }

        if (backendRole === 'doctor') {
          const doctor = response.data.doctor
          const plan   = response.data.plan
          authPayload = {
            ...authPayload,
            email:          doctor?.email,
            name:           doctor?.fullName,
            profileImage:   doctor?.profileImage || '',
            isPremium:      plan?.isActive ?? false,
            isActive:       plan?.isActive ?? false,
            currentPlan:    plan?.planId ? { _id: plan.planId, name: plan.planName } : doctor?.currentPlan || null,
            planDetails:    plan
              ? {
                  planId:       plan.planId,
                  planName:     plan.planName,
                  billingCycle: plan.billingCycle,
                  features:     plan.features,
                  price:        plan.price,
                }
              : null,
            planStartDate:  plan?.planStartDate  || null,
            planExpiryDate: plan?.planExpiryDate || null,
            roleData: {
              specialization:  doctor?.specialization,
              consultationFee: doctor?.consultationFee,
              qualification:   doctor?.qualification,
            },
          }
        } else if (backendRole === 'patient') {
          const patient = response.data.patient
          authPayload = {
            ...authPayload,
            email:          patient?.email,
            name:           patient?.fullName,
            profileImage:   patient?.profileImage,
            isPremium:      false,
            isActive:       false,
            currentPlan:    null,
            planDetails:    null,
            planStartDate:  null,
            planExpiryDate: null,
            roleData: {
              phone:      patient?.phone,
              age:        patient?.age,
              bloodGroup: patient?.bloodGroup,
              address:    patient?.address,
            },
          }
        } else if (backendRole === 'admin') {
          const admin = response.data.admin
          authPayload = {
            ...authPayload,
            email:          admin?.email,
            name:           admin?.name,
            profileImage:   admin?.profileImage,
            isPremium:      false,
            isActive:       false,
            currentPlan:    null,
            planDetails:    null,
            planStartDate:  null,
            planExpiryDate: null,
            roleData: { permissions: admin?.permissions },
          }
        }

        auth.Userdispatch({ type: 'SIGN_IN', payload: authPayload })

        const redirectPaths = {
          doctor:  '/doctor/dashboard',
          patient: '/',
          admin:   '/admin/dashboard',
        }

        router.push(redirectPaths[backendRole] || '/dashboard')
      } else {
        setError(response.data?.msg || 'Invalid email or password')
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.msg     ||
        err?.message                 ||
        'An unexpected error occurred. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
        <p className="text-gray-600">
          Sign in to your account as a{' '}
          {userRole === 'patient' ? 'Patient'
            : userRole === 'admin'    ? 'Admin'
            : userRole === 'hospital' ? 'Hospital'
            : 'Doctor'}
        </p>
        {userRole === 'hospital' && (
          <div className="mt-3 flex items-center gap-2 text-sm text-teal-700 bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5">
            <Building2 className="w-4 h-4 shrink-0" />
            Access your hospital dashboard after signing in
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
              className="w-full pl-12 pr-4 py-3.5 text-gray-900 text-base font-medium bg-white border-2 border-gray-200 rounded-xl placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
              className="w-full pl-12 pr-12 py-3.5 text-gray-900 text-base font-medium bg-white border-2 border-gray-200 rounded-xl placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
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
              className="w-4 h-4 text-teal-600 bg-white border-2 border-gray-300 rounded focus:ring-2 focus:ring-teal-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
              Remember me
            </span>
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-teal-600 hover:text-teal-700 font-semibold transition-colors duration-200"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-base font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
          {!isSubmitting && <ArrowRight className="w-5 h-5" />}
        </button>

        <div className="text-center pt-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-teal-600 hover:text-teal-700 font-semibold transition-colors duration-200"
            >
              Sign Up
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}
