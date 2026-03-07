'use client'

import { useState, useEffect, useContext } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AuthContext } from '@/app/context/AuthContext'
import {
  ArrowLeft, MapPin, Award, Clock, Calendar, Phone, Video, Mail,
  CheckCircle, Users, Briefcase, GraduationCap, Languages,
  MessageCircle, Share2, Heart, ChevronDown, Star, IndianRupee,
  Wifi, UserCheck, Building2, Navigation, Loader2, AlertCircle,
  BookOpen, Eye, Tag, Hash, Globe, BadgeCheck, Stethoscope, Zap,
  Pencil, Trash2, Plus, X, Send, Image as ImageIcon, Link as LinkIcon,
  ExternalLink,
} from 'lucide-react'
import { usePatientContext } from '@/app/context/PatientContext'
import { useReview } from '@/app/hooks/useReview'
import useDoctorGallery from '@/app/hooks/useDoctorGallery'
import OverviewTab from './OverviewTab'
import ExperienceTab from './ExperienceTab'
import AvailabilityTab from './AvailabilityTab'
import BlogsTab from './BlogsTab'
import ReviewsTab from './ReviewsTab'

const ORDERED_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const MODE_STYLES = {
  online:  { bg: 'bg-blue-50',  text: 'text-blue-700',  border: 'border-blue-200',  Icon: Wifi,      label: 'Online'    },
  offline: { bg: 'bg-teal-50',  text: 'text-teal-700',  border: 'border-teal-200',  Icon: UserCheck, label: 'In-Person' },
}

const SOCIAL_SIDEBAR_CONFIG = [
  {
    key: 'facebook',
    label: 'Facebook',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    hover: 'hover:bg-blue-100',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
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
    hover: 'hover:bg-pink-100',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0">
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
    hover: 'hover:bg-red-100',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    ),
  },
  {
    key: 'x',
    label: 'X (Twitter)',
    color: 'text-slate-800',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    hover: 'hover:bg-slate-100',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
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
    hover: 'hover:bg-sky-100',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
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
    hover: 'hover:bg-slate-100',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
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
    hover: 'hover:bg-teal-100',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
]

