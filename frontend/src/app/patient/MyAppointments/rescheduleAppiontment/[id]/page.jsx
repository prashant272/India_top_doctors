'use client'

import { useState, useEffect, useContext } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Calendar, Clock, RefreshCw, CheckCircle,
  Loader2, AlertCircle, IndianRupee, Hash,
  Video, ChevronLeft, FileText, Stethoscope, MapPin,
} from 'lucide-react'
import useAppointment from '@/app/hooks/useAppointment'
import { getAppointmentById } from '@/app/services/appointment.service'
import { AuthContext } from '@/app/context/AuthContext'

const DAY_JS_MAP = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0 }
const DAY_SHORT = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' }

function generateSlots(startTime, endTime, duration = 30) {
  const slots = []
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  let cur = sh * 60 + sm
  const end = eh * 60 + em
  while (cur + duration <= end) {
    const h = Math.floor(cur / 60).toString().padStart(2, '0')
    const m = (cur % 60).toString().padStart(2, '0')
    const nextMin = cur + duration
    const nh = Math.floor(nextMin / 60).toString().padStart(2, '0')
    const nm = (nextMin % 60).toString().padStart(2, '0')
    slots.push({ start: `${h}:${m}`, end: `${nh}:${nm}` })
    cur += duration
  }
  return slots
}

function getUpcomingDatesForDays(workingDays, count = 14) {
  const dates = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let d = new Date(today)
  d.setDate(d.getDate() + 1)
  while (dates.length < count) {
    const jsDay = d.getDay()
    const matched = workingDays.find((wd) => DAY_JS_MAP[wd.toLowerCase()] === jsDay)
    if (matched) dates.push({ date: new Date(d), day: matched.toLowerCase() })
    d.setDate(d.getDate() + 1)
  }
  return dates
}

