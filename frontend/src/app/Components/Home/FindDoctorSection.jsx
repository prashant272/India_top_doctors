'use client'

import { useRouter } from 'next/navigation'
import { MapPin, Stethoscope, Users, Award, TrendingUp, ArrowRight } from 'lucide-react'

export default function FindDoctorSection() {
  const router = useRouter()

  const services = [
    'Cardiology',
    'Physiotherapy',
    'Pharmacy',
    'Laboratory',
    'Dentistry',
    'Neurology'
  ]

  return (
    <section className="relative py-20 bg-gray-50 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          <div className="relative">
            <div className="absolute -left-20 top-0 w-40 h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-r-3xl hidden xl:block"></div>

            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 border-8 border-yellow-400 rounded-full opacity-20 -mr-24 -mt-24"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 border-8 border-yellow-400 rounded-full opacity-20 -ml-16 -mb-16"></div>

              <div className="absolute top-4 right-4">
                <div className="w-20 h-20 bg-yellow-400 rounded-br-3xl flex items-center justify-center">
                  <div className="text-slate-900 font-bold text-3xl">+</div>
                </div>
              </div>

              <div className="absolute left-4 top-1/4 flex flex-col gap-1 opacity-20">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-white rounded-full"></div>
                ))}
              </div>

              <div className="p-8 lg:p-12 relative z-10">
                <div className="border-2 border-yellow-400 rounded-xl inline-block px-6 py-3 mb-6">
                  <h3 className="text-white text-xl font-bold tracking-wide">
                    INDIA TOP DOCTOR
                  </h3>
                </div>

                <h2 className="text-white text-3xl lg:text-4xl font-bold mb-6 leading-tight">
                  Your <span className="text-yellow-400">Health</span> is<br />
                  our Priority
                </h2>

                <div className="bg-yellow-400 rounded-2xl p-6 mb-6">
                  <h4 className="text-slate-900 font-bold text-lg mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Best Services
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {services.map((service, index) => (
                      <span key={index} className="text-slate-900 text-sm font-semibold">
                        {service}
                        {index < services.length - 1 && <span className="ml-2">•</span>}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mb-2">
                      <Users className="w-6 h-6 text-slate-900" />
                    </div>
                    <p className="text-white font-bold text-lg">500+</p>
                    <p className="text-gray-300 text-xs">Expert Doctors</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mb-2">
                      <TrendingUp className="w-6 h-6 text-slate-900" />
                    </div>
                    <p className="text-white font-bold text-lg">50K+</p>
                    <p className="text-gray-300 text-xs">Happy Patients</p>
                  </div>
                </div>

                <div className="absolute bottom-8 right-8 bg-yellow-400 rounded-2xl px-6 py-3 transform rotate-3 shadow-xl">
                  <p className="text-slate-900 font-bold text-sm">INDIA TOP</p>
                  <p className="text-slate-900 font-bold text-lg">DOCTOR</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                We Can Help You Find <span className="text-orange-500">Doctor</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Connect with India's top verified doctors across all specializations. 
                Book instant appointments and get the care you deserve — all in one place.
              </p>
            </div>

            <button
              onClick={() => router.push('/patient/doctors')}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg font-bold rounded-2xl hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
              <Stethoscope className="w-6 h-6" />
              Find a Doctor
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center border-2 border-transparent hover:border-teal-200">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">500+</p>
                <p className="text-gray-600 text-sm font-medium">Expert Doctors</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center border-2 border-transparent hover:border-purple-200">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">50K+</p>
                <p className="text-gray-600 text-sm font-medium">Happy Patients</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
