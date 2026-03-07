'use client'

import { useRouter } from 'next/navigation'
import { Stethoscope, Heart, Scan, Droplet, Microscope, Users, Bone, Baby, ArrowRight, Activity, Brain } from 'lucide-react'

export default function TopSpecialtiesSection() {
  const router = useRouter()

  const specialties = [
    { id: 1,  name: 'General Physicians', icon: <Stethoscope className="w-12 h-12" />, color: 'from-teal-500 to-teal-600',     bgColor: 'bg-teal-50',    iconColor: 'text-teal-600'    },
    { id: 2,  name: 'Cardiologist',       icon: <Heart className="w-12 h-12" />,       color: 'from-red-500 to-red-600',       bgColor: 'bg-red-50',     iconColor: 'text-red-600'     },
    { id: 3,  name: 'MRI Resonance',      icon: <Scan className="w-12 h-12" />,        color: 'from-blue-500 to-blue-600',     bgColor: 'bg-blue-50',    iconColor: 'text-blue-600'    },
    { id: 4,  name: 'Blood Test',         icon: <Droplet className="w-12 h-12" />,     color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50',  iconColor: 'text-purple-600'  },
    { id: 5,  name: 'Laboratory',         icon: <Microscope className="w-12 h-12" />,  color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50',  iconColor: 'text-orange-600'  },
    { id: 6,  name: 'Dermatologist',      icon: <Activity className="w-12 h-12" />,    color: 'from-cyan-500 to-cyan-600',     bgColor: 'bg-cyan-50',    iconColor: 'text-cyan-600'    },
    { id: 7,  name: 'Orthopedic',         icon: <Bone className="w-12 h-12" />,        color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-50',  iconColor: 'text-indigo-600'  },
    { id: 8,  name: 'Neurologist',        icon: <Brain className="w-12 h-12" />,       color: 'from-pink-500 to-pink-600',     bgColor: 'bg-pink-50',    iconColor: 'text-pink-600'    },
    { id: 9,  name: 'Orthopedic',         icon: <Bone className="w-12 h-12" />,        color: 'from-emerald-500 to-emerald-600',bgColor: 'bg-emerald-50',iconColor: 'text-emerald-600' },
    { id: 10, name: 'Pediatrician',       icon: <Baby className="w-12 h-12" />,        color: 'from-amber-500 to-amber-600',   bgColor: 'bg-amber-50',   iconColor: 'text-amber-600'   },
  ]

  const handleSpecialtyClick = (name) => {
    const params = new URLSearchParams({ specialist: name })
    router.push(`/patient/doctors?${params.toString()}`)
  }

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-orange-500 font-semibold text-sm tracking-wider uppercase mb-3 inline-block px-6 py-2 bg-orange-50 rounded-full">
            CATEGORIES
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Top Searched Specialties
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry the standard dummy text ever since the when an printer took.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          {specialties.map((specialty) => (
            <div
              key={specialty.id}
              onClick={() => handleSpecialtyClick(specialty.name)}
              className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl -z-10 blur-xl from-orange-200 to-teal-200"></div>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`relative ${specialty.bgColor} rounded-2xl p-6 group-hover:scale-110 transition-transform duration-500`}>
                  <div className={`${specialty.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                    {specialty.icon}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl from-orange-500 to-teal-500"></div>
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold text-lg mb-1 group-hover:text-teal-600 transition-colors duration-300">
                    {specialty.name}
                  </h3>
                </div>
              </div>

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => router.push('/patient/doctors')}
            className="group relative px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold text-lg rounded-full hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-3 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            <span className="relative">View All Specialties</span>
            <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>

        <div className="mt-20 bg-gradient-to-r from-teal-50 via-orange-50 to-teal-50 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-teal-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-orange-400 rounded-full blur-3xl"></div>
          </div>
          <div className="relative grid md:grid-cols-3 gap-8 text-center">
            <div className="group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                <Stethoscope className="w-8 h-8 text-teal-600" />
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">150+</p>
              <p className="text-gray-600 font-medium">Medical Specialties</p>
            </div>
            <div className="group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">1000+</p>
              <p className="text-gray-600 font-medium">Expert Doctors</p>
            </div>
            <div className="group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">50K+</p>
              <p className="text-gray-600 font-medium">Happy Patients</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