function formatTime(t) {
  if (!t) return ''
  const [hRaw, m] = t.split(':')
  const h = parseInt(hRaw, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m} ${ampm}`
}

function DoctorAvatar({ src, name, className }) {
  const [imgError, setImgError] = useState(false)
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'Dr'
  if (src && !imgError) {
    return <img src={src} alt={name || 'Doctor'} className={`${className} object-cover`} onError={() => setImgError(true)} />
  }
  return (
    <div className={`${className} bg-gradient-to-br from-teal-400 via-teal-500 to-teal-700 flex items-center justify-center`}>
      <span className="text-white font-black text-4xl tracking-tight">{initials}</span>
    </div>
  )
}

function StatBadge({ icon: Icon, color, children }) {
  return (
    <div className={`flex items-center gap-2 ${color} px-3 py-1.5 rounded-full`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="font-semibold text-xs">{children}</span>
    </div>
  )
}

export default function DoctorProfilePage() {
  const params  = useParams()
  const router  = useRouter()
  const { UserAuthData }  = useContext(AuthContext)
  const { doctorList }    = usePatientContext()

  const [isLoading,   setIsLoading]   = useState(true)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [liked,       setLiked]       = useState(false)

  const currentUserId   = UserAuthData?.user?._id || UserAuthData?.user?.id || UserAuthData?._id
  const currentUserRole = UserAuthData?.user?.role || UserAuthData?.role
  const isOwner         = currentUserRole === 'doctor' && String(currentUserId) === String(params?.id)

  console.log(doctorList)

  useEffect(() => {
    if (params?.id && doctorList !== undefined) setIsLoading(false)
  }, [params, doctorList])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
          <p className="text-sm font-semibold text-slate-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  const doctor = Array.isArray(doctorList)
    ? doctorList.find(d => d._id === params?.id || d.id === params?.id)
    : null

  if (!doctor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-12 h-12 text-slate-300" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Doctor Not Found</h1>
          <p className="text-slate-500 mb-6">This profile doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/patient/doctors')}
            className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors"
          >
            Back to Doctors
          </button>
        </div>
      </div>
    )
  }

  const bi    = doctor.basicInfo        || {}
  const pi    = doctor.professionalInfo || {}
  const avail = Array.isArray(doctor.availability) ? doctor.availability : []

  const features         = doctor.currentPlan?.features || {}
  const planIsActive     = doctor.currentPlan?.isActive === true
  const hasOnlineBooking = planIsActive && features.onlineBooking === true
  const hasOnlineConsult = planIsActive && features.onlineConsultation === true
  const isVerified       = planIsActive && features.verifiedBadge === true
  const hasBlogAccess    = planIsActive && features.blogAccess === true
  const searchBoost      = planIsActive ? (features.searchBoost || 0) : 0

  const displayName   = bi.fullName       || 'Doctor'
  const specialty     = pi.specialization || ''
  const qualification = pi.qualification  || ''
  const experience    = pi.experience     ?? ''
  const fee           = pi.consultationFee ? `₹${pi.consultationFee}` : 'N/A'

  const clinicNames    = [...new Set(avail.map(s => s.location?.clinicName).filter(Boolean))]
  const cities         = [...new Set(avail.map(s => s.location?.city).filter(Boolean))]
  const modes          = [...new Set(avail.map(s => s.consultationMode).filter(Boolean))]
  const headerLocation = clinicNames[0] || cities[0] || 'Location not listed'

  const socialLinks        = bi.socialLinks || {}
  const activeSocialLinks  = SOCIAL_SIDEBAR_CONFIG.filter(s => socialLinks[s.key])

  const handleBookAppointment = () => {
    if (!UserAuthData?.token) { router.push('/auth'); return }
    router.push(`/patient/${params?.id}`)
  }

  const TABS = ['overview', 'experience', 'availability', ...(hasBlogAccess ? ['blogs'] : []), 'reviews']

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-32">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold text-sm">Back to Doctors</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-36 h-36 md:w-44 md:h-44 rounded-3xl overflow-hidden ring-4 ring-white shadow-xl">
                    <DoctorAvatar src={bi.profileImage} name={displayName} className="w-full h-full" />
                  </div>
                  {isVerified && (
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                      <BadgeCheck className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h1 className="text-2xl md:text-3xl font-black text-slate-900">{displayName}</h1>
                      {isVerified && (
                        <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full">
                          <BadgeCheck className="w-3.5 h-3.5" /> Verified
                        </span>
                      )}
                      {searchBoost > 0 && (
                        <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full">
                          <Zap className="w-3 h-3" /> Boost ×{searchBoost}
                        </span>
                      )}
                    </div>
                    {specialty && (
                      <div className="flex items-center gap-2 text-teal-600 font-bold text-lg mb-1">
                        <Stethoscope className="w-4 h-4" />{specialty}
                      </div>
                    )}
                    {qualification && (
                      <p className="text-sm text-slate-500 font-medium mb-4">{qualification}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {experience !== '' && (
                        <StatBadge icon={Award} color="bg-teal-50 text-teal-700 border border-teal-100">
                          {experience}+ Yrs Exp
                        </StatBadge>
                      )}
                      {hasOnlineConsult && (
                        <StatBadge icon={Wifi} color="bg-blue-50 text-blue-700 border border-blue-100">
                          Online Consult
                        </StatBadge>
                      )}
                      {modes.includes('offline') && (
                        <StatBadge icon={UserCheck} color="bg-orange-50 text-orange-700 border border-orange-100">
                          In-Person
                        </StatBadge>
                      )}
                      {hasBlogAccess && (
                        <StatBadge icon={BookOpen} color="bg-purple-50 text-purple-700 border border-purple-100">
                          Publishes Articles
                        </StatBadge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <span>{headerLocation}</span>
                    </div>
                    {cities.length > 1 && (
                      <p className="text-xs text-slate-400 ml-6 mt-0.5">
                        Also in: {cities.slice(1).join(', ')}
                      </p>
                    )}

                    {activeSocialLinks.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {activeSocialLinks.map(({ key, label, color, bg, border, hover, icon: Icon }) => (
                          <a
                            key={key}
                            href={socialLinks[key]}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={label}
                            className={`flex items-center gap-1.5 px-3 py-1.5 ${bg} ${color} border ${border} ${hover} rounded-xl font-semibold text-xs transition-all duration-200 hover:scale-[1.05] active:scale-[0.97]`}
                          >
                            <Icon />
                            {label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex lg:flex-col gap-2">
                    <button
                      onClick={() => setLiked(!liked)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${liked ? 'bg-rose-100 text-rose-500' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      <Heart className={`w-5 h-5 ${liked ? 'fill-rose-500' : ''}`} />
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-all duration-200">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {hasOnlineBooking ? (
                    <button
                      onClick={handleBookAppointment}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Calendar className="w-5 h-5" />
                      {UserAuthData?.token ? 'Book Appointment' : 'Login to Book'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-400 font-semibold rounded-xl border border-slate-200 cursor-not-allowed select-none text-sm">
                      <Calendar className="w-4 h-4" />Booking Unavailable
                    </div>
                  )}
                  {bi.phone && (
                    <a
                      href={`tel:${bi.phone}`}
                      className="flex items-center gap-2 px-5 py-3 border-2 border-teal-500 text-teal-600 font-semibold rounded-xl hover:bg-teal-50 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <Phone className="w-4 h-4" />Call Now
                    </a>
                  )}
                  {hasOnlineConsult && (
                    <button
                      onClick={() => router.push(`/patient/${params?.id}`)}
                      className="flex items-center gap-2 px-5 py-3 border-2 border-blue-500 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <Video className="w-4 h-4" />Video Consult
                    </button>
                  )}
                  {bi.email && (
                    <a
                      href={`mailto:${bi.email}`}
                      className="flex items-center gap-2 px-5 py-3 border-2 border-slate-300 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <Mail className="w-4 h-4" />Message
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/50">
            <div className="flex overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-6 md:px-8 py-4 font-bold text-sm capitalize whitespace-nowrap transition-all duration-200 border-b-2 ${
                    selectedTab === tab
                      ? 'text-teal-600 border-teal-600 bg-white'
                      : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  {tab}
                  {tab === 'availability' && avail.length > 0 && (
                    <span className="ml-2 text-[10px] font-black bg-teal-600 text-white rounded-full px-1.5 py-0.5 align-middle">
                      {avail.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid lg:grid-cols-3 gap-6 lg:gap-8 pb-16">
          <div className="lg:col-span-2 space-y-5">
            {selectedTab === 'overview' && (
              <OverviewTab doctor={doctor} params={params} isOwner={isOwner} />
            )}
            {selectedTab === 'experience' && (
              <ExperienceTab doctor={doctor} />
            )}
            {selectedTab === 'availability' && (
              <AvailabilityTab doctor={doctor} />
            )}
            {selectedTab === 'blogs' && hasBlogAccess && (
              <BlogsTab doctorId={params?.id} displayName={displayName} />
            )}
            {selectedTab === 'reviews' && (
              <ReviewsTab doctorId={params?.id} displayName={displayName} />
            )}
          </div>

          <div className="space-y-5">
            <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-2 mb-1">
                <IndianRupee className="w-5 h-5 text-teal-300" />
                <p className="text-teal-300 text-sm font-semibold">Consultation Fee</p>
              </div>
              <p className="text-5xl font-black mb-5">{fee}</p>
              {hasOnlineBooking ? (
                <button
                  onClick={handleBookAppointment}
                  className="w-full px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-orange-900/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                >
                  <Calendar className="w-5 h-5" />
                  {UserAuthData?.token ? 'Book Appointment' : 'Login to Book'}
                </button>
              ) : (
                <div className="w-full px-6 py-3.5 bg-white/10 text-white/50 font-semibold rounded-xl border border-white/10 flex items-center justify-center gap-2 text-sm cursor-not-allowed select-none">
                  <Calendar className="w-4 h-4" />Booking Unavailable
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                {experience !== '' && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-500 text-sm">Experience</span>
                    <span className="font-bold text-slate-900 text-sm">{experience}+ Years</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500 text-sm">Schedules</span>
                  <span className="font-bold text-slate-900 text-sm">{avail.length}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500 text-sm">Mode</span>
                  <span className="font-bold text-slate-900 text-xs capitalize">
                    {modes.length === 2 ? 'Online & In-Person' : modes[0] || '—'}
                  </span>
                </div>
                {fee !== 'N/A' && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-500 text-sm">Fee</span>
                    <span className="font-bold text-teal-700 text-sm">{fee}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500 text-sm">Online Booking</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${hasOnlineBooking ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {hasOnlineBooking ? '✓ Available' : '✕ Unavailable'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500 text-sm">Video Consult</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${hasOnlineConsult ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                    {hasOnlineConsult ? '✓ Available' : '✕ Unavailable'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500 text-sm">Reviews</span>
                  <button
                    onClick={() => setSelectedTab('reviews')}
                    className="font-bold text-teal-600 hover:underline text-sm"
                  >
                    View all →
                  </button>
                </div>
              </div>
            </div>

            {activeSocialLinks.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-teal-600" />
                  Social & Web
                </h3>
                <div className="space-y-2">
                  {activeSocialLinks.map(({ key, label, color, bg, border, hover, icon: Icon }) => (
                    <a
                      key={key}
                      href={socialLinks[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 px-3.5 py-2.5 ${bg} ${color} border ${border} ${hover} rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group`}
                    >
                      <Icon />
                      <span className="flex-1">{label}</span>
                      <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-80 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {avail.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" />Schedules at a Glance
                </h3>
                <div className="space-y-2.5">
                  {avail.slice(0, 2).map((slot, i) => {
                    const mode = MODE_STYLES[slot.consultationMode] ?? MODE_STYLES.offline
                    return (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${mode.bg} ${mode.border}`}>
                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-wider ${mode.text}`}>{mode.label}</p>
                          <p className="text-sm font-bold text-slate-800 mt-0.5">
                            {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                          </p>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${mode.bg} ${mode.text} border ${mode.border}`}>
                          {slot.slotDuration}m
                        </span>
                      </div>
                    )
                  })}
                  {avail.length > 2 && (
                    <button
                      onClick={() => setSelectedTab('availability')}
                      className="w-full text-center text-xs font-bold text-teal-600 hover:text-teal-800 transition-colors py-1.5 rounded-xl hover:bg-teal-50"
                    >
                      +{avail.length - 2} more schedules →
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-sm p-6 border border-orange-100">
              <h3 className="text-base font-bold text-slate-900 mb-1">Need Help?</h3>
              <p className="text-slate-500 text-sm mb-4">Our support team is here for you</p>
              <button className="w-full px-6 py-3 bg-white text-orange-600 font-semibold rounded-xl border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 flex items-center justify-center gap-2 text-sm">
                <Phone className="w-4 h-4" />Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
