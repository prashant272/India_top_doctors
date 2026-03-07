'use client'

import { useState } from 'react'
import { Clock, Building2, Navigation, Wifi, UserCheck } from 'lucide-react'

const ORDERED_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const MODE_STYLES = {
  online:  { bg: 'bg-blue-50',  text: 'text-blue-700',  border: 'border-blue-200',  Icon: Wifi,      label: 'Online'    },
  offline: { bg: 'bg-teal-50',  text: 'text-teal-700',  border: 'border-teal-200',  Icon: UserCheck, label: 'In-Person' },
}

function formatTime(t) {
  if (!t) return ''
  const [hRaw, m] = t.split(':')
  const h = parseInt(hRaw, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m} ${ampm}`
}

function slotCount(start, end, dur) {
  if (!start || !end || !dur) return 0
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const total = eh * 60 + em - (sh * 60 + sm)
  return total > 0 ? Math.floor(total / dur) : 0
}

function ScheduleCard({ slot, index }) {
  const mode = MODE_STYLES[slot.consultationMode] ?? MODE_STYLES.offline
  const ModeIcon = mode.Icon
  const count = slotCount(slot.startTime, slot.endTime, slot.slotDuration)
  const loc = slot.location

  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-black shadow">
            {index + 1}
          </span>
          <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${mode.bg} ${mode.text} ${mode.border}`}>
            <ModeIcon className="w-3 h-3" />{mode.label}
          </span>
        </div>
        {count > 0 && (
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            {count} slots/day
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Timing */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Timing</p>
            <p className="text-sm font-bold text-slate-800">
              {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
              <span className="text-slate-400 font-normal ml-2 text-xs">({slot.slotDuration} min)</span>
            </p>
          </div>
        </div>

        {/* Working Days */}
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Working Days</p>
          <div className="flex flex-wrap gap-1.5">
            {ORDERED_DAYS.map(day => {
              const active = (slot.workingDays || []).includes(day)
              return (
                <span key={day} className={`px-2.5 py-1 rounded-lg text-xs font-bold ${active ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-300'}`}>
                  {day.slice(0, 3)}
                </span>
              )
            })}
          </div>
        </div>

        {/* Location */}
        {(loc?.clinicName || loc?.city || loc?.addressLine) && (
          <div className="flex items-start gap-3 pt-3 border-t border-slate-50">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Building2 className="w-5 h-5 text-orange-500" />
            </div>
            <div className="min-w-0">
              {loc.clinicName && <p className="text-sm font-bold text-slate-800 truncate">{loc.clinicName}</p>}
              {loc.addressLine && <p className="text-xs text-slate-500 truncate mt-0.5">{loc.addressLine}</p>}
              <p className="text-xs text-slate-400 mt-0.5">{[loc.city, loc.state, loc.pincode].filter(Boolean).join(', ')}</p>
              {loc.coordinates?.coordinates?.length === 2 && (
                <a
                  href={`https://maps.google.com/?q=${loc.coordinates.coordinates[1]},${loc.coordinates.coordinates[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-800 mt-1.5"
                >
                  <Navigation className="w-3 h-3" />View on Map
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AvailabilityTab({ doctor }) {
  const avail = Array.isArray(doctor.availability) ? doctor.availability : []
  const allCoveredDays = new Set(avail.flatMap(s => s.workingDays || []))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          Consultation Schedules
        </h3>
        <span className="text-sm font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
          {avail.length} schedule{avail.length !== 1 ? 's' : ''}
        </span>
      </div>

      {avail.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 border border-slate-100 text-center text-slate-400">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-8 h-8 opacity-30" />
          </div>
          <p className="font-semibold">No availability set yet.</p>
        </div>
      ) : (
        avail.map((slot, i) => <ScheduleCard key={i} slot={slot} index={i} />)
      )}

      {avail.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Weekly Coverage</p>
          <div className="flex flex-wrap gap-2">
            {ORDERED_DAYS.map(day => (
              <span key={day} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${allCoveredDays.has(day) ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-300 line-through'}`}>
                {day.slice(0, 3)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
