'use client'

import { useState, useContext } from 'react'
import { User, Mail, Lock, Phone, MapPin, Stethoscope, Building2, Eye, EyeOff, ArrowRight, Calendar, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { AuthContext } from '@/app/context/AuthContext'
import { useAuth } from '@/app/hooks/useAuth'
import { useProviderSignup } from '@/app/hooks/useProvider'
import { useOtp } from '@/app/hooks/useOtp'
import OtpInput from './OtpInput'
import OtpVerifying from './OtpVerifying'

export default function SignUp({ userRole, onSwitchToSignIn }) {
  const auth = useContext(AuthContext)
  const authhook = useAuth()
  const { mutateAsync: providerSignup, isPending: providerLoading } = useProviderSignup()

  const isAdminCreating = !!(auth?.UserAuthData?.role === 'admin' && auth?.UserAuthData)

  const {
    otpSent,
    otpVerified,
    otpLoading,
    otpVerifyStatus,
    otpVerifyMessage,
    otpError,
    handleSendOtp,
    handleOtpChange,
  } = useOtp()

  const [showPassword, setShowPassword]               = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading]                         = useState(false)
  const [error, setError]                             = useState('')
  const [otp, setOtp]                                 = useState('')

  const [formData, setFormData] = useState({
    fullName:        '',
    email:           '',
    phone:           '',
    password:        '',
    confirmPassword: '',
    dob:             '',
    gender:          '',
    city:            '',
    state:           '',
    specialization:  '',
    qualification:   '',
    licenseNumber:   '',
    experience:      '',
    consultationFee: '',
    hospitalName:    '',
    termsAccepted:   false,
  })

  const set = (field) => (e) => setFormData({ ...formData, [field]: e.target.value })

  const isSubmitting = loading || providerLoading

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match!')
    if (formData.password.length < 6) return setError('Password must be at least 6 characters long')
    if (!formData.termsAccepted) return setError('Please accept terms and conditions')
    if (userRole !== 'hospital' && !isAdminCreating && !otpVerified)
      return setError('Please verify your email with OTP before submitting')

    setLoading(true)
    try {
      if (userRole === 'hospital') {
        const data = await providerSignup({
          name:     formData.fullName,
          email:    formData.email,
          password: formData.password,
          phone:    formData.phone || undefined,
        })

        if (data?.data?.success) {
          onSwitchToSignIn()
        } else {
          setError(data?.data?.message || 'Registration failed. Please try again.')
        }
        return
      }

      let requestBody = {}

      if (userRole === 'doctor') {
        requestBody = {
          basicInfo: {
            fullName: formData.fullName,
            email:    formData.email,
            phone:    formData.phone,
            gender:   formData.gender,
            dob:      formData.dob,
          },
          professionalInfo: {
            specialization:  formData.specialization,
            qualification:   formData.qualification,
            experience:      Number(formData.experience)      || 0,
            licenseNumber:   formData.licenseNumber,
            consultationFee: Number(formData.consultationFee) || 0,
          },
          password:         formData.password,
          role:             'doctor',
          otp:              isAdminCreating ? undefined : otp,
          isAdminCreating,
        }
      } else if (userRole === 'patient') {
        requestBody = {
          name:     formData.fullName,
          email:    formData.email,
          phone:    formData.phone,
          dob:      formData.dob,
          gender:   formData.gender,
          address:  { city: formData.city, state: formData.state },
          password: formData.password,
          role:     'patient',
          otp:      isAdminCreating ? undefined : otp,
          isAdminCreating,
        }
      }

      const response = await authhook.signUp(requestBody, userRole)

      if (response.status === 201 && response.data?.success) {
        const userData = response.data[userRole]
        if (!isAdminCreating) {
          auth.Userdispatch({
            type: 'SIGN_IN',
            payload: {
              token:        response.data.token,
              refreshToken: response.data.refreshToken,
              userId:       userData._id || userData.id,
              email:        userData.basicInfo?.email    || userData.email,
              name:         userData.basicInfo?.fullName || userData.name,
              profileImage: userData.basicInfo?.profileImage || userData.profileImage || null,
              role:         userRole,
              roleData:
                userRole === 'doctor'
                  ? {
                      specialization:  userData.professionalInfo?.specialization,
                      consultationFee: userData.professionalInfo?.consultationFee,
                      qualification:   userData.professionalInfo?.qualification,
                    }
                  : {},
            },
          })
        }
        onSwitchToSignIn()
      } else {
        setError(response.data?.msg || 'Sign up failed. Please try again.')
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

  const iClass     = "w-full px-4 py-3.5 text-gray-900 text-base font-medium bg-white border-2 border-gray-200 rounded-xl placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
  const iIconClass = "w-full pl-12 pr-4 py-3.5 text-gray-900 text-base font-medium bg-white border-2 border-gray-200 rounded-xl placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
  const iPassClass = "w-full pl-12 pr-12 py-3.5 text-gray-900 text-base font-medium bg-white border-2 border-gray-200 rounded-xl placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
        <p className="text-gray-600">
          {isAdminCreating
            ? 'Creating Doctor Account as Admin'
            : userRole === 'hospital'
            ? 'Register as a Hospital Provider'
            : `Join us as a ${userRole === 'patient' ? 'Patient' : 'Doctor'}`}
        </p>
        {isAdminCreating && (
          <div className="mt-3 flex items-center gap-2 text-sm text-teal-700 bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            Email OTP verification is skipped for admin-created accounts
          </div>
        )}
        {userRole === 'hospital' && (
          <div className="mt-3 flex items-center gap-2 text-sm text-teal-700 bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5">
            <Building2 className="w-4 h-4 shrink-0" />
            After sign up, create and manage hospitals from your dashboard
          </div>
        )}
      </div>

      {(error || otpError) && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error || otpError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {userRole === 'hospital' ? 'Your Full Name' : 'Full Name'}
          </label>
          <div className="relative">
            {userRole === 'hospital'
              ? <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              : <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            }
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={set('fullName')}
              placeholder={userRole === 'hospital' ? 'Enter your full name' : 'Enter your full name'}
              className={iIconClass}
            />
          </div>
        </div>

        <div className={userRole === 'hospital' ? 'grid md:grid-cols-2 gap-4' : 'grid md:grid-cols-2 gap-4'}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={set('email')}
                placeholder="Enter your email"
                className={iIconClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="tel"
                required={userRole !== 'hospital'}
                value={formData.phone}
                onChange={set('phone')}
                placeholder="Enter phone number"
                className={iIconClass}
              />
            </div>
          </div>
        </div>

        {userRole !== 'hospital' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={set('dob')}
                  className={iIconClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
              <select required value={formData.gender} onChange={set('gender')} className={iClass}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        )}

        {userRole === 'doctor' && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
                <div className="relative">
                  <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={formData.specialization}
                    onChange={set('specialization')}
                    placeholder="e.g., Cardiologist"
                    className={iIconClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Qualification</label>
                <input
                  type="text"
                  required
                  value={formData.qualification}
                  onChange={set('qualification')}
                  placeholder="e.g., MBBS, MD"
                  className={iClass}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">License Number</label>
                <input
                  type="text"
                  required
                  value={formData.licenseNumber}
                  onChange={set('licenseNumber')}
                  placeholder="Medical Council Reg. No."
                  className={iClass}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.experience}
                  onChange={set('experience')}
                  placeholder="Years of experience"
                  className={iClass}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Consultation Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.consultationFee}
                  onChange={set('consultationFee')}
                  placeholder="Enter consultation fee"
                  className={iClass}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hospital/Clinic Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.hospitalName}
                    onChange={set('hospitalName')}
                    placeholder="Hospital/Clinic name"
                    className={iIconClass}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {userRole === 'patient' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={formData.city}
                  onChange={set('city')}
                  placeholder="Enter your city"
                  className={iIconClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={set('state')}
                placeholder="Enter your state"
                className={iClass}
              />
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={set('password')}
                placeholder="Create password (min 6 chars)"
                className={iPassClass}
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
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={set('confirmPassword')}
                placeholder="Confirm password"
                className={iPassClass}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {!isAdminCreating && userRole !== 'hospital' && (
          <div className="space-y-2">
            <OtpInput
              email={formData.email}
              onOtpChange={(val) => handleOtpChange(val, formData.email, setOtp)}
              onSendOtp={() => handleSendOtp(formData.email, formData.fullName, userRole)}
              otpSent={otpSent}
              otpLoading={otpLoading}
            />
            <OtpVerifying status={otpVerifyStatus} message={otpVerifyMessage} />
          </div>
        )}

        <div className="flex items-start gap-2 pt-2">
          <input
            type="checkbox"
            required
            checked={formData.termsAccepted}
            onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
            className="w-4 h-4 text-teal-600 bg-white border-2 border-gray-300 rounded focus:ring-2 focus:ring-teal-500 cursor-pointer mt-1"
          />
          <label className="text-sm text-gray-700 font-medium">
            I agree to the{' '}
            <Link href="/terms" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">
              Terms and Conditions
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">
              Privacy Policy
            </Link>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || (userRole !== 'hospital' && !isAdminCreating && !otpVerified)}
          className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-base font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting
            ? 'Creating Account...'
            : userRole === 'hospital'
            ? 'Register as Provider'
            : 'Create Account'}
          {!isSubmitting && <ArrowRight className="w-5 h-5" />}
        </button>

        <div className="text-center pt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}
