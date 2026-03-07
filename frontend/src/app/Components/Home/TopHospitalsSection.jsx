'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MapPin, Building2, Bed, Plus, ChevronRight, Award,
  Loader2, AlertCircle, Globe, BadgeCheck, Stethoscope, CalendarDays, Layers
} from 'lucide-react'
import { useGetHospitals } from '@/app/hooks/useHospital'

export default function TopHospitalsSection() {
  const [visibleHospitals, setVisibleHospitals] = useState(3)
  const router = useRouter()
  const { data, isLoading, isError, error } = useGetHospitals()

  const hospitals = (data?.hospitals ?? []).filter((h) => h.isVerified && h.isActive)

  const loadMore = () => setVisibleHospitals((prev) => Math.min(prev + 3, hospitals.length))

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-orange-500 font-semibold text-sm tracking-wider uppercase mb-3 inline-block px-6 py-2 bg-orange-50 rounded-full">
            WORLD-CLASS HEALTHCARE FACILITIES
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Verified Top Rated Hospitals
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Connects you with the best hospitals, ensuring that you receive the highest quality healthcare services available.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm font-semibold text-slate-500">{error?.message ?? 'Failed to load hospitals'}</p>
          </div>
        )}

        {!isLoading && !isError && hospitals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Building2 className="w-10 h-10 text-slate-300" />
            <p className="text-sm font-semibold text-slate-400">No verified hospitals found</p>
          </div>
        )}

        {!isLoading && !isError && hospitals.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {hospitals.slice(0, visibleHospitals).map((hospital) => (
                <HospitalCard
                  key={hospital._id}
                  hospital={hospital}
                  onClick={() => router.push(`/patient/hospital/${hospital._id}`)}
                />
              ))}
            </div>

            {visibleHospitals < hospitals.length && (
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full flex items-center justify-center gap-4">
                    <div className="flex-1 max-w-xs h-0.5 bg-gradient-to-r from-transparent to-orange-300" />
                    <div className="flex-1 max-w-xs h-0.5 bg-gradient-to-l from-transparent to-orange-300" />
                  </div>
                </div>
                <button
                  onClick={loadMore}
                  className="relative group bg-white border-2 border-orange-400 text-orange-600 px-8 py-4 rounded-full font-semibold hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 transform hover:scale-105"
                >
                  <Plus className="w-6 h-6" />
                  <span>Load More Hospitals</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

function HospitalCard({ hospital, onClick }) {
  const address = [hospital.address?.city, hospital.address?.state].filter(Boolean).join(', ')
  const specialties = hospital.specialties ?? []
  const facilities = hospital.facilities ?? []

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-500 overflow-hidden hover:shadow-2xl transform hover:-translate-y-2"
    >
      <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

        <div className="relative flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-xl bg-white p-1 shadow-lg overflow-hidden">
              {hospital.logo ? (
                <img src={hospital.logo} alt={hospital.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="w-full h-full rounded-lg bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-teal-600" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-1.5 shadow-lg">
              <Award className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="flex-1 text-white min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-lg font-bold line-clamp-1">{hospital.name}</h3>
              <span className="flex items-center gap-0.5 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                <BadgeCheck className="w-3 h-3" /> Verified
              </span>
            </div>
            {hospital.established && (
              <p className="text-teal-100 text-xs font-medium">Est. {hospital.established}</p>
            )}
            {hospital.accreditation && (
              <p className="text-teal-100 text-xs mt-0.5 line-clamp-1">🏅 {hospital.accreditation}</p>
            )}
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {hospital.beds > 0 && (
            <div className="bg-white/15 rounded-xl px-2 py-2 text-center">
              <Bed className="w-4 h-4 text-white mx-auto mb-0.5" />
              <p className="text-white font-bold text-sm leading-none">{hospital.beds}</p>
              <p className="text-teal-100 text-[10px]">Beds</p>
            </div>
          )}
          {hospital.doctors?.length > 0 && (
            <div className="bg-white/15 rounded-xl px-2 py-2 text-center">
              <Stethoscope className="w-4 h-4 text-white mx-auto mb-0.5" />
              <p className="text-white font-bold text-sm leading-none">{hospital.doctors.length}</p>
              <p className="text-teal-100 text-[10px]">Doctors</p>
            </div>
          )}
          {hospital.departments?.length > 0 && (
            <div className="bg-white/15 rounded-xl px-2 py-2 text-center">
              <Layers className="w-4 h-4 text-white mx-auto mb-0.5" />
              <p className="text-white font-bold text-sm leading-none">{hospital.departments.length}</p>
              <p className="text-teal-100 text-[10px]">Depts</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 space-y-3">
        {hospital.description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{hospital.description}</p>
        )}

        <div className="space-y-1.5">
          {address && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" />
              <span className="text-xs text-gray-600 line-clamp-1">{address}</span>
            </div>
          )}
          {hospital.website && (
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-teal-500 shrink-0" />
              <a
                href={hospital.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-teal-600 hover:underline line-clamp-1"
              >
                {hospital.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          {hospital.emergencyContact && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-full">
                🚨 Emergency: {hospital.emergencyContact}
              </span>
            </div>
          )}
        </div>

        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {specialties.slice(0, 3).map((s, i) => (
              <span key={i} className="text-[10px] font-semibold bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-100">
                {s}
              </span>
            ))}
            {specialties.length > 3 && (
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                +{specialties.length - 3} more
              </span>
            )}
          </div>
        )}

        {facilities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {facilities.slice(0, 2).map((f, i) => (
              <span key={i} className="text-[10px] font-semibold bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full border border-teal-100">
                {f}
              </span>
            ))}
            {facilities.length > 2 && (
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                +{facilities.length - 2} more
              </span>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-gray-100">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-sm rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md group-hover:shadow-lg">
            View Profile
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  )
}
