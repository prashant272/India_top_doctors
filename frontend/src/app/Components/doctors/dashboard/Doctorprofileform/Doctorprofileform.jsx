'use client'

import { useState, useContext, useRef, useEffect, useCallback } from 'react'
import { AuthContext } from '@/app/context/AuthContext'
import {
  User, Mail, Phone, Calendar, Stethoscope, GraduationCap,
  Briefcase, FileText, IndianRupee, Clock, CheckSquare, Camera,
  Save, Loader2, ShieldCheck, AlertCircle, Check,
  MapPin, Building2, Globe, Hash, Navigation, Video, UserCheck,
  Plus, Trash2, Search, X, BadgeCheck, LinkIcon, ChevronDown,
  History, LogIn, LogOut, Share2,
} from 'lucide-react'
import { useDoctors } from '@/app/hooks/useDoctors'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const SPECIALIZATIONS = [
  'Neurologist', 'Cardiologist', 'Dermatologist', 'Orthopedic', 'Pediatrician',
  'Gynecologist', 'Psychiatrist', 'Oncologist', 'Radiologist', 'General Physician',
  'ENT Specialist', 'Ophthalmologist', 'Endocrinologist', 'Nephrologist', 'Urologist', 'Pulmonologist',
]
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say']
const SLOT_DURATIONS = [15, 20, 30, 45, 60]
const CONSULTATION_MODES = [
  { value: 'online',  label: 'Online Only',   icon: Video,       desc: 'Video & chat'       },
  { value: 'offline', label: 'In-Person Only', icon: UserCheck,   desc: 'Clinic visits'      },
  { value: 'both',    label: 'Both',           icon: CheckSquare, desc: 'Online & In-Person'  },
]
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh',
  'Andaman & Nicobar Islands', 'Chandigarh', 'Dadra & Nagar Haveli', 'Daman & Diu',
  'Lakshadweep', 'Puducherry',
]

const SOCIAL_LINKS_CONFIG = [
  {
    key: 'facebook',
    label: 'Facebook',
    placeholder: 'https://facebook.com/yourprofile',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 15, height: 15 }}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    key: 'instagram',
    label: 'Instagram',
    placeholder: 'https://instagram.com/yourhandle',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    border: 'border-pink-100',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: 'youtube',
    label: 'YouTube',
    placeholder: 'https://youtube.com/@yourchannel',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-100',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 15, height: 15 }}>
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    ),
  },
  {
    key: 'x',
    label: 'X (Twitter)',
    placeholder: 'https://x.com/yourhandle',
    color: 'text-slate-800',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 15, height: 15 }}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/in/yourprofile',
    color: 'text-sky-700',
    bg: 'bg-sky-50',
    border: 'border-sky-100',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 15, height: 15 }}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    key: 'threads',
    label: 'Threads',
    placeholder: 'https://threads.net/@yourhandle',
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 15, height: 15 }}>
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.474 12.01v-.017c.03-3.579.882-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-.504-1.865-1.426-3.354-2.74-4.426-1.426-1.155-3.34-1.744-5.69-1.76-2.96.02-5.252.901-6.813 2.62-1.48 1.625-2.24 4.074-2.263 7.278.024 3.202.783 5.652 2.262 7.279 1.561 1.719 3.853 2.6 6.814 2.62 1.935-.018 3.682-.395 5.19-1.22 1.568-.855 2.447-2.116 2.683-3.85a5.989 5.989 0 0 0 .083-1.003c0-.988-.246-1.795-.73-2.4-.443-.556-1.062-.902-1.84-1.033.108.616.16 1.212.156 1.779-.014 1.64-.487 2.918-1.406 3.798-.85.814-2.01 1.23-3.449 1.24-1.27-.008-2.318-.363-3.114-1.054a3.592 3.592 0 0 1-1.26-2.802c.012-1.195.465-2.168 1.344-2.892.895-.736 2.156-1.124 3.75-1.152.774-.014 1.487.043 2.127.17a5.7 5.7 0 0 0-.136-1.14c-.217-.968-.75-1.437-1.63-1.437h-.045c-.67.005-1.154.222-1.48.663-.28.378-.428.905-.44 1.564l-2.061-.04c.024-1.106.31-2.016.851-2.703.637-.81 1.59-1.237 2.83-1.247h.068c1.57.015 2.728.658 3.344 1.862.453.883.638 1.953.549 3.18a8.044 8.044 0 0 1 1.553.645c1.068.652 1.75 1.61 2.026 2.848.108.49.162.996.162 1.504 0 .43-.036.853-.106 1.258-.37 2.432-1.655 4.226-3.817 5.332-1.85.958-4.038 1.445-6.504 1.463z" />
      </svg>
    ),
  },
  {
    key: 'website',
    label: 'Personal Website',
    placeholder: 'https://yourwebsite.com',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    icon: () => <Globe style={{ width: 15, height: 15 }} />,
  },
]

const makeEmptySlot = () => ({
  workingDays: [],
  startTime: '09:00',
  endTime: '17:00',
  slotDuration: 30,
  consultationMode: 'offline',
  location: {
    clinicName: '', addressLine: '', city: '', state: '',
    country: 'India', pincode: '',
    coordinates: { type: 'Point', coordinates: [] },
  },
})