export default function RescheduleAppointment() {
  const { id } = useParams()
  const router = useRouter()
  const { updateAppointment, loading: submitting } = useAppointment()

  const [appointment, setAppointment] = useState(null)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const [availableDates, setAvailableDates] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [timeSlots, setTimeSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [reason, setReason] = useState('')
  const [submitError, setSubmitError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const load = async () => {
      setFetchLoading(true)
      setFetchError(null)
      try {
        const res = await getAppointmentById(id)
        if (res?.status === 200) {
          const data = res.data?.data || res.data
          setAppointment(data)

          const availabilityArr = data?.doctor?.availability
          if (Array.isArray(availabilityArr) && availabilityArr.length > 0) {
            const matchingSlot = availabilityArr.find(
              (slot) => slot.consultationMode === (data.consultationType === 'video' ? 'online' : 'inPerson')
            ) || availabilityArr[0]

            if (matchingSlot?.workingDays?.length) {
              setAvailableDates(getUpcomingDatesForDays(matchingSlot.workingDays, 14))
            }
          }
        } else {
          setFetchError('Failed to load appointment details.')
        }
      } catch {
        setFetchError('Something went wrong. Please try again.')
      } finally {
        setFetchLoading(false)
      }
    }
    if (id) load()
  }, [id])

  const handleDateSelect = (dateObj) => {
    setSelectedDate(dateObj)
    setSelectedSlot(null)

    const availabilityArr = appointment?.doctor?.availability
    if (!Array.isArray(availabilityArr) || availabilityArr.length === 0) return

    const matchingSlot = availabilityArr.find(
      (slot) => slot.consultationMode === (appointment.consultationType === 'video' ? 'online' : 'inPerson')
    ) || availabilityArr[0]

    if (matchingSlot) {
      setTimeSlots(generateSlots(
        matchingSlot.startTime || '09:00',
        matchingSlot.endTime || '17:00',
        matchingSlot.slotDuration || 30
      ))
    }
  }

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot) return
    setSubmitError(null)
    try {
      const body = {
        _id: id,
        status: appointment?.status,
        doctor: appointment?.doctor?._id || appointment?.doctor,
        Patient: appointment?.Patient?._id || appointment?.Patient,
        consultationType: appointment?.consultationType,
        isPaid: appointment?.isPaid,
        meetingLink: appointment?.meetingLink || '',
        symptoms: appointment?.symptoms || '',
        notes: appointment?.notes || '',
        amount: appointment?.amount,
        appointmentDate: selectedDate.date.toISOString(),
        timeSlot: { start: selectedSlot.start, end: selectedSlot.end },
        ...(reason.trim() && { rescheduleReason: reason.trim() }),
      }
      const res = await updateAppointment(id, body)
      if (res?.status === 200) {
        setSuccess(true)
        setTimeout(() => router.back(), 2200)
      } else {
        setSubmitError(res?.data?.message || 'Reschedule failed. Please try again.')
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    }
  }

  const doctorName = appointment?.doctor?.basicInfo?.fullName || appointment?.doctor?.basicInfo?.name || 'Doctor'
  const specialization = appointment?.doctor?.professionalInfo?.specialization || 'Specialist'
  const fee = appointment?.amount || appointment?.doctor?.professionalInfo?.consultationFee || 0
  const isVideo = appointment?.consultationType === 'video'
  const shortId = id ? `#${id.slice(-6).toUpperCase()}` : ''
  const initials = doctorName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  const currentDate = appointment?.appointmentDate
    ? new Date(appointment.appointmentDate).toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      })
    : '—'

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Loading appointment...</p>
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-10 flex flex-col items-center gap-5 max-w-sm w-full">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-rose-400" />
          </div>
          <p className="text-sm font-bold text-slate-700 text-center">{fetchError}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-700 transition-colors uppercase tracking-wider"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-10 flex flex-col items-center gap-5 max-w-sm w-full">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-black text-slate-900 mb-1">Rescheduled!</h2>
            <p className="text-sm text-slate-400 font-medium">Appointment updated successfully. Redirecting...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 mb-6 transition-colors uppercase tracking-wider"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-200">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Reschedule Appointment</h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Choose a new date and time slot</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-5">Current Appointment</p>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-100 via-sky-200 to-indigo-100 text-sky-700 flex items-center justify-center text-lg font-black shadow-md flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-slate-800 text-base leading-tight truncate">{doctorName}</h3>
              <p className="text-xs text-sky-600 font-bold mt-0.5">{specialization}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg font-mono mt-1.5">
                <Hash className="w-2.5 h-2.5" />{shortId}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.12em] border bg-amber-50 text-amber-600 border-amber-200 flex-shrink-0">
              <RefreshCw className="w-3 h-3" />
              Reschedule
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex items-center gap-2.5 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
              <Calendar className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              <span className="text-xs text-slate-700 font-semibold leading-tight">{currentDate}</span>
            </div>
            <div className="flex items-center gap-2.5 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
              <Clock className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
              <span className="text-xs text-slate-700 font-semibold">
                {appointment?.timeSlot?.start} – {appointment?.timeSlot?.end}
              </span>
            </div>
            <div className="flex items-center gap-2.5 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
              {isVideo
                ? <Video className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                : <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />}
              <span className="text-xs text-slate-700 font-semibold capitalize">{appointment?.consultationType}</span>
            </div>
            <div className="flex items-center gap-2.5 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span className="text-xs text-slate-700 font-semibold">
                ₹{fee}{' '}
                <span className={`font-black ${appointment?.isPaid ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {appointment?.isPaid ? '✓' : '✗'}
                </span>
              </span>
            </div>
          </div>

          {appointment?.symptoms && (
            <div className="flex items-start gap-3 bg-teal-50/60 rounded-2xl p-4 border border-teal-100 mt-3">
              <Stethoscope className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-black text-teal-600 mb-1 uppercase tracking-[0.12em]">Symptoms</p>
                <p className="text-xs text-slate-700 leading-relaxed">{appointment.symptoms}</p>
              </div>
            </div>
          )}

          {appointment?.notes && (
            <div className="flex items-start gap-3 bg-sky-50/60 rounded-2xl p-4 border border-sky-100 mt-3">
              <FileText className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-black text-sky-600 mb-1 uppercase tracking-[0.12em]">Notes</p>
                <p className="text-xs text-slate-700 leading-relaxed">{appointment.notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-5">Select New Date</p>
          {availableDates.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <Calendar className="w-8 h-8 text-slate-200" />
              <p className="text-sm text-slate-400 font-semibold">No available dates found for this doctor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {availableDates.map((dateObj, idx) => {
                const isSelected = selectedDate?.date.toDateString() === dateObj.date.toDateString()
                const dayLabel = DAY_SHORT[dateObj.day] || dateObj.day
                const dateLabel = dateObj.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                const [dayNum, monthStr] = dateLabel.split(' ')
                return (
                  <button
                    key={idx}
                    onClick={() => handleDateSelect(dateObj)}
                    className={`flex flex-col items-center justify-center px-2 py-3.5 rounded-2xl border-2 transition-all duration-200 active:scale-95 ${
                      isSelected
                        ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50'
                    }`}
                  >
                    <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                      {dayLabel}
                    </span>
                    <span className="text-[13px] font-black leading-none">{dayNum}</span>
                    <span className={`text-[9px] font-semibold mt-0.5 ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                      {monthStr}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {selectedDate && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Select Time Slot</p>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                {selectedDate.date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
              </span>
            </div>
            {timeSlots.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <Clock className="w-8 h-8 text-slate-200" />
                <p className="text-sm text-slate-400 font-semibold">No time slots available.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map((slot, idx) => {
                  const isSelected = selectedSlot?.start === slot.start
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedSlot(slot)}
                      className={`flex flex-col items-center justify-center px-2 py-3.5 rounded-2xl border-2 transition-all duration-200 active:scale-95 ${
                        isSelected
                          ? 'bg-violet-500 border-violet-500 text-white shadow-lg shadow-violet-200'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-violet-300 hover:bg-violet-50'
                      }`}
                    >
                      <Clock className={`w-3 h-3 mb-1.5 ${isSelected ? 'text-violet-100' : 'text-slate-400'}`} />
                      <span className="text-[12px] font-black leading-none">{slot.start}</span>
                      <span className={`text-[9px] font-semibold mt-0.5 ${isSelected ? 'text-violet-100' : 'text-slate-400'}`}>
                        to {slot.end}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5">
            Reason for Rescheduling
            <span className="ml-2 text-slate-300 normal-case tracking-normal font-semibold">(optional)</span>
          </p>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Schedule conflict, prior engagement..."
            className="w-full mt-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none transition-all font-medium"
          />
        </div>

        {submitError && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl px-5 py-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-bold">{submitError}</p>
          </div>
        )}

        {selectedDate && selectedSlot && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.15em] mb-3">New Appointment Summary</p>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-black text-slate-800">
                  {selectedDate.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-black text-slate-800">{selectedSlot.start} – {selectedSlot.end}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pb-8">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3.5 border-2 border-slate-200 text-slate-600 font-black text-xs rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 active:scale-95 uppercase tracking-wider"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedDate || !selectedSlot || submitting}
            className="flex-[2] flex items-center justify-center gap-2 py-3.5 bg-amber-500 text-white font-black text-xs rounded-2xl hover:bg-amber-600 transition-all duration-200 shadow-lg shadow-amber-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 uppercase tracking-wider"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Rescheduling...</>
            ) : (
              <><RefreshCw className="w-4 h-4" /> Confirm Reschedule</>
            )}
          </button>
        </div>

      </div>
    </section>
  )
}
