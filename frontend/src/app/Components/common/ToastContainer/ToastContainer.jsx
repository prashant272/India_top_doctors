'use client'
import React from 'react'
import { X, CheckCircle, AlertCircle, Info, PhoneCall, PhoneOff } from 'lucide-react'

const icons = {
    success: <CheckCircle size={16} className="text-emerald-400 shrink-0" />,
    error: <AlertCircle size={16} className="text-red-400 shrink-0" />,
    info: <Info size={16} className="text-blue-400 shrink-0" />,
    call: <PhoneCall size={16} className="text-emerald-400 shrink-0" />,
    endcall: <PhoneOff size={16} className="text-red-400 shrink-0" />,
}

const styles = {
    success: "border-emerald-700 bg-emerald-950",
    error: "border-red-700 bg-red-950",
    info: "border-blue-700 bg-blue-950",
    call: "border-emerald-700 bg-emerald-950",
    endcall: "border-red-700 bg-red-950",
}

const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 w-72">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm
                        animate-in slide-in-from-right-5 fade-in duration-300
                        ${styles[toast.type] || styles.info}`}
                >
                    {icons[toast.type] || icons.info}
                    <p className="text-white text-xs flex-1 leading-relaxed">{toast.message}</p>
                    <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-white transition-colors">
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    )
}

export default ToastContainer
