'use client'

import {
  MapPin, Calendar, CreditCard, Search,
  Clock, ShieldCheck, ArrowRight, CheckCircle
} from 'lucide-react'

const steps = [
  {
    id: 1,
    icon: MapPin,
    title: 'Find a Local Doctor',
    description: 'Search from thousands of verified doctors near you based on specialization, location, and ratings.',
    color: 'from-teal-500 to-teal-600',
    lightBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    border: 'border-teal-200 hover:border-teal-400',
    numberBg: 'bg-teal-600',
  },
  {
    id: 2,
    icon: Calendar,
    title: 'Choose Your Schedule',
    description: 'Pick a date and time slot that works best for you. Reschedule anytime with ease.',
    color: 'from-orange-500 to-orange-600',
    lightBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    border: 'border-orange-200 hover:border-orange-400',
    numberBg: 'bg-orange-500',
  },
  {
    id: 3,
    icon: CreditCard,
    title: 'Make a Payment',
    description: 'Pay securely online with multiple payment options. Get instant confirmation on your booking.',
    color: 'from-purple-500 to-purple-600',
    lightBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    border: 'border-purple-200 hover:border-purple-400',
    numberBg: 'bg-purple-600',
  },
]

const highlights = [
  {
    icon: ShieldCheck,
    color: 'text-teal-600',
    bg: 'from-teal-50 to-teal-100',
    iconBg: 'bg-teal-100',
    title: '100% Verified',
    desc: 'All doctors and hospitals are verified and certified',
  },
  {
    icon: Clock,
    color: 'text-orange-600',
    bg: 'from-orange-50 to-orange-100',
    iconBg: 'bg-orange-100',
    title: '24/7 Available',
    desc: 'Book appointments anytime, anywhere you need',
  },
  {
    icon: CheckCircle,
    color: 'text-purple-600',
    bg: 'from-purple-50 to-purple-100',
    iconBg: 'bg-purple-100',
    title: 'Easy Process',
    desc: 'Simple and quick booking process in just 3 steps',
  },
]

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="text-orange-500 font-semibold text-sm tracking-wider uppercase px-5 py-2 bg-orange-50 rounded-full inline-block mb-4">
            HOW IT WORKS
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How India Top Doctor Works
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Book your appointment in 3 simple steps — fast, secure, and hassle-free.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-16 left-[18%] right-[18%] h-0.5 bg-gradient-to-r from-teal-300 via-orange-300 to-purple-300 opacity-40" />

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.id} className="relative">
                  <div className={`group bg-white rounded-3xl border-2 ${step.border} transition-all duration-500 overflow-hidden hover:shadow-2xl transform hover:-translate-y-3 h-full`}>
                    <div className="p-8 flex flex-col items-center text-center gap-5">

                      <div className="relative">
                        <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                          <Icon className="w-9 h-9 text-white stroke-[1.5]" />
                        </div>
                        <div className={`absolute -top-2 -right-2 w-7 h-7 ${step.numberBg} rounded-full flex items-center justify-center shadow-md`}>
                          <span className="text-white font-bold text-xs">{step.id}</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-teal-600 group-hover:to-orange-500 transition-all duration-300">
                          {step.title}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>

  
                      <div className={`h-1 w-12 bg-gradient-to-r ${step.color} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    </div>

                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-10 -right-5 z-10 w-9 h-9 bg-white border-2 border-orange-200 rounded-full items-center justify-center shadow-md">
                      <ArrowRight className="w-4 h-4 text-orange-400" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-6">
          {highlights.map((item, i) => {
            const Icon = item.icon
            return (
              <div
                key={i}
                className={`bg-gradient-to-br ${item.bg} rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className={`flex-shrink-0 w-14 h-14 ${item.iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
                  <Icon className={`w-7 h-7 ${item.color} stroke-[1.5]`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{item.title}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
