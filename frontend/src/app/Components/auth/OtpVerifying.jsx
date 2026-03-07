'use client'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export default function OtpVerifying({ status, message }) {
  if (!status) return null

  const config = {
    loading: {
      icon: <Loader2 className="w-5 h-5 animate-spin text-teal-600" />,
      bg: 'bg-teal-50 border-teal-200',
      text: 'text-teal-700',
    },
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-700',
    },
    error: {
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-700',
    },
  }

  const { icon, bg, text } = config[status]

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bg}`}>
      {icon}
      <p className={`text-sm font-medium ${text}`}>{message}</p>
    </div>
  )
}
