'use client'

import { useMemo, useContext, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Search, User, Clock, CheckCircle,
  Calendar, Video, ChevronDown, ChevronUp, Stethoscope,
  GraduationCap, BadgeCheck, Wifi, SlidersHorizontal, X,
  MapPin, Zap,
} from 'lucide-react'
import { AuthContext } from '@/app/context/AuthContext'
import { usePatientContext } from '@/app/context/PatientContext'
import { useDoctors } from '@/app/hooks/useDoctors'
import useAppointment from '@/app/hooks/useAppointment'

const initialSearchData = { doctorName: '', specialist: '', state: '', area: '' }
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const SPECIALTIES = ['General Physicians', 'Cardiologist', 'Orthopedic', 'Dermatologist', 'Neurologist', 'Pediatrician']
const STATES = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Pune']
const SPECIALTY_CARDS = [
  { label: 'General Physicians', emoji: '🩺' },
  { label: 'Cardiologist',       emoji: '❤️' },
  { label: 'Orthopedic',         emoji: '🦴' },
  { label: 'Dermatologist',      emoji: '🧴' },
  { label: 'Neurologist',        emoji: '🧠' },
  { label: 'Pediatrician',       emoji: '👶' },
]

function normalizeSpecialist(raw) {
  if (!raw?.trim()) return ''
  const lower = raw.trim().toLowerCase()
  return SPECIALTIES.find(s => s.toLowerCase() === lower)
    || SPECIALTIES.find(s => s.toLowerCase().includes(lower) || lower.includes(s.toLowerCase()))
    || raw.trim()
}

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const display = hour % 12 === 0 ? 12 : hour % 12
  return `${display}:${m} ${ampm}`
}

function DoctorAvatar({ src, name, size = 'md' }) {
  const [imgError, setImgError] = useState(false)
  const sizeClasses = size === 'lg' ? 'w-20 h-20 text-xl' : 'w-16 h-16 text-lg'
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'Dr'
  const colors = ['from-teal-400 to-teal-600', 'from-blue-400 to-blue-600', 'from-violet-400 to-violet-600', 'from-emerald-400 to-emerald-600', 'from-orange-400 to-orange-600']
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0
  if (src && !imgError) {
    return <img src={src} alt={name || 'Doctor'} className={`${sizeClasses} rounded-2xl object-cover`} onError={() => setImgError(true)} />
  }
  return (
    <div className={`${sizeClasses} rounded-2xl bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center font-black text-white`}>
      {initials}
    </div>
  )
}

