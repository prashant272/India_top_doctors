'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  MapPin, Star, ChevronRight, Award, Users,
  BadgeCheck, User, Clock, Stethoscope, ThumbsUp,
} from 'lucide-react'
import { usePatientContext } from '@/app/context/PatientContext'

function useDoctorList() {
  const { doctorList, loading } = usePatientContext()
  const allDoctors = (() => {
    if (Array.isArray(doctorList)) return doctorList
    if (doctorList?.DoctorList) return doctorList.DoctorList
    if (Array.isArray(doctorList?.data)) return doctorList.data
    return []
  })()
  return { allDoctors, loading }
}

function SkeletonCard() {
  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-md">
      <div className="h-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      <div className="px-5 pb-5">
        <div className="relative -mt-10 mb-3 flex items-end justify-between">
          <div className="w-20 h-20 rounded-2xl bg-gray-200 animate-pulse border-2 border-white shadow-xl" />
          <div className="w-16 h-7 rounded-full bg-gray-200 animate-pulse mb-1" />
        </div>
        <div className="mb-3 space-y-2">
          <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3.5 h-3.5 rounded bg-gray-200 animate-pulse" />
          ))}
        </div>
        <div className="space-y-2 mb-3">
          <div className="h-10 w-full bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-10 w-full bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="flex justify-between py-3 border-t border-b border-gray-100 mb-4">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-11 w-full bg-gray-200 rounded-xl animate-pulse" />
      </div>
    </div>
  )
}

function DoctorCard({ doctor, onViewProfile }) {
  const features = doctor.currentPlan?.features || {}
  const planName = (doctor.currentPlan?.name || '').toLowerCase().trim()
  const isPremium = planName === 'premium plan'
  const isVerified = features.verifiedBadge === true
  const id = doctor._id || doctor.id
  const avgRating = doctor.averageRating || 0
  const totalReviews = doctor.totalReviews || 0
  const topReviews = doctor.reviews?.slice(0, 2) || []

  return (
    <div
      onClick={() => onViewProfile(id)}
      className="group relative bg-white rounded-2xl border border-gray-100 hover:border-teal-300 transition-all duration-300 overflow-hidden hover:shadow-2xl transform hover:-translate-y-1 cursor-pointer shadow-md"
    >
      <div className={`relative h-24 ${isPremium ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700' : 'bg-gradient-to-r from-teal-500 via-teal-500 to-teal-600'}`}>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      <div className="px-5 pb-5">
        <div className="relative -mt-10 mb-3 flex items-end justify-between">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-xl overflow-hidden border-2 border-white">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center overflow-hidden">
                {doctor.basicInfo?.profileImage ? (
                  <img
                    src={doctor.basicInfo.profileImage}
                    alt={doctor.basicInfo?.fullName}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <Users className="w-9 h-9 text-teal-500" />
                )}
              </div>
            </div>
            <div className={`absolute -bottom-1.5 -right-1.5 rounded-full p-1.5 shadow-md ${isVerified ? 'bg-blue-500' : 'bg-orange-400'}`}>
              {isVerified
                ? <BadgeCheck className="w-3.5 h-3.5 text-white" />
                : <Award className="w-3.5 h-3.5 text-white" />
              }
            </div>
          </div>

          <div className="flex items-center gap-1 bg-orange-50 border border-orange-100 rounded-full px-3 py-1.5 mb-1">
            <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
            <span className="text-orange-600 font-bold text-sm">
              {avgRating > 0 ? avgRating : 'New'}
            </span>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-gray-900 font-bold text-base leading-tight">
              {doctor.basicInfo?.fullName || doctor.basicInfo?.name || doctor.name}
            </h3>
            {isVerified && (
              <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
                ✓ Verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <Stethoscope className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
            <p className="text-teal-600 text-sm font-medium">
              {doctor.professionalInfo?.specialization || doctor.professionalInfo?.specialty || 'Specialist'}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {doctor.professionalInfo?.experience > 0 && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <ThumbsUp className="w-3 h-3 text-gray-400" />
                {doctor.professionalInfo.experience} Yrs Experience
              </span>
            )}
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              {doctor.basicInfo?.location || doctor.basicInfo?.area || 'India'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.floor(avgRating) ? 'fill-orange-400 text-orange-400' : 'fill-gray-100 text-gray-200'}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">
            {totalReviews > 0 ? `${totalReviews} ${totalReviews === 1 ? 'review' : 'reviews'}` : 'No reviews yet'}
          </span>
        </div>

        {topReviews.length > 0 && (
          <div className="space-y-2 mb-3">
            {topReviews.map((review, i) => (
              <div key={review._id || i} className="bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, s) => (
                    <Star
                      key={s}
                      className={`w-2.5 h-2.5 ${s < review.rating ? 'fill-orange-400 text-orange-400' : 'fill-gray-200 text-gray-200'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 italic line-clamp-1">"{review.reviewText}"</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between py-3 border-t border-b border-gray-100 mb-4">
          <div className="flex items-center gap-1.5 text-green-600">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">
              {doctor.availability?.[0]?.startTime
                ? `From ${doctor.availability[0].startTime}`
                : 'Available Soon'}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Consultation</p>
            <p className="text-base font-bold text-teal-600">
              ₹{doctor.professionalInfo?.consultationFee || 500}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onViewProfile(id) }}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 text-sm shadow-sm hover:shadow-lg group-hover:gap-3"
        >
          <User className="w-4 h-4" />
          View Profile
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-teal-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 bg-teal-50 rounded-full mb-4">
        <Users className="w-8 h-8 text-teal-400" />
      </div>
      <p className="text-gray-700 font-semibold text-lg mb-1">No Doctors Found</p>
      <p className="text-gray-400 text-sm">Doctors will appear here once they activate a plan.</p>
    </div>
  )
}

function ViewAllButton({ onClick }) {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center gap-4">
        <div className="flex-1 max-w-xs h-0.5 bg-gradient-to-r from-transparent to-orange-300" />
        <div className="flex-1 max-w-xs h-0.5 bg-gradient-to-l from-transparent to-orange-300" />
      </div>
      <button
        onClick={onClick}
        className="relative group bg-white border-2 border-orange-400 text-orange-600 px-8 py-4 rounded-full font-semibold hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 transform hover:scale-105"
      >
        <span className="text-2xl font-bold">+</span>
        <span>View All Doctors</span>
        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
      </button>
    </div>
  )
}

export default function TopRatedDoctors() {
  const router = useRouter()
  const { allDoctors, loading } = useDoctorList()

  const doctors = useMemo(() => {
    return allDoctors
      .filter((d) => {
        const plan = d.currentPlan
        if (!plan || plan.isActive !== true) return false
        const features = plan.features || {}
        if (Object.keys(features).length === 0) return false
        const planName = (plan.name || '').toLowerCase().trim()
        return planName === 'premium plan' || planName === 'standard plan'
      })
      .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
  }, [allDoctors])

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-orange-500 font-semibold text-sm tracking-wider uppercase mb-3">
            HIGHEST RATED BY PATIENTS
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Top Rated Doctors
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Doctors ranked by real patient reviews and ratings across India.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {loading
            ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
            : doctors.length > 0
              ? doctors.slice(0, 6).map((doctor) => (
                  <DoctorCard
                    key={doctor._id || doctor.id}
                    doctor={doctor}
                    onViewProfile={(id) => router.push(`/patient/doctors/${id}`)}
                  />
                ))
              : <EmptyState />
          }
        </div>

        {!loading && doctors.length > 6 && (
          <ViewAllButton onClick={() => router.push('/patient/doctors')} />
        )}
      </div>
    </section>
  )
}
