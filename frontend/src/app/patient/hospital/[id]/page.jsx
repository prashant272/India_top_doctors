'use client'

import { useParams, useRouter } from 'next/navigation'
import {
  Building2, MapPin, BadgeCheck, Phone, Globe, Mail, ArrowLeft,
  Loader2, AlertCircle, BedDouble, CalendarDays, Stethoscope,
  ShieldCheck, Zap, Users, Layers, Star, ExternalLink
} from 'lucide-react'
import { useGetHospitalById } from '@/app/hooks/useHospital'

export default function HospitalDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data, isLoading, isError, error } = useGetHospitalById(id)
  const hospital = data?.hospital

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-teal-500" />
      </div>
    )
  }

  if (isError || !hospital) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-sm font-semibold text-slate-500">{error?.message ?? 'Hospital not found'}</p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-teal-600 font-semibold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    )
  }

  return (
   <>
    <main className="min-h-screen bg-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Hospitals
        </button>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="relative h-44 bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-600">
            {hospital.images?.[0] && (
              <img src={hospital.images[0]} alt="cover" className="w-full h-full object-cover opacity-60" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                {hospital.logo ? (
                  <img src={hospital.logo} alt={hospital.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-10 h-10 text-teal-400" />
                )}
              </div>
              <div className="flex gap-2 pb-1">
                {hospital.website && (
                  <a
                    href={hospital.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Visit Website
                  </a>
                )}
                {hospital.emergencyContact && (
                  <a
                    href={`tel:${hospital.emergencyContact}`}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5" /> Emergency
                  </a>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-800">{hospital.name}</h1>
                {hospital.isVerified && (
                  <span className="flex items-center gap-1 bg-teal-50 text-teal-600 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
                    <BadgeCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
                {!hospital.isActive && (
                  <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                    Inactive
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                {(hospital.address?.city || hospital.address?.state) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" />
                    {[hospital.address?.city, hospital.address?.state].filter(Boolean).join(', ')}
                  </span>
                )}
                {hospital.established && (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5 text-teal-400" />
                    Est. {hospital.established}
                  </span>
                )}
              </div>

              {hospital.description && (
                <p className="text-sm text-slate-500 leading-relaxed pt-1 max-w-2xl">{hospital.description}</p>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
              <StatBox icon={BedDouble} label="Beds" value={hospital.beds ?? '—'} color="teal" />
              <StatBox icon={Stethoscope} label="Doctors" value={hospital.doctors?.length ?? 0} color="cyan" />
              <StatBox icon={Layers} label="Departments" value={hospital.departments?.length ?? 0} color="indigo" />
              {hospital.accreditation && (
                <StatBox icon={ShieldCheck} label="Accredited" value="Yes" color="green" />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">

            {hospital.specialties?.length > 0 && (
              <Section title="Specialties" icon={Star}>
                <div className="flex flex-wrap gap-2">
                  {hospital.specialties.map((s, i) => (
                    <span key={i} className="text-xs font-semibold bg-teal-50 text-teal-700 px-3 py-1.5 rounded-xl border border-teal-100">
                      {s}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {hospital.facilities?.length > 0 && (
              <Section title="Facilities" icon={Layers}>
                <div className="flex flex-wrap gap-2">
                  {hospital.facilities.map((f, i) => (
                    <span key={i} className="text-xs font-semibold bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200">
                      {f}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {hospital.departments?.length > 0 && (
              <Section title="Departments" icon={Layers}>
                <div className="flex flex-wrap gap-2">
                  {hospital.departments.map((d, i) => (
                    <span key={i} className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl border border-indigo-100">
                      {d}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {hospital.doctors?.length > 0 && (
              <Section title={`Doctors (${hospital.doctors.length})`} icon={Users}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hospital.doctors.map((doc, i) => (
                    <div
                      key={i}
                      onClick={() => router.push(`/patient/doctors/${doc._id ?? doc}`)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 cursor-pointer transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden shrink-0">
                        {doc.basicInfo?.profileImage ? (
                          <img src={doc.basicInfo.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Stethoscope className="w-4 h-4 text-teal-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-teal-600 truncate transition-colors">
                          {doc.basicInfo?.fullName ?? `Doctor ${i + 1}`}
                        </p>
                        {doc.professionalInfo?.specialization && (
                          <p className="text-xs text-slate-400 truncate">{doc.professionalInfo.specialization}</p>
                        )}
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-400 shrink-0 transition-colors" />
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          <div className="space-y-4">
            <Section title="Contact Info" icon={Phone}>
              <div className="space-y-3">
                {hospital.phone && (
                  <ContactRow icon={Phone} label="Phone" value={hospital.phone} href={`tel:${hospital.phone}`} />
                )}
                {hospital.email && (
                  <ContactRow icon={Mail} label="Email" value={hospital.email} href={`mailto:${hospital.email}`} />
                )}
                {hospital.emergencyContact && (
                  <ContactRow icon={Zap} label="Emergency" value={hospital.emergencyContact} href={`tel:${hospital.emergencyContact}`} color="red" />
                )}
                {hospital.website && (
                  <ContactRow icon={Globe} label="Website" value={hospital.website.replace(/^https?:\/\//, '')} href={hospital.website} external />
                )}
              </div>
            </Section>

            {(hospital.address?.street || hospital.address?.city) && (
              <Section title="Address" icon={MapPin}>
                <div className="space-y-1 text-sm text-slate-600">
                  {hospital.address?.street && <p>{hospital.address.street}</p>}
                  {hospital.address?.city && <p>{hospital.address.city}</p>}
                  {hospital.address?.state && <p>{hospital.address.state}</p>}
                  {hospital.address?.zip && <p>{hospital.address.zip}</p>}
                  {hospital.address?.country && <p className="font-semibold text-slate-700">{hospital.address.country}</p>}
                </div>
              </Section>
            )}

            {hospital.accreditation && (
              <Section title="Accreditation" icon={ShieldCheck}>
                <p className="text-sm text-slate-600">{hospital.accreditation}</p>
              </Section>
            )}
          </div>
        </div>
      </div>
    </main>
   </>
  )
}

function StatBox({ icon: Icon, label, value, color }) {
  const colors = {
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    green: 'bg-green-50 text-green-600 border-green-100',
  }
  return (
    <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${colors[color]} gap-1`}>
      <Icon className="w-4 h-4" />
      <span className="text-lg font-bold">{value}</span>
      <span className="text-[10px] font-semibold opacity-70">{label}</span>
    </div>
  )
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-teal-500" />
        <h2 className="text-sm font-bold text-slate-700">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function ContactRow({ icon: Icon, label, value, href, external, color }) {
  const textColor = color === 'red' ? 'text-red-500' : 'text-teal-600'
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="flex items-start gap-2 group"
    >
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${textColor}`} />
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className={`text-xs font-semibold ${textColor} group-hover:underline break-all`}>{value}</p>
      </div>
    </a>
  )
}