function FilterPill({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs font-semibold">
      {label}
      <button onClick={onRemove} className="hover:text-teal-900 transition-colors ml-0.5">
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}

function AvailabilityBlock({ availability }) {
  const [expanded, setExpanded] = useState(false)
  if (!Array.isArray(availability) || availability.length === 0) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-xs">
        <Clock className="w-3.5 h-3.5" />
        <span>Availability not listed</span>
      </div>
    )
  }
  const primary = availability[0]
  const hasMore = availability.length > 1
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2 cursor-pointer" onClick={() => hasMore && setExpanded(p => !p)}>
        <Clock className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-700">{formatTime(primary.startTime)} – {formatTime(primary.endTime)}</p>
            {hasMore && (
              <button className="text-teal-500 shrink-0">
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {Array.isArray(primary.workingDays) && primary.workingDays.map(day => (
              <span key={day} className="text-[10px] px-2 py-0.5 bg-teal-50 text-teal-600 border border-teal-100 rounded-md font-semibold">
                {typeof day === 'number' ? DAYS_SHORT[day] : day.slice(0, 3)}
              </span>
            ))}
          </div>
          {primary.location?.address && (
            <p className="text-[10px] text-slate-400 mt-1 truncate flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" />{primary.location.address}
            </p>
          )}
        </div>
      </div>
      {expanded && availability.slice(1).map((slot, i) => (
        <div key={i} className="flex items-start gap-2 pl-5 border-l-2 border-teal-100 ml-1.5">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-700">{formatTime(slot.startTime)} – {formatTime(slot.endTime)}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {Array.isArray(slot.workingDays) && slot.workingDays.map(day => (
                <span key={day} className="text-[10px] px-2 py-0.5 bg-violet-50 text-violet-600 border border-violet-100 rounded-md font-semibold">
                  {typeof day === 'number' ? DAYS_SHORT[day] : day.slice(0, 3)}
                </span>
              ))}
            </div>
            {slot.location?.address && (
              <p className="text-[10px] text-slate-400 mt-1 truncate">📍 {slot.location.address}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function DoctorSearchSection() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { UserAuthData } = useContext(AuthContext)
  const { doctorList, loading } = usePatientContext()
  const { fetchDoctors } = useDoctors()
  const { createAppointment } = useAppointment()

  const rawAddress = UserAuthData?.roleData?.address || ''
  const userCity = rawAddress.split(',')[0].trim().toLowerCase()

  const [searchData, setSearchData] = useState(initialSearchData)
  const [appliedFilters, setAppliedFilters] = useState(initialSearchData)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const doctorName = searchParams.get('doctorName') || ''
    const raw = searchParams.get('specialist') || ''
    const specialist = normalizeSpecialist(raw)
    const state = searchParams.get('state') || ''
    const area = searchParams.get('area') || ''
    const hasAny = doctorName || specialist || state || area
    if (!hasAny) return
    const preset = { doctorName, specialist, state, area }
    setSearchData(preset)
    setAppliedFilters(preset)
    if (state || area) setShowFilters(true)
  }, [searchParams])

  const handleChange = (field) => (e) => setSearchData(prev => ({ ...prev, [field]: e.target.value }))
  const handleApplyFilters = () => setAppliedFilters(searchData)

  const handleClearAll = () => {
    setSearchData(initialSearchData)
    setAppliedFilters(initialSearchData)
    router.replace('/patient/doctors')
  }

  const handleRemoveFilter = (field) => {
    const updated = { ...searchData, [field]: '' }
    setSearchData(updated)
    setAppliedFilters(updated)
    const params = new URLSearchParams(searchParams.toString())
    params.delete(field)
    const qs = params.toString()
    router.replace(`/patient/doctors${qs ? `?${qs}` : ''}`)
  }

  const handleSpecialtyCardClick = (label) => {
    const next = appliedFilters.specialist === label ? '' : label
    const updated = { ...searchData, specialist: next }
    setSearchData(updated)
    setAppliedFilters(updated)
    const params = new URLSearchParams(searchParams.toString())
    if (next) params.set('specialist', next)
    else params.delete('specialist')
    const qs = params.toString()
    router.replace(`/patient/doctors${qs ? `?${qs}` : ''}`)
  }

  const handleBookAppointment = (doctorId) => {
    if (!UserAuthData?.token) { router.push('/auth'); return }
    router.push(`/patient/${doctorId}`)
  }

  const handleViewProfile = (doctorId) => router.push(`/patient/doctors/${doctorId}`)

  const filteredDoctors = useMemo(() => {
    let list = []
    if (Array.isArray(doctorList)) list = doctorList
    else if (doctorList?.DoctorList) list = doctorList.DoctorList
    else if (Array.isArray(doctorList?.data)) list = doctorList.data

    const { doctorName, specialist, state, area } = appliedFilters
    const hasActive = doctorName.trim() || specialist.trim() || state.trim() || area.trim()

    const filtered = hasActive
      ? list.filter(doctor => {
          const matchesName = doctorName ? (doctor.basicInfo?.fullName || doctor.name || '').toLowerCase().includes(doctorName.toLowerCase()) : true
          const docSpec = (doctor.professionalInfo?.specialization || doctor.specialty || '').toLowerCase().trim()
          const filterSpec = specialist.toLowerCase().trim()
          const matchesSpecialist = specialist ? docSpec === filterSpec || docSpec.includes(filterSpec) || filterSpec.includes(docSpec) : true
          const matchesState = state ? (doctor.basicInfo?.state || doctor.state || '').toLowerCase() === state.toLowerCase() : true
          const matchesArea = area ? (doctor.basicInfo?.area || doctor.area || '').toLowerCase().includes(area.toLowerCase()) : true
          return matchesName && matchesSpecialist && matchesState && matchesArea
        })
      : list

    if (!userCity) return filtered
    return [...filtered].sort((a, b) => {
      const aCity = [a.basicInfo?.location, a.basicInfo?.area, a.basicInfo?.state, a.basicInfo?.city].filter(Boolean).join(' ').toLowerCase()
      const bCity = [b.basicInfo?.location, b.basicInfo?.area, b.basicInfo?.state, b.basicInfo?.city].filter(Boolean).join(' ').toLowerCase()
      return (aCity.includes(userCity) ? 0 : 1) - (bCity.includes(userCity) ? 0 : 1)
    })
  }, [doctorList, appliedFilters, userCity])

  const activeFilterCount = Object.values(appliedFilters).filter(v => v.trim()).length
  const hasActiveFilters = activeFilterCount > 0

  return (
    <section className="min-h-screen bg-slate-50">

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">

            <div className="relative flex-1">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search doctor by name..."
                value={searchData.doctorName}
                onChange={handleChange('doctorName')}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:bg-white text-sm transition-all"
              />
            </div>

            <div className="relative flex-1">
              <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={searchData.specialist}
                onChange={handleChange('specialist')}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white appearance-none cursor-pointer text-sm transition-all"
              >
                <option value="">All Specialties</option>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3.5 border rounded-2xl text-sm font-semibold transition-all duration-200 ${
                showFilters
                  ? 'bg-teal-500 border-teal-400 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              onClick={handleApplyFilters}
              className="flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl transition-all duration-200 text-sm shadow-xl shadow-orange-500/30 hover:from-orange-600 hover:to-orange-700 hover:scale-[1.03] active:scale-[0.97]"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 pt-4 border-t border-slate-100">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    value={searchData.state}
                    onChange={handleChange('state')}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white appearance-none cursor-pointer text-sm transition-all"
                  >
                    <option value="">Select State / City</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Area / Locality"
                    value={searchData.area}
                    onChange={handleChange('area')}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white text-sm transition-all"
                  />
                </div>
                <button
                  onClick={handleClearAll}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 bg-rose-50 border border-rose-200 text-rose-500 hover:bg-rose-100 hover:text-rose-600 rounded-2xl text-sm font-semibold transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <p className="text-slate-400 text-xs font-semibold">Quick select:</p>
                {SPECIALTIES.map(s => (
                  <button
                    key={s}
                    onClick={() => setSearchData(prev => ({ ...prev, specialist: prev.specialist === s ? '' : s }))}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 ${
                      searchData.specialist === s
                        ? 'bg-teal-500 border-teal-400 text-white'
                        : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Browse by Specialty</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {SPECIALTY_CARDS.map(({ label, emoji }) => {
              const isActive = appliedFilters.specialist === label
              return (
                <button
                  key={label}
                  onClick={() => handleSpecialtyCardClick(label)}
                  className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-2xl border text-center transition-all duration-200 ${
                    isActive
                      ? 'bg-teal-500 border-teal-400 text-white shadow-lg shadow-teal-500/25 scale-[1.04]'
                      : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 hover:scale-[1.03]'
                  }`}
                >
                  <span className="text-2xl leading-none">{emoji}</span>
                  <span className="text-[11px] font-semibold leading-tight">{label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {loading ? 'Finding doctors...' : `${filteredDoctors.length} Doctor${filteredDoctors.length !== 1 ? 's' : ''} Found`}
            </h2>
            <div className="flex items-center gap-2 text-slate-500 text-sm mt-0.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Verified doctors · Minimum wait-time</span>
            </div>
            {userCity && !hasActiveFilters && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-500" />
                <span className="text-xs text-teal-600 font-semibold capitalize">Showing doctors near {userCity}</span>
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {appliedFilters.doctorName && <FilterPill label={`Name: ${appliedFilters.doctorName}`} onRemove={() => handleRemoveFilter('doctorName')} />}
              {appliedFilters.specialist && <FilterPill label={appliedFilters.specialist} onRemove={() => handleRemoveFilter('specialist')} />}
              {appliedFilters.state && <FilterPill label={appliedFilters.state} onRemove={() => handleRemoveFilter('state')} />}
              {appliedFilters.area && <FilterPill label={`Area: ${appliedFilters.area}`} onRemove={() => handleRemoveFilter('area')} />}
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-xs font-bold hover:bg-rose-100 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear All
              </button>
            </div>
          )}
        </div>

        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
                <div className="p-5 flex gap-4">
                  <div className="w-20 h-20 bg-slate-200 rounded-2xl flex-shrink-0" />
                  <div className="flex-1 space-y-3 pt-1">
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-3 bg-slate-100 rounded w-3/4" />
                    <div className="flex gap-2">
                      <div className="h-5 bg-slate-100 rounded-full w-16" />
                      <div className="h-5 bg-slate-100 rounded-full w-16" />
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-5 space-y-2.5">
                  <div className="h-10 bg-orange-50 rounded-xl" />
                  <div className="h-10 bg-slate-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDoctors.map(doctor => {
              const features = doctor.currentPlan?.features || {}
              const planIsActive = doctor.currentPlan?.isActive === true
              const hasOnlineBooking = planIsActive && features.onlineBooking === true
              const hasOnlineConsult = planIsActive && features.onlineConsultation === true
              const isVerified = planIsActive && features.verifiedBadge === true
              const searchBoost = planIsActive ? (features.searchBoost || 0) : 0
              const name = doctor.basicInfo?.fullName || doctor.name
              const specialty = doctor.professionalInfo?.specialization || doctor.specialty
              const profileImage = doctor.basicInfo?.profileImage
              const doctorCityRaw = [doctor.basicInfo?.location, doctor.basicInfo?.area, doctor.basicInfo?.state, doctor.basicInfo?.city].filter(Boolean).join(' ').toLowerCase()
              const isNearby = userCity && doctorCityRaw.includes(userCity)

              return (
                <div
                  key={doctor._id || doctor.id}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col"
                >
                  <div className="p-5 pb-4">
                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-slate-100 group-hover:ring-teal-200 transition-all duration-300">
                          <DoctorAvatar src={profileImage} name={name} size="lg" />
                        </div>
                        {isVerified && (
                          <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow">
                            <BadgeCheck className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <h3 className="text-base font-bold text-slate-800 truncate leading-tight">{name}</h3>
                          <div className="flex items-center gap-1 shrink-0">
                            {isNearby && (
                              <span className="flex items-center gap-0.5 text-[10px] bg-teal-50 text-teal-600 border border-teal-100 px-2 py-0.5 rounded-full font-semibold">
                                <MapPin className="w-2.5 h-2.5" /> Nearby
                              </span>
                            )}
                            {searchBoost > 0 && (
                              <span className="flex items-center gap-0.5 text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-semibold">
                                <Zap className="w-2.5 h-2.5" /> Top
                              </span>
                            )}
                          </div>
                        </div>

                        {isVerified && (
                          <span className="inline-block text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-semibold mb-1">
                            ✓ Verified
                          </span>
                        )}

                        <div className="flex items-center gap-1 text-teal-600 text-xs font-semibold mt-0.5">
                          <Stethoscope className="w-3 h-3" />
                          {specialty || '—'}
                        </div>

                        <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                          <GraduationCap className="w-3 h-3 shrink-0" />
                          <span className="truncate">{doctor.professionalInfo?.qualification || '—'}</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {hasOnlineConsult && (
                            <span className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-semibold">
                              <Wifi className="w-2.5 h-2.5" /> Online
                            </span>
                          )}
                          {hasOnlineBooking && (
                            <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                              <Calendar className="w-2.5 h-2.5" /> Bookable
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-50">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <Clock className="w-3.5 h-3.5 text-orange-400" />
                        {doctor.professionalInfo?.experience ? `${doctor.professionalInfo.experience} yrs exp` : 'Experience N/A'}
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-medium">Consultation</p>
                        <p className="text-lg font-black text-teal-600">₹{doctor.professionalInfo?.consultationFee || 500}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mx-5 mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Availability</p>
                    <AvailabilityBlock availability={doctor.availability} />
                  </div>

                  <div className="px-5 pb-5 mt-auto space-y-2.5">
                    {hasOnlineBooking ? (
                      <button
                        onClick={() => handleBookAppointment(doctor._id || doctor.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Calendar className="w-4 h-4" />
                        {UserAuthData?.token ? 'Book Appointment' : 'Login to Book'}
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-400 text-xs font-semibold rounded-xl border border-slate-200 cursor-not-allowed select-none">
                        <Calendar className="w-3.5 h-3.5" />
                        Online Booking Unavailable
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProfile(doctor._id || doctor.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-teal-500 text-teal-600 font-semibold text-sm rounded-xl hover:bg-teal-500 hover:text-white transition-all duration-200"
                      >
                        <User className="w-4 h-4" />
                        View Profile
                      </button>
                      {hasOnlineConsult && (
                        <button
                          onClick={() => router.push(`/patient/${doctor._id || doctor.id}`)}
                          title="Online Consultation"
                          className="px-3 py-2.5 border-2 border-blue-500 text-blue-600 font-semibold text-sm rounded-xl hover:bg-blue-500 hover:text-white transition-all duration-200"
                        >
                          <Video className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredDoctors.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-5">
                  <Search className="w-10 h-10 text-teal-300" />
                </div>
                <h3 className="text-slate-700 font-bold text-xl mb-2">No doctors found</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-sm">
                  We couldn't find any doctors matching your search. Try adjusting or clearing your filters.
                </p>
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-bold text-sm rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
