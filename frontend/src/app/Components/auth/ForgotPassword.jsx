'use client'
import { useState } from 'react'
import { Mail, Lock, ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { useForgotPassword } from '@/app/hooks/useForgotPassword'
import OtpInput from './OtpInput'
import OtpVerifying from './OtpVerifying'

export default function ForgotPassword({ userRole, onBackToSignIn }) {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    step,
    loading,
    error,
    successMsg,
    otpSent,
    otpVerifyStatus,
    otpVerifyMessage,
    handleSendForgotOTP,
    handleOtpChange,
    handleResetPassword,
  } = useForgotPassword()

  const iIconClass = "w-full pl-12 pr-4 py-3.5 text-gray-900 text-base font-medium bg-white border-2 border-gray-200 rounded-xl placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"

  return (
    <div className="w-full">
      <div className="mb-8">
        <button
          type="button"
          onClick={onBackToSignIn}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </button>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h2>
        <p className="text-gray-600">
          {step === 'email' && 'Enter your email to receive a reset OTP'}
          {step === 'otp' && 'Enter the OTP sent to your email'}
          {step === 'reset' && 'Create your new password'}
          {step === 'done' && 'Password reset successfully!'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {step === 'email' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className={iIconClass}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSendForgotOTP(email, userRole)}
            disabled={loading || !email}
            className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-base font-bold rounded-xl hover:from-teal-600 hover:to-teal-700 active:scale-[0.98] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending OTP...' : 'Send Reset OTP'}
          </button>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-4">
          <OtpInput
            email={email}
            onOtpChange={(val) => handleOtpChange(val, email, setOtp)}
            onSendOtp={() => handleSendForgotOTP(email, userRole)}
            otpSent={otpSent}
            otpLoading={loading}
          />
          <OtpVerifying status={otpVerifyStatus} message={otpVerifyMessage} />
        </div>
      )}

      {step === 'reset' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                className="w-full pl-12 pr-12 py-3.5 text-gray-900 text-base font-medium bg-white border-2 border-gray-200 rounded-xl placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
              />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none">
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full pl-12 pr-12 py-3.5 text-gray-900 text-base font-medium bg-white border-2 border-gray-200 rounded-xl placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none">
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleResetPassword(email, userRole, newPassword, confirmPassword, onBackToSignIn)}
            disabled={loading || !newPassword || !confirmPassword}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-base font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </div>
      )}

      {step === 'done' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
          <p className="text-lg font-semibold text-gray-800 text-center">{successMsg}</p>
          <button
            type="button"
            onClick={onBackToSignIn}
            className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-base font-bold rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg"
          >
            Go to Sign In
          </button>
        </div>
      )}
    </div>
  )
}
