'use client'

import { useState, useEffect, useContext } from 'react'
import {
    Calendar, Clock, Video, MapPin, Phone, CheckCircle, XCircle,
    AlertCircle, ChevronDown, ChevronUp, Stethoscope, FileText,
    IndianRupee, RefreshCw, Filter, Search, Loader2, Activity, Hash, Wifi,
    HeartPulse, Star,
} from 'lucide-react'
import useAppointment from '@/app/hooks/useAppointment'
import { AuthContext } from '@/app/context/AuthContext'
import { SocketContext } from '@/app/context/SocketContext'
import { useRouter } from 'next/navigation'

const STATUS_CONFIG = {
    pending: {
        label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50',
        border: 'border-amber-200', icon: AlertCircle, dot: 'bg-amber-400',
        stripe: 'from-amber-400 to-orange-400', glow: 'shadow-amber-100',
        cardBorder: 'border-l-amber-400',
    },
    confirmed: {
        label: 'Confirmed', color: 'text-emerald-600', bg: 'bg-emerald-50',
        border: 'border-emerald-200', icon: CheckCircle, dot: 'bg-emerald-400',
        stripe: 'from-emerald-400 to-teal-400', glow: 'shadow-emerald-100',
        cardBorder: 'border-l-emerald-400',
    },
    in_progress: {
        label: 'In Progress', color: 'text-violet-600', bg: 'bg-violet-50',
        border: 'border-violet-200', icon: Activity, dot: 'bg-violet-400',
        stripe: 'from-violet-400 to-purple-400', glow: 'shadow-violet-100',
        cardBorder: 'border-l-violet-400',
    },
    completed: {
        label: 'Completed', color: 'text-blue-600', bg: 'bg-blue-50',
        border: 'border-blue-200', icon: CheckCircle, dot: 'bg-blue-400',
        stripe: 'from-blue-400 to-indigo-400', glow: 'shadow-blue-100',
        cardBorder: 'border-l-blue-400',
    },
    cancelled: {
        label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-50',
        border: 'border-red-200', icon: XCircle, dot: 'bg-red-400',
        stripe: 'from-red-400 to-rose-400', glow: 'shadow-red-100',
        cardBorder: 'border-l-red-400',
    },
    missed: {
        label: 'Missed', color: 'text-orange-600', bg: 'bg-orange-50',
        border: 'border-orange-200', icon: AlertCircle, dot: 'bg-orange-400',
        stripe: 'from-orange-400 to-red-400', glow: 'shadow-orange-100',
        cardBorder: 'border-l-orange-400',
    },
}

const FILTER_META = {
    all: { label: 'All', activeClass: 'bg-slate-800 text-white' },
    pending: { label: 'Pending', activeClass: 'bg-amber-500 text-white' },
    confirmed: { label: 'Confirmed', activeClass: 'bg-emerald-500 text-white' },
    in_progress: { label: 'In Progress', activeClass: 'bg-violet-500 text-white' },
    completed: { label: 'Completed', activeClass: 'bg-blue-500 text-white' },
    cancelled: { label: 'Cancelled', activeClass: 'bg-red-500 text-white' },
    missed: { label: 'Missed', activeClass: 'bg-orange-500 text-white' },
}