const makeEmptySocialLinks = () => ({
  facebook: '', instagram: '', youtube: '', x: '', linkedin: '', threads: '', website: '',
})

const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function FieldLabel({ children, required }) {
  return (
    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.12em] mb-1.5">
      {children}{required && <span className="text-rose-500 ml-1">*</span>}
    </label>
  )
}

function InputField({ icon: Icon, error, className = '', ...props }) {
  return (
    <div>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" style={{ width: 15, height: 15 }} />}
        <input
          className={`w-full ${Icon ? 'pl-9' : 'pl-4'} pr-4 py-2.5 bg-slate-50 border rounded-2xl text-sm text-slate-800 font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 ${error ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400' : 'border-slate-200 focus:ring-slate-900/10 focus:border-slate-400'} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-[11px] text-rose-500 font-semibold">{error}</p>}
    </div>
  )
}

function SelectField({ icon: Icon, children, error, ...props }) {
  return (
    <div>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none z-10" style={{ width: 15, height: 15 }} />}
        <select
          className={`w-full ${Icon ? 'pl-9' : 'pl-4'} pr-4 py-2.5 bg-slate-50 border rounded-2xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 appearance-none cursor-pointer ${error ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400' : 'border-slate-200 focus:ring-slate-900/10 focus:border-slate-400'}`}
          {...props}
        >
          {children}
        </select>
      </div>
      {error && <p className="mt-1 text-[11px] text-rose-500 font-semibold">{error}</p>}
    </div>
  )
}

function SectionCard({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20 flex-shrink-0">
          <Icon className="text-white" style={{ width: 16, height: 16 }} />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.08em]">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-400 font-medium mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function AffiliatedHospitalPicker({ affiliatedHospitals, onSelect }) {
  const [open, setOpen] = useState(false)
  if (!affiliatedHospitals?.length) return null
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 px-3 py-2 text-[11px] font-black text-teal-700 bg-teal-50 hover:bg-teal-100 border-2 border-teal-200 hover:border-teal-400 rounded-xl transition-all duration-200"
      >
        <Building2 style={{ width: 12, height: 12 }} />
        Fill from Affiliated Hospital
        <ChevronDown style={{ width: 11, height: 11 }} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-72 bg-white border-2 border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden">
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Select Hospital to Autofill</p>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {affiliatedHospitals.map(h => (
              <button
                key={h._id}
                type="button"
                onClick={() => { onSelect(h); setOpen(false) }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-teal-50 transition-colors text-left border-b border-slate-50 last:border-0"
              >
                <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center shrink-0 border border-teal-100">
                  {h.logo?.url
                    ? <img src={h.logo.url} alt={h.name} className="w-full h-full object-cover rounded-lg" />
                    : <Building2 className="text-teal-600" style={{ width: 13, height: 13 }} />
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-800 truncate">{h.name}</p>
                  {(h.address?.city || h.address?.state) && (
                    <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin style={{ width: 9, height: 9 }} />
                      {[h.address.city, h.address.state].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AvailabilitySlot({ slot, index, total, errors, onFieldChange, onRemove, affiliatedHospitals }) {
  const [detectingLocation, setDetectingLocation] = useState(false)

  const setSlotField = useCallback((field, value) => onFieldChange(index, field, value), [index, onFieldChange])
  const setLocField  = useCallback((field, value) => onFieldChange(index, '__location__', { field, value }), [index, onFieldChange])
  const setCoord     = useCallback((axis, value)  => onFieldChange(index, '__coord__', { axis, value }), [index, onFieldChange])
  const toggleDay    = useCallback((day)           => onFieldChange(index, '__toggleDay__', day), [index, onFieldChange])

  const autofillFromHospital = useCallback((hospital) => {
    const addr = hospital.address || {}
    onFieldChange(index, '__location__', { field: 'clinicName',  value: hospital.name  || '' })
    onFieldChange(index, '__location__', { field: 'addressLine', value: addr.street    || '' })
    onFieldChange(index, '__location__', { field: 'city',        value: addr.city      || '' })
    onFieldChange(index, '__location__', { field: 'state',       value: addr.state     || '' })
    onFieldChange(index, '__location__', { field: 'country',     value: addr.country   || 'India' })
    onFieldChange(index, '__location__', { field: 'pincode',     value: addr.pincode   || '' })
  }, [index, onFieldChange])

  const detectLocation = () => {
    if (!navigator.geolocation) return
    setDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onFieldChange(index, '__detectLocation__', { longitude: coords.longitude, latitude: coords.latitude })
        setDetectingLocation(false)
      },
      () => setDetectingLocation(false)
    )
  }

  const coords = slot.location?.coordinates?.coordinates || []
  const [coordLng, coordLat] = coords

  const slotsPerDay = (() => {
    const [sh, sm] = slot.startTime.split(':').map(Number)
    const [eh, em] = slot.endTime.split(':').map(Number)
    const t = eh * 60 + em - (sh * 60 + sm)
    return t > 0 ? Math.floor(t / slot.slotDuration) : 0
  })()

  const errKey = (field) => errors[`availability.${index}.${field}`]

  return (
    <div className="border-2 border-slate-100 rounded-3xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black">{index + 1}</span>
          <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Schedule {index + 1}
            {slot.workingDays.length > 0 && (
              <span className="ml-2 text-slate-400 normal-case font-semibold">
                — {slot.workingDays.map(d => d.slice(0, 3)).join(', ')}
              </span>
            )}
          </p>
        </div>
        {total > 1 && (
          <button type="button" onClick={onRemove} className="flex items-center gap-1.5 text-[11px] font-black text-rose-500 uppercase tracking-wider hover:text-rose-700 transition">
            <Trash2 style={{ width: 12, height: 12 }} /> Remove
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">
        <div>
          <FieldLabel required>Working Days</FieldLabel>
          <div className="flex flex-wrap gap-2 mt-1">
            {DAYS.map(day => {
              const active = slot.workingDays.includes(day)
              return (
                <button key={day} type="button" onClick={() => toggleDay(day)}
                  className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider border-2 transition-all duration-200 ${active ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-600'}`}
                >
                  {active && <Check className="inline mr-1" style={{ width: 11, height: 11 }} />}
                  {day.slice(0, 3)}
                </button>
              )
            })}
          </div>
          {errKey('workingDays') && (
            <p className="mt-2 text-[11px] text-rose-500 font-semibold flex items-center gap-1">
              <AlertCircle style={{ width: 11, height: 11 }} />{errKey('workingDays')}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <FieldLabel>Start Time</FieldLabel>
            <InputField icon={Clock} type="time" value={slot.startTime} onChange={e => setSlotField('startTime', e.target.value)} />
          </div>
          <div>
            <FieldLabel>End Time</FieldLabel>
            <InputField icon={Clock} type="time" value={slot.endTime} onChange={e => setSlotField('endTime', e.target.value)} />
          </div>
          <div>
            <FieldLabel>Slot Duration</FieldLabel>
            <SelectField value={slot.slotDuration} onChange={e => setSlotField('slotDuration', Number(e.target.value))}>
              {SLOT_DURATIONS.map(d => <option key={d} value={d}>{d} minutes</option>)}
            </SelectField>
          </div>
        </div>

        <div>
          <FieldLabel>Consultation Mode</FieldLabel>
          <div className="grid grid-cols-3 gap-3 mt-1">
            {CONSULTATION_MODES.map(({ value, label, icon: Icon, desc }) => {
              const active = slot.consultationMode === value
              return (
                <button key={value} type="button" onClick={() => setSlotField('consultationMode', value)}
                  className={`flex flex-col items-start gap-1.5 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${active ? 'bg-slate-900 border-slate-900 shadow-lg shadow-slate-900/20' : 'bg-slate-50 border-slate-200 hover:border-slate-400'}`}
                >
                  <Icon className={active ? 'text-white' : 'text-slate-400'} style={{ width: 18, height: 18 }} />
                  <p className={`text-xs font-black uppercase tracking-wider ${active ? 'text-white' : 'text-slate-700'}`}>{label}</p>
                  <p className={`text-[10px] font-medium ${active ? 'text-slate-300' : 'text-slate-400'}`}>{desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-slate-50/70 rounded-2xl border border-slate-100 p-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.12em] flex items-center gap-1.5">
              <MapPin style={{ width: 11, height: 11 }} /> Location for this schedule
            </p>
            <AffiliatedHospitalPicker affiliatedHospitals={affiliatedHospitals} onSelect={autofillFromHospital} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <FieldLabel>Clinic / Hospital Name</FieldLabel>
              <InputField icon={Building2} placeholder="e.g. Apollo Clinic" value={slot.location.clinicName} onChange={e => setLocField('clinicName', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Address Line</FieldLabel>
              <InputField icon={MapPin} placeholder="Street, Area, Landmark" value={slot.location.addressLine} onChange={e => setLocField('addressLine', e.target.value)} />
            </div>
            <div>
              <FieldLabel>City</FieldLabel>
              <InputField icon={Building2} placeholder="e.g. Mumbai" value={slot.location.city} onChange={e => setLocField('city', e.target.value)} />
            </div>
            <div>
              <FieldLabel>State</FieldLabel>
              <SelectField value={slot.location.state} onChange={e => setLocField('state', e.target.value)}>
                <option value="">Select state</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </SelectField>
            </div>
            <div>
              <FieldLabel>Country</FieldLabel>
              <InputField icon={Globe} placeholder="India" value={slot.location.country} onChange={e => setLocField('country', e.target.value)} />
            </div>
            <div>
              <FieldLabel>Pincode</FieldLabel>
              <InputField icon={Hash} type="text" inputMode="numeric" maxLength={6} placeholder="e.g. 400001" value={slot.location.pincode} onChange={e => setLocField('pincode', e.target.value)} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <FieldLabel>GPS Coordinates <span className="normal-case font-medium text-slate-400">(optional)</span></FieldLabel>
              <button type="button" onClick={detectLocation} disabled={detectingLocation}
                className="flex items-center gap-1.5 text-[11px] font-black text-teal-600 uppercase tracking-wider hover:text-teal-800 transition disabled:opacity-50"
              >
                {detectingLocation ? <Loader2 className="animate-spin" style={{ width: 12, height: 12 }} /> : <Navigation style={{ width: 12, height: 12 }} />}
                {detectingLocation ? 'Detecting...' : 'Use My Location'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Latitude</p>
                <InputField placeholder="e.g. 19.0760" type="number" step="any" value={coordLat ?? ''} onChange={e => setCoord('lat', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Longitude</p>
                <InputField placeholder="e.g. 72.8777" type="number" step="any" value={coordLng ?? ''} onChange={e => setCoord('lng', parseFloat(e.target.value) || 0)} />
              </div>
            </div>
            {coordLat && coordLng && (
              <div className="mt-2 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-teal-700 font-medium">
                <Navigation style={{ width: 12, height: 12 }} className="flex-shrink-0" />
                {Number(coordLat).toFixed(5)}°N, {Number(coordLng).toFixed(5)}°E
                <a href={`https://maps.google.com/?q=${coordLat},${coordLng}`} target="_blank" rel="noopener noreferrer"
                  className="ml-auto text-teal-500 hover:text-teal-700 underline text-[10px] font-bold uppercase tracking-wider">
                  View on Map ↗
                </a>
              </div>
            )}
          </div>
        </div>

        {slot.startTime && slot.endTime && slot.workingDays.length > 0 && (
          <div className="bg-slate-50 rounded-2xl border border-slate-100 px-4 py-3 flex items-center gap-3">
            <CheckSquare className="text-emerald-500 flex-shrink-0" style={{ width: 16, height: 16 }} />
            <p className="text-xs font-bold text-slate-600">
              {slot.workingDays.map(d => d.slice(0, 3)).join(', ')}
              &nbsp;·&nbsp;{slot.startTime} – {slot.endTime}
              &nbsp;·&nbsp;{slot.slotDuration} min slots
              {slotsPerDay > 0 && <span className="text-rose-500"> ({slotsPerDay} slots/day)</span>}
              &nbsp;·&nbsp;
              <span className="capitalize text-teal-600">{slot.consultationMode}</span>
              {slot.location.city && <span className="text-slate-400"> · {slot.location.city}</span>}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function HospitalLinkSection({ doctorId, hospitalAffiliations = [] }) {
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [linkedHospitals, setLinkedHospitals] = useState([])
  const [searching, setSearching] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [notify, setNotify] = useState(null)
  const [hydrated, setHydrated] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const debounceRef = useRef(null)

  const { addHospitalAffiliation, removeHospitalAffiliation, searchHospitals, getAffiliationHistory } = useDoctors()

  const currentAffiliations = hospitalAffiliations.filter(a => a.isCurrent)
  const pastAffiliations    = hospitalAffiliations.filter(a => !a.isCurrent && a.leftAt)

  useEffect(() => {
    if (!doctorId) return
    const load = async () => {
      const { status, data } = await getAffiliationHistory()
      if (status === 200 && data?.current) {
        setLinkedHospitals(data.current.map(a => a.hospital).filter(Boolean))
      }
      setHydrated(true)
    }
    load()
  }, [doctorId])

  const showNotify = (msg, type = 'success') => {
    setNotify({ msg, type })
    setTimeout(() => setNotify(null), 3500)
  }

  const handleSearch = (value) => {
    setSearch(value)
    if (!value.trim()) { setSearchResults([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const { data } = await searchHospitals(value)
      setSearchResults(data?.hospitals || [])
      setSearching(false)
    }, 400)
  }

  const isLinked = (hospitalId) => linkedHospitals.some(h => h._id === hospitalId)

  const handleAdd = async (hospital) => {
    setActionLoading(hospital._id)
    const { status, data } = await addHospitalAffiliation(hospital._id)
    if (status === 200) {
      setLinkedHospitals(prev => [...prev, hospital])
      showNotify(`Added to ${hospital.name}`)
      setSearch('')
      setSearchResults([])
    } else {
      showNotify(data?.msg || 'Failed to add', 'error')
    }
    setActionLoading(null)
  }

  const handleRemove = async (hospital) => {
    setActionLoading(hospital._id)
    const { status, data } = await removeHospitalAffiliation(hospital._id)
    if (status === 200) {
      setLinkedHospitals(prev => prev.filter(h => h._id !== hospital._id))
      showNotify(`Removed from ${hospital.name}`)
    } else {
      showNotify(data?.msg || 'Failed to remove', 'error')
    }
    setActionLoading(null)
  }

  const affiliationCount = currentAffiliations.length || linkedHospitals.length
  const subtitle = !hydrated
    ? 'Loading...'
    : affiliationCount > 0
      ? `Linked to ${affiliationCount} hospital${affiliationCount !== 1 ? 's' : ''}`
      : 'Search and link your hospitals'

  return (
    <SectionCard title="Hospital Affiliation" subtitle={subtitle} icon={Building2}>
      <div className="space-y-4">
        {notify && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold ${notify.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            {notify.type === 'error' ? <AlertCircle style={{ width: 13, height: 13 }} /> : <Check style={{ width: 13, height: 13 }} />}
            {notify.msg}
          </div>
        )}

        {!hydrated ? (
          <div className="flex items-center justify-center py-6 text-slate-400">
            <Loader2 className="animate-spin mr-2" style={{ width: 16, height: 16 }} />
            <span className="text-xs font-semibold">Loading affiliations...</span>
          </div>
        ) : linkedHospitals.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.12em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Currently Linked
            </p>
            {linkedHospitals.map(h => (
              <div key={h._id} className="flex items-center justify-between p-3 bg-emerald-50 border-2 border-emerald-100 rounded-2xl">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
                    {h.logo?.url
                      ? <img src={h.logo.url} alt={h.name} className="w-full h-full object-cover rounded-xl" />
                      : <Building2 className="text-emerald-600" style={{ width: 16, height: 16 }} />
                    }
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-black text-slate-800 truncate">{h.name}</p>
                      {h.isVerified && <BadgeCheck className="text-teal-500 shrink-0" style={{ width: 13, height: 13 }} />}
                    </div>
                    {(h.address?.city || h.address?.state) && (
                      <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                        <MapPin style={{ width: 10, height: 10 }} />
                        {[h.address?.city, h.address?.state].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {currentAffiliations.find(a => a.hospital?._id === h._id || a.hospital === h._id)?.joinedAt && (
                      <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                        <LogIn style={{ width: 9, height: 9 }} />
                        Joined {formatDate(currentAffiliations.find(a => a.hospital?._id === h._id || a.hospital === h._id)?.joinedAt)}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(h)}
                  disabled={actionLoading === h._id}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black text-rose-600 bg-white hover:bg-rose-600 hover:text-white border-2 border-rose-200 hover:border-rose-600 rounded-xl transition-all duration-200 disabled:opacity-50 ml-2"
                >
                  {actionLoading === h._id ? <Loader2 className="animate-spin" style={{ width: 11, height: 11 }} /> : <X style={{ width: 11, height: 11 }} />}
                  Unlink
                </button>
              </div>
            ))}
          </div>
        )}

        {pastAffiliations.length > 0 && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowHistory(p => !p)}
              className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-[0.12em] hover:text-slate-700 transition-colors"
            >
              <History style={{ width: 12, height: 12 }} />
              Past Affiliations ({pastAffiliations.length})
              <ChevronDown style={{ width: 12, height: 12 }} className={`transition-transform duration-200 ${showHistory ? 'rotate-180' : ''}`} />
            </button>
            {showHistory && (
              <div className="space-y-2">
                {pastAffiliations.map(a => (
                  <div key={a._id} className="flex items-start gap-3 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl">
                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shrink-0 border border-slate-200 shadow-sm mt-0.5">
                      {a.hospital?.logo?.url
                        ? <img src={a.hospital.logo.url} alt={a.hospitalName} className="w-full h-full object-cover rounded-xl" />
                        : <Building2 className="text-slate-400" style={{ width: 14, height: 14 }} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <p className="text-sm font-black text-slate-700 truncate">{a.hospitalName}</p>
                        {a.hospital?.isVerified && (
                          <BadgeCheck className="text-teal-400 shrink-0" style={{ width: 12, height: 12 }} />
                        )}
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded-full">Past</span>
                      </div>
                      {(a.hospital?.address?.city || a.hospital?.address?.state) && (
                        <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mb-1.5">
                          <MapPin style={{ width: 9, height: 9 }} />
                          {[a.hospital.address.city, a.hospital.address.state].filter(Boolean).join(', ')}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3">
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                          <LogIn style={{ width: 9, height: 9 }} className="text-emerald-500" />
                          Joined {formatDate(a.joinedAt)}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                          <LogOut style={{ width: 9, height: 9 }} className="text-rose-400" />
                          Left {formatDate(a.leftAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.12em] mb-2">Search & Add Hospital</p>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" style={{ width: 15, height: 15 }} />
            <input
              type="text"
              placeholder="Type hospital name or city..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm text-slate-800 font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white transition-all"
            />
            {search && (
              <button type="button" onClick={() => { setSearch(''); setSearchResults([]) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                <X style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>
        </div>

        {search.trim() && (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {searching ? (
              <div className="flex items-center justify-center py-6 text-slate-400">
                <Loader2 className="animate-spin mr-2" style={{ width: 16, height: 16 }} />
                <span className="text-xs font-semibold">Searching...</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <Building2 className="mx-auto mb-2 opacity-20" style={{ width: 28, height: 28 }} />
                <p className="text-xs font-semibold">No hospitals found for "{search}"</p>
              </div>
            ) : (
              searchResults.map(h => {
                const linked  = isLinked(h._id)
                const loadingH = actionLoading === h._id
                return (
                  <div key={h._id} className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${linked ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white'}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
                        {h.logo?.url
                          ? <img src={h.logo.url} alt={h.name} className="w-full h-full object-cover rounded-xl" />
                          : <Building2 className="text-slate-400" style={{ width: 16, height: 16 }} />
                        }
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-black text-slate-800 truncate">{h.name}</p>
                          {h.isVerified && <BadgeCheck className="text-teal-500 shrink-0" style={{ width: 13, height: 13 }} />}
                          {!h.isActive && <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">Inactive</span>}
                        </div>
                        {h.address?.city && (
                          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                            <MapPin style={{ width: 10, height: 10 }} />
                            {[h.address.city, h.address.state].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => !linked && handleAdd(h)}
                      disabled={loadingH || linked}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black rounded-xl border-2 transition-all duration-200 disabled:opacity-50 ml-2 ${linked ? 'text-emerald-600 bg-emerald-50 border-emerald-200 cursor-default' : 'text-slate-700 bg-white hover:bg-slate-900 hover:text-white border-slate-200 hover:border-slate-900'}`}
                    >
                      {loadingH
                        ? <Loader2 className="animate-spin" style={{ width: 11, height: 11 }} />
                        : linked
                          ? <><Check style={{ width: 11, height: 11 }} /> Added</>
                          : <><LinkIcon style={{ width: 11, height: 11 }} /> Add</>
                      }
                    </button>
                  </div>
                )
              })
            )}
          </div>
        )}

        {!search.trim() && hydrated && linkedHospitals.length === 0 && (
          <p className="text-[11px] text-slate-400 font-semibold text-center py-2">
            Start typing to find and link a hospital
          </p>
        )}
      </div>
    </SectionCard>
  )
}

export default function DoctorProfileForm() {
  const { UserAuthData } = useContext(AuthContext)
  const { updateDoctorProfile, getDoctorProfile, loading } = useDoctors()

  const [basicInfo, setBasicInfoState] = useState({
    fullName: '', email: '', phone: '', gender: '', dob: '', profileImage: '',
  })
  const [professionalInfo, setProfessionalInfoState] = useState({
    specialization: '', qualification: '', experience: '', licenseNumber: '', consultationFee: '',
  })
  const [socialLinks, setSocialLinksState] = useState(makeEmptySocialLinks())
  const [availability, setAvailability] = useState(() => [makeEmptySlot()])
  const [affiliatedHospitals, setAffiliatedHospitals] = useState([])
  const [hospitalAffiliations, setHospitalAffiliations] = useState([])
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profileFetched, setProfileFetched] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const fileRef = useRef(null)

  const { getAffiliationHistory } = useDoctors()

  useEffect(() => {
    if (!UserAuthData?.userId) return
    const fetchProfile = async () => {
      const { status, data } = await getDoctorProfile(UserAuthData.userId)
      if (status === 200 && data?.doctor) {
        const d = data.doctor
        setBasicInfoState({
          fullName: d.basicInfo?.fullName || '',
          email: d.basicInfo?.email || '',
          phone: d.basicInfo?.phone || '',
          gender: d.basicInfo?.gender || '',
          dob: d.basicInfo?.dob ? d.basicInfo.dob.split('T')[0] : '',
          profileImage: d.basicInfo?.profileImage || '',
        })
        setProfessionalInfoState({
          specialization: d.professionalInfo?.specialization || '',
          qualification: d.professionalInfo?.qualification || '',
          experience: String(d.professionalInfo?.experience || ''),
          licenseNumber: d.professionalInfo?.licenseNumber || '',
          consultationFee: String(d.professionalInfo?.consultationFee || ''),
        })
        setSocialLinksState({
          facebook:  d.basicInfo?.socialLinks?.facebook  || '',
          instagram: d.basicInfo?.socialLinks?.instagram || '',
          youtube:   d.basicInfo?.socialLinks?.youtube   || '',
          x:         d.basicInfo?.socialLinks?.x         || '',
          linkedin:  d.basicInfo?.socialLinks?.linkedin  || '',
          threads:   d.basicInfo?.socialLinks?.threads   || '',
          website:   d.basicInfo?.socialLinks?.website   || '',
        })
        if (Array.isArray(d.availability) && d.availability.length > 0) {
          setAvailability(d.availability.map(av => ({
            workingDays: av.workingDays || [],
            startTime: av.startTime || '09:00',
            endTime: av.endTime || '17:00',
            slotDuration: av.slotDuration || 30,
            consultationMode: av.consultationMode || 'offline',
            location: {
              clinicName: av.location?.clinicName || '',
              addressLine: av.location?.addressLine || '',
              city: av.location?.city || '',
              state: av.location?.state || '',
              country: av.location?.country || 'India',
              pincode: av.location?.pincode || '',
              coordinates: av.location?.coordinates || { type: 'Point', coordinates: [] },
            },
          })))
        }
        if (Array.isArray(d.hospitalAffiliations)) {
          setHospitalAffiliations(d.hospitalAffiliations)
        }
        setImagePreview(d.basicInfo?.profileImage || '')
      }
      setProfileFetched(true)
    }
    fetchProfile()
  }, [UserAuthData?.userId, getDoctorProfile])

  useEffect(() => {
    if (!UserAuthData?.userId) return
    const loadAffiliations = async () => {
      const { status, data } = await getAffiliationHistory()
      if (status === 200 && data?.current) {
        setAffiliatedHospitals(data.current.map(a => a.hospital).filter(Boolean))
      }
    }
    loadAffiliations()
  }, [UserAuthData?.userId])

  const setBasicField = (field, value) => {
    setBasicInfoState(prev => ({ ...prev, [field]: value }))
    setErrors(prev => { const n = { ...prev }; delete n[`basicInfo.${field}`]; return n })
  }

  const setProfField = (field, value) => {
    setProfessionalInfoState(prev => ({ ...prev, [field]: value }))
    setErrors(prev => { const n = { ...prev }; delete n[`professionalInfo.${field}`]; return n })
  }

  const setSocialField = (key, value) => {
    setSocialLinksState(prev => ({ ...prev, [key]: value }))
  }

  const handleSlotFieldChange = useCallback((index, field, value) => {
    setAvailability(prev => prev.map((s, i) => {
      if (i !== index) return s
      if (field === '__location__')      return { ...s, location: { ...s.location, [value.field]: value.value } }
      if (field === '__coord__') {
        const existing = s.location.coordinates?.coordinates || []
        const lng = value.axis === 'lng' ? value.value : (existing[0] ?? 0)
        const lat = value.axis === 'lat' ? value.value : (existing[1] ?? 0)
        return { ...s, location: { ...s.location, coordinates: { type: 'Point', coordinates: [lng, lat] } } }
      }
      if (field === '__toggleDay__') {
        const days = s.workingDays
        return { ...s, workingDays: days.includes(value) ? days.filter(d => d !== value) : [...days, value] }
      }
      if (field === '__detectLocation__') {
        return { ...s, location: { ...s.location, coordinates: { type: 'Point', coordinates: [value.longitude, value.latitude] } } }
      }
      return { ...s, [field]: value }
    }))
    setErrors(prev => {
      const n = { ...prev }
      Object.keys(n).forEach(k => { if (k.startsWith(`availability.${index}.`)) delete n[k] })
      return n
    })
  }, [])

  const addSlot    = () => setAvailability(prev => [...prev, makeEmptySlot()])
  const removeSlot = (index) => setAvailability(prev => prev.filter((_, i) => i !== index))

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
      setBasicField('profileImage', reader.result)
    }
    reader.readAsDataURL(file)
  }

  const validate = () => {
    const errs = {}
    if (!basicInfo.fullName.trim()) errs['basicInfo.fullName'] = 'Full name is required'
    if (!basicInfo.email.trim())    errs['basicInfo.email']    = 'Email is required'
    if (!professionalInfo.specialization) errs['professionalInfo.specialization'] = 'Specialization is required'
    availability.forEach((slot, i) => {
      if (!slot.workingDays.length) errs[`availability.${i}.workingDays`] = 'Select at least one working day'
      if (!slot.startTime)          errs[`availability.${i}.startTime`]   = 'Start time required'
      if (!slot.endTime)            errs[`availability.${i}.endTime`]     = 'End time required'
    })
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      const body = {
        basicInfo: {
          ...basicInfo,
          socialLinks: { ...socialLinks },
        },
        professionalInfo: {
          ...professionalInfo,
          experience: Number(professionalInfo.experience),
          consultationFee: Number(professionalInfo.consultationFee),
        },
        availability: availability.map(slot => {
          const hasCoords = slot.location.coordinates?.coordinates?.length === 2
          return {
            workingDays: slot.workingDays,
            startTime: slot.startTime,
            endTime: slot.endTime,
            slotDuration: slot.slotDuration,
            consultationMode: slot.consultationMode,
            location: {
              clinicName: slot.location.clinicName,
              addressLine: slot.location.addressLine,
              city: slot.location.city,
              state: slot.location.state,
              country: slot.location.country,
              pincode: slot.location.pincode,
              ...(hasCoords && { coordinates: slot.location.coordinates }),
            },
          }
        }),
      }
      await updateDoctorProfile(UserAuthData.userId, body)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const initials = basicInfo.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  if (loading && !profileFetched) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-slate-400" style={{ width: 32, height: 32 }} />
          <p className="text-sm font-semibold text-slate-400">Loading profile...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <SectionCard title="Basic Information" subtitle="Your personal details" icon={User}>
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-rose-100 to-rose-200 ring-4 ring-slate-100 flex items-center justify-center overflow-hidden shadow-lg">
                  {imagePreview
                    ? <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" onError={() => setImagePreview('')} />
                    : <span className="text-3xl font-black text-rose-500">{initials || '?'}</span>
                  }
                </div>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg hover:bg-slate-700 transition-colors">
                  <Camera className="text-white" style={{ width: 13, height: 13 }} />
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Profile Photo</p>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <FieldLabel required>Full Name</FieldLabel>
                <InputField icon={User} placeholder="Dr. Priya Sharma" value={basicInfo.fullName} onChange={e => setBasicField('fullName', e.target.value)} error={errors['basicInfo.fullName']} />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel required>Email Address</FieldLabel>
                <InputField icon={Mail} type="email" placeholder="doctor@example.com" value={basicInfo.email} onChange={e => setBasicField('email', e.target.value)} error={errors['basicInfo.email']} readOnly={!!basicInfo.email} className={basicInfo.email ? 'opacity-60 cursor-not-allowed' : ''} />
                {basicInfo.email && (
                  <p className="text-[10px] text-slate-400 font-semibold mt-1 flex items-center gap-1">
                    <ShieldCheck style={{ width: 10, height: 10 }} className="text-emerald-500" /> Verified from your account
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <FieldLabel>Phone</FieldLabel>
              <InputField icon={Phone} type="tel" placeholder="+91 98765 43210" value={basicInfo.phone} onChange={e => setBasicField('phone', e.target.value)} />
            </div>
            <div>
              <FieldLabel>Gender</FieldLabel>
              <SelectField value={basicInfo.gender} onChange={e => setBasicField('gender', e.target.value)}>
                <option value="">Select gender</option>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </SelectField>
            </div>
            <div>
              <FieldLabel>Date of Birth</FieldLabel>
              <InputField icon={Calendar} type="date" value={basicInfo.dob} onChange={e => setBasicField('dob', e.target.value)} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Professional Information" subtitle="Your medical credentials" icon={Stethoscope}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <FieldLabel required>Specialization</FieldLabel>
              <SelectField icon={Stethoscope} value={professionalInfo.specialization} onChange={e => setProfField('specialization', e.target.value)} error={errors['professionalInfo.specialization']}>
                <option value="">Select specialization</option>
                {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </SelectField>
            </div>
            <div>
              <FieldLabel>Qualification</FieldLabel>
              <InputField icon={GraduationCap} placeholder="MBBS, MD, DM..." value={professionalInfo.qualification} onChange={e => setProfField('qualification', e.target.value)} />
            </div>
            <div>
              <FieldLabel>Years of Experience</FieldLabel>
              <InputField icon={Briefcase} type="number" min="0" max="60" placeholder="e.g. 12" value={professionalInfo.experience} onChange={e => setProfField('experience', e.target.value)} />
            </div>
            <div>
              <FieldLabel>License Number</FieldLabel>
              <InputField icon={FileText} placeholder="MCI / State Board number" value={professionalInfo.licenseNumber} onChange={e => setProfField('licenseNumber', e.target.value)} />
            </div>
            <div>
              <FieldLabel>Consultation Fee (₹)</FieldLabel>
              <InputField icon={IndianRupee} type="number" min="0" placeholder="e.g. 800" value={professionalInfo.consultationFee} onChange={e => setProfField('consultationFee', e.target.value)} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Social Links" subtitle="Help patients find you online" icon={Share2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SOCIAL_LINKS_CONFIG.map(({ key, label, placeholder, color, bg, border, icon: PlatformIcon }) => (
              <div key={key}>
                <FieldLabel>{label}</FieldLabel>
                <div className="relative">
                  <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${color} pointer-events-none`}>
                    <PlatformIcon />
                  </div>
                  <input
                    type="url"
                    placeholder={placeholder}
                    value={socialLinks[key]}
                    onChange={e => setSocialField(key, e.target.value)}
                    className={`w-full pl-9 pr-4 py-2.5 ${bg} border ${border} rounded-2xl text-sm text-slate-800 font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white transition-all duration-200`}
                  />
                </div>
                {socialLinks[key] && (
                  <a
                    href={socialLinks[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-1 text-[10px] font-bold ${color} flex items-center gap-1 hover:underline`}
                  >
                    <LinkIcon style={{ width: 9, height: 9 }} /> Preview link ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        <HospitalLinkSection doctorId={UserAuthData?.userId} hospitalAffiliations={hospitalAffiliations} />

        <SectionCard title="Availability" subtitle={`${availability.length} schedule${availability.length !== 1 ? 's' : ''} configured`} icon={Clock}>
          <div className="space-y-4">
            {affiliatedHospitals.length > 0 && (
              <div className="flex items-center gap-2.5 p-3.5 bg-teal-50 border-2 border-teal-100 rounded-2xl">
                <Building2 className="text-teal-600 shrink-0" style={{ width: 15, height: 15 }} />
                <p className="text-xs font-bold text-teal-700">
                  You are affiliated with {affiliatedHospitals.length} hospital{affiliatedHospitals.length !== 1 ? 's' : ''}.
                  Use <span className="font-black">"Fill from Affiliated Hospital"</span> inside any schedule to autofill location.
                </p>
              </div>
            )}

            {availability.map((slot, i) => (
              <AvailabilitySlot
                key={i}
                slot={slot}
                index={i}
                total={availability.length}
                errors={errors}
                onFieldChange={handleSlotFieldChange}
                onRemove={() => removeSlot(i)}
                affiliatedHospitals={affiliatedHospitals}
              />
            ))}

            <button type="button" onClick={addSlot}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl border-2 border-dashed border-slate-200 text-xs font-black text-slate-400 uppercase tracking-wider hover:border-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all duration-200">
              <Plus style={{ width: 14, height: 14 }} /> Add Another Schedule
            </button>
            <p className="text-[10px] text-slate-400 font-semibold text-center">
              Add multiple schedules if you work at different clinics or have separate online / in-person hours.
            </p>
          </div>
        </SectionCard>

        <div className="flex items-center justify-between pt-2 pb-8">
          <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <AlertCircle style={{ width: 12, height: 12 }} />
            Fields marked <span className="text-rose-500 font-black">*</span> are required
          </p>
          <button type="submit" disabled={saving}
            className={`flex items-center gap-2.5 px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-wider transition-all duration-300 shadow-lg ${saved ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-slate-900 text-white hover:bg-slate-700 shadow-slate-900/25 hover:shadow-xl hover:scale-[1.02] active:scale-95'} disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {saving ? <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} /> : saved ? <Check style={{ width: 16, height: 16 }} /> : <Save style={{ width: 16, height: 16 }} />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
          </button>
        </div>

      </form>
    </main>
  )
}
