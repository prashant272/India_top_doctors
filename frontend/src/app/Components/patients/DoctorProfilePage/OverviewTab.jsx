'use client'

import { Users, Calendar, Languages, Building2, BadgeCheck, MapPin, Clock, Share2, ExternalLink } from 'lucide-react'
import GalleryView from './GalleryView.jsx'
import HospitalAffiliationCard from './HospitalAffiliationCard'

const SOCIAL_CONFIG = [
  {
    key: 'facebook',
    label: 'Facebook',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    hover: 'hover:bg-blue-100 hover:border-blue-300',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    key: 'instagram',
    label: 'Instagram',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    border: 'border-pink-100',
    hover: 'hover:bg-pink-100 hover:border-pink-300',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: 'youtube',
    label: 'YouTube',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-100',
    hover: 'hover:bg-red-100 hover:border-red-300',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    ),
  },
  {
    key: 'x',
    label: 'X',
    color: 'text-slate-800',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    hover: 'hover:bg-slate-100 hover:border-slate-400',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    color: 'text-sky-700',
    bg: 'bg-sky-50',
    border: 'border-sky-100',
    hover: 'hover:bg-sky-100 hover:border-sky-300',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    key: 'threads',
    label: 'Threads',
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    hover: 'hover:bg-slate-100 hover:border-slate-400',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.474 12.01v-.017c.03-3.579.882-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-.504-1.865-1.426-3.354-2.74-4.426-1.426-1.155-3.34-1.744-5.69-1.76-2.96.02-5.252.901-6.813 2.62-1.48 1.625-2.24 4.074-2.263 7.278.024 3.202.783 5.652 2.262 7.279 1.561 1.719 3.853 2.6 6.814 2.62 1.935-.018 3.682-.395 5.19-1.22 1.568-.855 2.447-2.116 2.683-3.85a5.989 5.989 0 0 0 .083-1.003c0-.988-.246-1.795-.73-2.4-.443-.556-1.062-.902-1.84-1.033.108.616.16 1.212.156 1.779-.014 1.64-.487 2.918-1.406 3.798-.85.814-2.01 1.23-3.449 1.24-1.27-.008-2.318-.363-3.114-1.054a3.592 3.592 0 0 1-1.26-2.802c.012-1.195.465-2.168 1.344-2.892.895-.736 2.156-1.124 3.75-1.152.774-.014 1.487.043 2.127.17a5.7 5.7 0 0 0-.136-1.14c-.217-.968-.75-1.437-1.63-1.437h-.045c-.67.005-1.154.222-1.48.663-.28.378-.428.905-.44 1.564l-2.061-.04c.024-1.106.31-2.016.851-2.703.637-.81 1.59-1.237 2.83-1.247h.068c1.57.015 2.728.658 3.344 1.862.453.883.638 1.953.549 3.18a8.044 8.044 0 0 1 1.553.645c1.068.652 1.75 1.61 2.026 2.848.108.49.162.996.162 1.504 0 .43-.036.853-.106 1.258-.37 2.432-1.655 4.226-3.817 5.332-1.85.958-4.038 1.445-6.504 1.463z" />
      </svg>
    ),
  },
  {
    key: 'website',
    label: 'Website',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    hover: 'hover:bg-teal-100 hover:border-teal-300',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
]

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

export default function OverviewTab({ doctor, params, isOwner }) {
  const bi    = doctor.basicInfo        || {}
  const pi    = doctor.professionalInfo || {}
  const avail = Array.isArray(doctor.availability) ? doctor.availability : []

  const features     = doctor.currentPlan?.features || {}
  const planIsActive = doctor.currentPlan?.isActive === true

  const specialty   = pi.specialization || ''
  const experience  = pi.experience     ?? ''
  const displayName = bi.fullName       || 'Doctor'

  const clinicNames = [...new Set(avail.map(s => s.location?.clinicName).filter(Boolean))]
  const cities      = [...new Set(avail.map(s => s.location?.city).filter(Boolean))]
  const modes       = [...new Set(avail.map(s => s.consultationMode).filter(Boolean))]

  const about = `${displayName} is a renowned ${specialty}${experience ? ` with over ${experience} years of experience` : ''}. Known for a patient-centric approach and expertise in handling complex cases.`

  const socialLinks = bi.socialLinks || {}
  const activeSocials = SOCIAL_CONFIG.filter(s => socialLinks[s.key])

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          About Doctor
        </h3>
        <p className="text-slate-600 leading-relaxed text-sm">{about}</p>
      </div>

      <HospitalAffiliationCard doctor={doctor} />

      <GalleryView doctorId={params?.id} />

      {avail.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-teal-600" />
            </div>
            Practice Overview
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Schedules</p>
              <p className="text-3xl font-black text-slate-800">{avail.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mode</p>
              <p className="text-sm font-bold text-slate-800 capitalize">
                {modes.length === 2 ? 'Online & In-Person' : modes[0] || '—'}
              </p>
            </div>
            {clinicNames.length > 0 && (
              <div className="sm:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Clinic(s)</p>
                <div className="flex flex-wrap gap-2">
                  {clinicNames.map((c, i) => (
                    <span key={i} className="px-3 py-1.5 bg-teal-50 text-teal-700 font-semibold text-xs rounded-lg border border-teal-100">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
            <Languages className="w-4 h-4 text-teal-600" />
          </div>
          Languages Spoken
        </h3>
        <div className="flex flex-wrap gap-2">
          {['English', 'Hindi'].map((lang, i) => (
            <span key={i} className="px-4 py-2 bg-teal-50 text-teal-700 font-semibold text-sm rounded-xl border border-teal-100">
              {lang}
            </span>
          ))}
        </div>
      </div>

      {activeSocials.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
              <Share2 className="w-4 h-4 text-teal-600" />
            </div>
            Find Me Online
          </h3>
          <div className="flex flex-wrap gap-3">
            {activeSocials.map(({ key, label, color, bg, border, hover, icon: Icon }) => (
              <a
                key={key}
                href={socialLinks[key]}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-4 py-2.5 ${bg} ${color} border ${border} ${hover} rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] shadow-sm`}
              >
                <Icon />
                {label}
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
