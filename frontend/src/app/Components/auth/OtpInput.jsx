'use client'
import { useState } from 'react'
import { Mail, RefreshCw } from 'lucide-react'

export default function OtpInput({ email, onOtpChange, onSendOtp, otpSent, otpLoading }) {
  const [otp, setOtp] = useState('')

  const handleChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(val)
    onOtpChange(val)
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        Email OTP Verification
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={handleChange}
            placeholder="Enter 6-digit OTP"
            disabled={!otpSent}
            className="w-full pl-12 pr-4 py-3.5 text-gray-900 text-base font-medium bg-white border-2 border-gray-200 rounded-xl placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
        </div>
        <button
          type="button"
          onClick={onSendOtp}
          disabled={otpLoading || !email}
          className="flex items-center gap-2 px-5 py-3 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap"
        >
          {otpLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
          {otpLoading ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
        </button>
      </div>
      {otpSent && (
        <p className="text-xs text-teal-600 font-medium">
          OTP sent to <strong>{email}</strong>. Valid for 10 minutes.
        </p>
      )}
    </div>
  )
}
