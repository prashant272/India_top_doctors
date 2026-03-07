'use client'

import { useRouter } from 'next/navigation'
import { Calendar, ArrowRight, Heart, Stethoscope, Shield, Clock } from 'lucide-react'

export default function AppointmentCTASection() {
  const router = useRouter()

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800"></div>

      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-teal-300 text-8xl font-bold">+</div>
        <div className="absolute top-32 left-40 text-teal-300 text-6xl font-bold">+</div>
        <div className="absolute top-20 right-32 text-teal-300 text-7xl font-bold">+</div>
        <div className="absolute bottom-20 left-20 text-teal-300 text-9xl font-bold">+</div>
        <div className="absolute bottom-32 right-20 text-teal-300 text-7xl font-bold">+</div>
        <div className="absolute top-1/2 left-1/4 text-teal-300 text-5xl font-bold">+</div>
        <div className="absolute top-1/3 right-1/4 text-teal-300 text-6xl font-bold">+</div>
      </div>

      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1000ms' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-8">
            <div>
              <p className="text-orange-400 font-semibold text-sm tracking-wider uppercase mb-4 inline-block px-4 py-2 bg-orange-500/20 rounded-full backdrop-blur-sm">
                REGISTRATION
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Want to Make an Appointment Easily
              </h2>
              <p className="text-teal-100 text-lg leading-relaxed">
                Regain your health and mobility. Leave your pain behind. Do the things you love. Our team of health professionals is dedicated to providing you with the best medical solutions for your injury or condition.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/patient/doctors')}
                className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl mb-2">
                  <Shield className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-2xl font-bold">100%</p>
                <p className="text-teal-100 text-xs">Verified</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl mb-2">
                  <Stethoscope className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-2xl font-bold">500+</p>
                <p className="text-teal-100 text-xs">Doctors</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl mb-2">
                  <Clock className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-teal-100 text-xs">Support</p>
              </div>
            </div>
          </div>

          <div className="relative lg:block hidden">
            <div className="relative z-10 animate-float">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 to-pink-400/30 rounded-full blur-3xl"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="w-64 h-64 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse-slow">
                        <Heart className="w-32 h-32 text-white fill-white" />
                      </div>
                      <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white rounded-full shadow-xl flex items-center justify-center transform rotate-12">
                        <Stethoscope className="w-16 h-16 text-teal-600 transform -rotate-12" />
                      </div>
                      <div className="absolute -top-4 -left-4 w-20 h-20 bg-orange-500 rounded-full shadow-lg flex items-center justify-center">
                        <Calendar className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute top-1/2 -right-8 w-16 h-16 bg-teal-500 rounded-full shadow-lg flex items-center justify-center animate-bounce">
                        <span className="text-white text-2xl font-bold">+</span>
                      </div>
                      <div className="absolute bottom-1/4 -left-8 w-12 h-12 bg-pink-500 rounded-full shadow-lg animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
