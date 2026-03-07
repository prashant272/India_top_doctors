'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: 'MARETIN CHUA',
      role: 'Patient',
      image: '/testimonials/user1.jpg',
      text: 'Best service are provide us. simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the when an unknown printer took a galley of type and scrambled it to make specimen',
      rating: 5
    },
    {
      id: 2,
      name: 'SARAH JOHNSON',
      role: 'Patient',
      image: '/testimonials/user2.jpg',
      text: 'Outstanding medical care and professional staff. The doctors are highly skilled and caring. I highly recommend India Top Doctor for anyone seeking quality healthcare services.',
      rating: 5
    },
    {
      id: 3,
      name: 'DAVID WILLIAMS',
      role: 'Patient',
      image: '/testimonials/user3.jpg',
      text: 'Excellent experience from booking to consultation. The platform is user-friendly and the doctors are very professional. Great service overall!',
      rating: 5
    }
  ]

  const avatars = [
    '/testimonials/avatar1.jpg',
    '/testimonials/avatar2.jpg',
    '/testimonials/avatar3.jpg',
    '/testimonials/avatar4.jpg'
  ]

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 border-8 border-orange-400 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 border-8 border-teal-400 rounded-full"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-orange-500 font-semibold text-sm tracking-wider uppercase mb-3">
            TESTIMONIALS
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What People Say
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry the standard dummy text ever since the when an printer took.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-6 -ml-32">
            {avatars.slice(0, 3).map((avatar, index) => (
              <div
                key={index}
                className="relative group cursor-pointer"
                style={{ 
                  animation: `float ${3 + index}s ease-in-out infinite`,
                  animationDelay: `${index * 0.5}s`
                }}
              >
                <div className="w-20 h-20 rounded-full border-4 border-orange-400 overflow-hidden bg-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-300"></div>
                </div>
                {index === 1 && (
                  <div className="absolute -right-2 -top-2 w-6 h-6 bg-orange-500 rounded-full"></div>
                )}
              </div>
            ))}
          </div>

          <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-6 -mr-32">
            {avatars.slice(0, 3).map((avatar, index) => (
              <div
                key={index}
                className="relative group cursor-pointer"
                style={{ 
                  animation: `float ${3 + index}s ease-in-out infinite`,
                  animationDelay: `${index * 0.5}s`
                }}
              >
                <div className="w-20 h-20 rounded-full border-4 border-orange-400 overflow-hidden bg-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <div className="w-full h-full bg-gradient-to-br from-teal-200 to-teal-300"></div>
                </div>
                {index === 1 && (
                  <div className="absolute -right-2 -top-2 w-6 h-6 bg-orange-500 rounded-full"></div>
                )}
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-100">
              <div className="absolute top-8 left-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Quote className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="absolute top-0 right-0 w-32 h-32">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-400 opacity-20"></div>
                <div className="absolute top-4 right-4 w-16 h-16 bg-orange-500 opacity-20"></div>
              </div>

              <div className="pt-20 pb-12 px-8 md:px-16">
                <div className="text-center space-y-6">
                  <div className="flex justify-center gap-1 mb-4">
                    {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 fill-orange-400 text-orange-400" />
                    ))}
                  </div>

                  <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
                    "{testimonials[activeIndex].text}"
                  </p>

                  <div className="pt-6">
                    <h4 className="text-2xl font-bold text-gray-900 mb-1">
                      {testimonials[activeIndex].name}
                    </h4>
                    <p className="text-teal-600 font-medium">
                      {testimonials[activeIndex].role}
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-orange-500 to-teal-500"></div>
            </div>

            <div className="flex items-center justify-center gap-6 mt-8">
              <button
                onClick={prevTestimonial}
                className="w-12 h-12 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 shadow-md hover:shadow-lg group"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-orange-600 transition-colors duration-300" />
              </button>

              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? 'w-8 bg-gradient-to-r from-orange-500 to-orange-600'
                        : 'w-2 bg-gray-300 hover:bg-orange-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="w-12 h-12 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 shadow-md hover:shadow-lg group"
              >
                <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-orange-600 transition-colors duration-300" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center border-2 border-transparent hover:border-teal-200">
            <p className="text-4xl font-bold text-gray-900 mb-2">2500+</p>
            <p className="text-gray-600 font-medium">Happy Patients</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center border-2 border-transparent hover:border-orange-200">
            <p className="text-4xl font-bold text-gray-900 mb-2">4.9/5</p>
            <p className="text-gray-600 font-medium">Average Rating</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center border-2 border-transparent hover:border-purple-200">
            <p className="text-4xl font-bold text-gray-900 mb-2">98%</p>
            <p className="text-gray-600 font-medium">Satisfaction Rate</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </section>
  )
}
