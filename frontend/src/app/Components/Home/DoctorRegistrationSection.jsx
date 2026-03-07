'use client'

import { useRouter } from 'next/navigation'
import { Check, Users, MapPin, Building2, Stethoscope, ArrowRight, Award, TrendingUp } from 'lucide-react'

export default function DoctorRegistrationSection() {
  const router = useRouter()

  const benefits = [
    'Lorem Ipsum has been the industry\'s standard dummy',
    'Text ever since the when an unknown printer took a galley',
    'Doctor type and scrambled it to make specimen been the'
  ]

  const stats = [
    { icon: <Users className="w-6 h-6 text-white" />, number: '10,000+', label: 'Patients Assisted' },
    { icon: <MapPin className="w-6 h-6 text-white" />, number: '20+', label: 'States' },
    { icon: <Building2 className="w-6 h-6 text-white" />, number: '400+', label: 'Top Hospitals and Clinics' },
    { icon: <Stethoscope className="w-6 h-6 text-white" />, number: '1500+', label: 'Specialized Doctors' },
  ]

  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-orange-500 to-orange-600 opacity-5"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-orange-500 font-semibold text-sm tracking-wider uppercase mb-4">
                REGISTER
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Are You a Provider <span className="text-orange-500">Interested</span> in Reaching New Patients?
              </h2>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/auth')}
                className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <span>List Your Hospital And Individual Profile Here</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              <button
                onClick={() => router.push('/auth')}
                className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold text-lg rounded-full hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <Stethoscope className="w-5 h-5" />
                <span>Join as Doctor</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-teal-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">100%</p>
                </div>
                <p className="text-gray-600 text-sm font-medium">Verified Platform</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">Fast</p>
                </div>
                <p className="text-gray-600 text-sm font-medium">Quick Registration</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-orange-400/30 to-orange-600/30 rounded-full blur-3xl"></div>

            <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-100 to-transparent opacity-50"></div>

              <div className="relative p-8">
                <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
                  <h3 className="text-3xl font-bold text-blue-900 mb-2">
                    ARE YOU<br />
                    <span className="text-4xl">DOCTOR?</span>
                  </h3>
                  <p className="text-blue-900 font-bold text-lg">JOIN US TODAY!</p>
                  <div className="w-16 h-1 bg-blue-900 mt-3"></div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">
                    Trusted by Patients<br />
                    from Across the<br />
                    Country
                  </h4>
                </div>

                <div className="space-y-3">
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-x-2"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{stat.number}</p>
                        <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl transform rotate-3"></div>
                  <div className="relative bg-white rounded-2xl p-6 flex items-center justify-center gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">50K+</p>
                      <p className="text-sm text-gray-600 font-medium">Happy Patients</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
