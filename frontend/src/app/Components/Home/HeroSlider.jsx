'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, User, Stethoscope, SlidersHorizontal, X, MapPin,
  Shield, TrendingUp, HeartPulse, BadgeCheck,
} from 'lucide-react'

const STATS = [
  { icon: Shield,     label: 'Verified Doctors', value: '500+'  },
  { icon: TrendingUp, label: 'Appointments',      value: '10K+' },
  { icon: HeartPulse, label: 'Specialties',       value: '20+'  },
  { icon: BadgeCheck, label: 'Cities Covered',    value: '15+'  },
]

const SPECIALTIES = ['General Physicians', 'Cardiologist', 'Orthopedic', 'Dermatologist', 'Neurologist', 'Pediatrician']
const STATES = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Pune']

const SPECIALTY_ICONS = {
  'General Physicians': '🩺',
  'Cardiologist':       '❤️',
  'Orthopedic':         '🦴',
  'Dermatologist':      '🧴',
  'Neurologist':        '🧠',
  'Pediatrician':       '👶',
}

const initialSearch = { doctorName: '', specialist: '', state: '', area: '' }

export default function HeroSlider() {
  const router = useRouter()
  const [searchData, setSearchData] = useState(initialSearch)
  const [showFilters, setShowFilters] = useState(false)

  const handleChange = (field) => (e) => setSearchData(prev => ({ ...prev, [field]: e.target.value }))

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchData.doctorName.trim())  params.set('doctorName', searchData.doctorName.trim())
    if (searchData.specialist.trim())  params.set('specialist', searchData.specialist.trim())
    if (searchData.state.trim())       params.set('state', searchData.state.trim())
    if (searchData.area.trim())        params.set('area', searchData.area.trim())
    const qs = params.toString()
    router.push(`/patient/doctors${qs ? `?${qs}` : ''}`)
  }

  const handleSpecialtyClick = (specialty) => {
    router.push(`/patient/doctors?specialist=${encodeURIComponent(specialty)}`)
  }

  const handleClear = () => setSearchData(initialSearch)

  const activeFilterCount = Object.values(searchData).filter(v => v.trim()).length

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0d2d2a 0%, #0f3d38 40%, #0a2e2b 70%, #081f1d 100%)' }}
    >
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='44' height='44' viewBox='0 0 44 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2300e5cc' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M20 2h4v6h-4zM20 36h4v6h-4zM2 20h6v4H2zM36 20h6v4h-6zM20 18h4v8h-4zM18 20h8v4h-8z'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: '44px 44px',
        }}
      />

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center gap-10">

        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-400/10 border border-teal-400/25 rounded-full mb-2">
            <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
            <span className="text-teal-300 text-xs font-bold tracking-wide">India's Trusted Healthcare Platform</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-black text-white leading-tight tracking-tight">
            Find the Right{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-400">
              Doctor for You
            </span>
          </h1>
          <p className="text-teal-100/60 text-base sm:text-lg max-w-xl mx-auto font-medium">
            Book with verified specialists instantly. Minimum wait, maximum care.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
          {STATS.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-5 backdrop-blur-sm hover:bg-white/8 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-400/15 border border-teal-400/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-teal-400" />
              </div>
              <p className="text-white font-black text-2xl leading-none">{value}</p>
              <p className="text-teal-100/50 text-xs text-center font-medium">{label}</p>
            </div>
          ))}
        </div>

        <div className="w-full bg-white rounded-3xl shadow-2xl shadow-black/30 p-3">
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="relative flex-1 min-w-0">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
              <input
                type="text"
                placeholder="Search doctor by name..."
                value={searchData.doctorName}
                onChange={handleChange('doctorName')}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm font-medium transition-all"
              />
            </div>

            <div className="relative flex-1 min-w-0">
              <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
              <select
                value={searchData.specialist}
                onChange={handleChange('specialist')}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 rounded-2xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 appearance-none cursor-pointer text-sm font-medium transition-all"
              >
                <option value="">All Specialties</option>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 border ${
                  showFilters
                    ? 'bg-teal-500 border-teal-400 text-white shadow-md shadow-teal-200'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
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
                onClick={handleSearch}
                className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl transition-all duration-200 text-sm shadow-lg shadow-orange-500/30 hover:from-orange-600 hover:to-orange-700 hover:scale-[1.02] active:scale-[0.97] whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-2 pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2 px-1 pb-1">
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                <select
                  value={searchData.state}
                  onChange={handleChange('state')}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 appearance-none cursor-pointer text-sm"
                >
                  <option value="">Select State / City</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Area / Locality"
                  value={searchData.area}
                  onChange={handleChange('area')}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                />
              </div>

              <button
                onClick={handleClear}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-100 rounded-xl text-sm font-bold transition-all duration-200"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="w-full bg-white rounded-3xl shadow-2xl shadow-black/20 p-6">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-5">Browse by Specialty</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {SPECIALTIES.map((specialty) => (
              <button
                key={specialty}
                onClick={() => handleSpecialtyClick(specialty)}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/60 transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                  {SPECIALTY_ICONS[specialty]}
                </span>
                <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight">{specialty}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}