function StatCard({ label, count, gradient, icon: Icon }) {
    return (
        <div className="relative bg-white rounded-2xl p-4 border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-300">
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br ${gradient}`} />
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-3xl font-black text-gray-900 leading-none">{count}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
        </div>
    )
}

function AppointmentCard({ appointment, onCancel, onReschedule, onJoin }) {
    const [expanded, setExpanded] = useState(false)
    const status = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.pending
    const StatusIcon = status.icon
    const date = new Date(appointment.appointmentDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const apptDay = new Date(date)
    apptDay.setHours(0, 0, 0, 0)
    const isToday = apptDay.getTime() === today.getTime()
    const isTomorrow = apptDay.getTime() === today.getTime() + 86400000
    const appointmentId = appointment._id

    const formattedDate = date.toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    })

    const doctorName = appointment.doctor?.basicInfo?.fullName || appointment.doctor?.basicInfo?.name || 'Doctor'
    const specialization = appointment.doctor?.professionalInfo?.specialization || appointment.doctor?.professionalInfo?.specialty || 'Specialist'
    const profileImage = appointment.doctor?.basicInfo?.profileImage
    const phone = appointment.doctor?.basicInfo?.phone
    const amount = appointment.amount || appointment.doctor?.professionalInfo?.consultationFee || 0
    const isVideo = appointment.consultationType === 'video'
    const canAct = appointment.status === 'pending' || appointment.status === 'confirmed'
    const isInProgress = appointment.status === 'in_progress'
    const isConfirmedVideo = appointment.status === 'confirmed' && isVideo
    const shortId = appointmentId ? `#${appointmentId.slice(-6).toUpperCase()}` : ''

    const initials = doctorName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    const inPersonSlot = !isVideo
        ? appointment.doctor?.availability?.find(
            (slot) => slot.consultationMode === 'inPerson' || slot.consultationMode === 'clinic'
        ) || appointment.doctor?.availability?.find((slot) => slot.location?.clinicName)
        : null

    const clinicLocation = inPersonSlot?.location
    const clinicAddress = clinicLocation
        ? [clinicLocation.addressLine, clinicLocation.city, clinicLocation.state, clinicLocation.pincode, clinicLocation.country]
            .filter(Boolean).join(', ')
        : null

    return (
        <div className={`relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden flex flex-col border-l-4 ${status.cardBorder}`}>
            <div className={`h-1 w-full bg-gradient-to-r ${status.stripe}`} />

            {(isToday || isTomorrow) && (
                <div className={`flex items-center gap-2 px-5 py-2 border-b ${isToday ? 'bg-rose-50 border-rose-100' : 'bg-violet-50 border-violet-100'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isToday ? 'bg-rose-500' : 'bg-violet-400'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${isToday ? 'text-rose-600' : 'text-violet-600'}`}>
                        {isToday ? "Today's Appointment" : 'Tomorrow'}
                    </span>
                </div>
            )}

            {isInProgress && (
                <div className="flex items-center justify-between px-5 py-2.5 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-violet-600">Call In Progress</span>
                    </div>
                    <button
                        onClick={() => onJoin(appointmentId)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-violet-600 text-white font-black text-[10px] uppercase tracking-wider rounded-lg hover:bg-violet-700 transition-all shadow-md shadow-violet-500/25"
                    >
                        <Video className="w-3 h-3" />
                        Rejoin
                    </button>
                </div>
            )}

            {isConfirmedVideo && (
                <div className="flex items-center justify-between px-5 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-600">Video Consultation Ready</span>
                    </div>
                    <button
                        onClick={() => onJoin(appointmentId)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider rounded-lg hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/25"
                    >
                        <Video className="w-3 h-3" />
                        Join Now
                    </button>
                </div>
            )}

            <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start gap-4 mb-5">
                    <div className="relative flex-shrink-0">
                        {profileImage ? (
                            <img
                                src={profileImage}
                                alt={doctorName}
                                className="w-16 h-16 rounded-2xl object-cover shadow-md"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-sky-100 via-sky-200 to-indigo-100 rounded-2xl flex items-center justify-center shadow-md">
                                <span className="text-sky-700 font-black text-lg">{initials}</span>
                            </div>
                        )}
                        <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${status.dot}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <h3 className="font-black text-gray-900 text-[15px] leading-tight truncate">{doctorName}</h3>
                                <p className="text-xs text-teal-600 font-semibold truncate mt-0.5">{specialization}</p>
                            </div>
                            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black border flex-shrink-0 ${status.bg} ${status.border} ${status.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md font-mono">
                                <Hash className="w-2.5 h-2.5" />
                                {shortId}
                            </span>
                            {appointment.status === 'missed' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                    Missed
                                </span>
                            )}
                            {appointment.status === 'completed' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                                    <Star className="w-2.5 h-2.5" />
                                    Completed
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-2xl px-3 py-2.5">
                        <Calendar className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                        <span className="text-[11px] text-gray-700 font-semibold truncate">{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-2xl px-3 py-2.5">
                        <Clock className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                        <span className="text-[11px] text-gray-700 font-semibold truncate">
                            {appointment.timeSlot?.start} – {appointment.timeSlot?.end}
                        </span>
                    </div>
                    <div className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 border ${isVideo ? 'bg-sky-50 border-sky-100' : 'bg-rose-50 border-rose-100'}`}>
                        {isVideo
                            ? <Wifi className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                            : <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />}
                        <span className="text-[11px] text-gray-700 font-semibold capitalize">
                            {isVideo ? 'Video Call' : 'In-Person'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2.5">
                        <IndianRupee className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span className="text-[11px] font-semibold text-gray-700">₹{amount}</span>
                        <span className={`text-[10px] font-black ml-auto ${appointment.isPaid ? 'text-emerald-500' : 'text-red-500'}`}>
                            {appointment.isPaid ? '✓ Paid' : '✗ Due'}
                        </span>
                    </div>
                </div>

                {!isVideo && clinicLocation && (
                    <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-rose-100 bg-rose-100/60">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Clinic / Hospital</span>
                        </div>
                        <div className="px-3 py-2.5 space-y-1">
                            {clinicLocation.clinicName && (
                                <p className="text-[13px] font-black text-gray-800">{clinicLocation.clinicName}</p>
                            )}
                            {clinicAddress && (
                                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{clinicAddress}</p>
                            )}
                            {clinicLocation.city && clinicLocation.state && (
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-white border border-rose-200 px-2 py-0.5 rounded-full">
                                        📍 {clinicLocation.city}, {clinicLocation.state}
                                    </span>
                                    {clinicLocation.pincode && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                                            {clinicLocation.pincode}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!isVideo && !clinicLocation && (
                    <div className="mb-4 flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-2xl px-3 py-2.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                        <span className="text-[11px] text-gray-400 font-medium">Clinic location not available</span>
                    </div>
                )}

                {expanded && (
                    <div className="mb-4 space-y-2.5 border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-2xl px-3 py-2.5">
                            <Hash className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Appointment ID</p>
                                <p className="text-[11px] text-gray-700 font-bold font-mono">{appointmentId}</p>
                            </div>
                        </div>
                        {appointment.callDuration > 0 && (
                            <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-2xl px-3 py-2.5">
                                <Clock className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest">Call Duration</p>
                                    <p className="text-[11px] text-gray-700 font-semibold">
                                        {Math.floor(appointment.callDuration / 60)}m {appointment.callDuration % 60}s
                                    </p>
                                </div>
                            </div>
                        )}
                        {appointment.symptoms && (
                            <div className="flex items-start gap-2.5 bg-teal-50 border border-teal-100 rounded-2xl p-3">
                                <Stethoscope className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Symptoms</p>
                                    <p className="text-[12px] text-gray-700 leading-relaxed">{appointment.symptoms}</p>
                                </div>
                            </div>
                        )}
                        {appointment.notes && (
                            <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-2xl p-3">
                                <FileText className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Notes</p>
                                    <p className="text-[12px] text-gray-700 leading-relaxed">{appointment.notes}</p>
                                </div>
                            </div>
                        )}
                        {phone && (
                            <div className="flex items-center gap-2.5 bg-orange-50 border border-orange-100 rounded-2xl p-3">
                                <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-0.5">Doctor Contact</p>
                                    <p className="text-[12px] text-gray-700 font-semibold">{phone}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 mt-auto">
                    {(isConfirmedVideo || isInProgress) && (
                        <button
                            onClick={() => onJoin(appointmentId)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-[11px] rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-md shadow-emerald-200 active:scale-95"
                        >
                            <Video className="w-3.5 h-3.5" />
                            {isInProgress ? 'Rejoin Call' : 'Join Meeting'}
                        </button>
                    )}
                    {canAct && (
                        <button
                            onClick={() => onReschedule(appointmentId)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-amber-200 text-amber-600 font-black text-[11px] rounded-xl hover:bg-amber-50 hover:border-amber-300 transition-all duration-200 active:scale-95"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Reschedule
                        </button>
                    )}
                    {canAct && (
                        <button
                            onClick={() => onCancel(appointmentId)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-red-200 text-red-500 font-black text-[11px] rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-200 active:scale-95"
                        >
                            <XCircle className="w-3.5 h-3.5" />
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-50 border border-gray-200 text-gray-500 font-black text-[11px] rounded-xl hover:bg-gray-100 transition-all duration-200 active:scale-95"
                    >
                        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {expanded ? 'Less' : 'Details'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function MyAppointments() {
    const { fetchAppointments, cancelAppointment, loading, error } = useAppointment()
    const auth = useContext(AuthContext)
    const { socket } = useContext(SocketContext)
    const router = useRouter()

    const [appointments, setAppointments] = useState([])
    const [activeFilter, setActiveFilter] = useState('all')
    const [search, setSearch] = useState('')

    const filters = ['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'missed']

    useEffect(() => {
        const load = async () => {
            const role = auth?.UserAuthData?.role
            const id = auth?.UserAuthData?.userId || auth?.UserAuthData?._id
            if (!role || !id) return
            const res = await fetchAppointments(role, id)
            if (res?.status === 200) {
                const data = res.data?.data || res.data || []
                setAppointments(Array.isArray(data) ? data : [])
            }
        }
        load()
    }, [auth])

    useEffect(() => {
        if (!socket) return

        const upsert = (incoming) => {
            if (!incoming?._id) return
            setAppointments((prev) => {
                const exists = prev.some((a) => a._id === incoming._id)
                if (exists) return prev.map((a) => a._id === incoming._id ? { ...a, ...incoming } : a)
                return [incoming, ...prev]
            })
        }

        const handleAppointmentEvent = (payload) => {
            const appointment = payload?.notification?.appointment || payload?.data?.appointment || payload?.appointment || payload?.data || payload
            upsert(appointment)
        }

        const handleStatusUpdate = (payload) => {
            const appointment = payload?.notification?.appointment || payload?.data?.appointment || payload?.appointment || payload?.data || payload
            upsert(appointment)
        }

        const handleMissed = (data) => {
            if (!data?.appointmentId) return
            setAppointments((prev) =>
                prev.map((a) => a._id === data.appointmentId ? { ...a, status: 'missed' } : a)
            )
        }

        const handleCallUpdate = (data) => {
            if (!data?.appointmentId) return
            setAppointments((prev) =>
                prev.map((a) => a._id === data.appointmentId ? { ...a, ...data } : a)
            )
        }

        socket.on('newMessage', handleAppointmentEvent)
        socket.on('appointmentConfirmed', handleStatusUpdate)
        socket.on('appointmentCancelled', handleStatusUpdate)
        socket.on('appointmentCompleted', handleStatusUpdate)
        socket.on('appointmentRescheduled', handleStatusUpdate)
        socket.on('appointment:missed', handleMissed)
        socket.on('appointment:updated', handleCallUpdate)

        return () => {
            socket.off('newMessage', handleAppointmentEvent)
            socket.off('appointmentConfirmed', handleStatusUpdate)
            socket.off('appointmentCancelled', handleStatusUpdate)
            socket.off('appointmentCompleted', handleStatusUpdate)
            socket.off('appointmentRescheduled', handleStatusUpdate)
            socket.off('appointment:missed', handleMissed)
            socket.off('appointment:updated', handleCallUpdate)
        }
    }, [socket])

    const filtered = appointments.filter((apt) => {
        const name = apt.doctor?.basicInfo?.fullName || apt.doctor?.basicInfo?.name || ''
        const spec = apt.doctor?.professionalInfo?.specialization || apt.doctor?.professionalInfo?.specialty || ''
        const matchesFilter = activeFilter === 'all' || apt.status === activeFilter
        const matchesSearch =
            name.toLowerCase().includes(search.toLowerCase()) ||
            spec.toLowerCase().includes(search.toLowerCase())
        return matchesFilter && matchesSearch
    })

    const handleCancel = async (id) => {
        const res = await cancelAppointment(id)
        if (res?.status === 200) {
            setAppointments((prev) =>
                prev.map((apt) => apt._id === id ? { ...apt, status: 'cancelled' } : apt)
            )
        }
    }

    const handleReschedule = (id) => {
        router.push(`/patient/MyAppointments/rescheduleAppiontment/${id}`)
    }

    const handleJoin = (appointmentId) => {
        router.push(`/patient/video-call/${appointmentId}`)
    }

    const counts = filters.reduce((acc, f) => {
        acc[f] = f === 'all' ? appointments.length : appointments.filter((a) => a.status === f).length
        return acc
    }, {})

    return (
        <section className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                            <HeartPulse className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Appointments</h1>
                            <p className="text-gray-400 text-xs font-semibold mt-0.5">Manage and track all your medical visits</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/patient/doctors')}
                        className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-700 transition-all shadow-lg shadow-slate-900/20 uppercase tracking-wider"
                    >
                        + Book New
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
                    <StatCard label="Total" count={counts.all} gradient="from-slate-600 to-slate-800" icon={Calendar} />
                    <StatCard label="Pending" count={counts.pending} gradient="from-amber-400 to-orange-500" icon={AlertCircle} />
                    <StatCard label="Confirmed" count={counts.confirmed} gradient="from-emerald-400 to-teal-500" icon={CheckCircle} />
                    <StatCard label="Missed" count={counts.missed} gradient="from-orange-400 to-red-500" icon={AlertCircle} />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-7">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search by doctor or specialization..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <Filter className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mr-0.5" />
                            {filters.map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-black capitalize transition-all duration-200 ${activeFilter === f
                                        ? FILTER_META[f].activeClass
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                >
                                    {FILTER_META[f].label}
                                    <span className={`ml-1 font-semibold ${activeFilter === f ? 'opacity-70' : 'text-gray-400'}`}>
                                        {counts[f]}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
                        <p className="text-sm text-gray-400 font-semibold">Fetching your appointments...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-2xl px-5 py-4 mb-6">
                        <XCircle className="w-5 h-5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-black">Something went wrong</p>
                            <p className="text-xs text-red-400 mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-5 border border-gray-100">
                            <Calendar className="w-9 h-9 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-black text-gray-500 mb-1">No appointments found</h3>
                        <p className="text-gray-400 text-sm font-medium mb-6">Try adjusting your filter or search term</p>
                        <button
                            onClick={() => router.push('/patient/doctors')}
                            className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-700 transition-colors shadow-lg shadow-slate-900/20"
                        >
                            Book an Appointment
                        </button>
                    </div>
                )}

                {!loading && filtered.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-4">
                        {filtered.map((apt) => (
                            <AppointmentCard
                                key={apt._id}
                                appointment={apt}
                                onCancel={handleCancel}
                                onReschedule={handleReschedule}
                                onJoin={handleJoin}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
