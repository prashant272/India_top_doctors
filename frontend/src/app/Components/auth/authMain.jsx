'use client'

import { useState } from 'react'
import { User, Stethoscope, CheckCircle, Building2, Award } from 'lucide-react'
import Link from 'next/link'
import SignIn from './SignIn'
import SignUp from './SignUp'
import ForgotPassword from './ForgotPassword'

export default function AuthMain() {
  const [authMode, setAuthMode] = useState('signin')
  const [userRole, setUserRole] = useState('patient')

  const leftPanelContent = {
    signin: {
      heading: 'Welcome Back!',
      subheading: 'Sign in to access your account and manage your healthcare journey.',
    },
    signup: {
      heading: 'Join Us Today!',
      subheading: 'Create an account to connect with top doctors and hospitals across India.',
    },
    forgot: {
      heading: 'Reset Password',
      subheading: 'We will send a verification OTP to your registered email address.',
    },
  }

  const { heading, subheading } = leftPanelContent[authMode]

  const roles = [
    { key: 'patient', label: 'Patient', icon: User },
    { key: 'doctor', label: 'Doctor', icon: Stethoscope },
    { key: 'hospital', label: 'Hospital', icon: Building2 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-orange-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-teal-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-teal-600 text-9xl font-bold">+</div>
        <div className="absolute top-40 right-32 text-orange-600 text-7xl font-bold">+</div>
        <div className="absolute bottom-40 left-32 text-teal-600 text-8xl font-bold">+</div>
        <div className="absolute bottom-20 right-20 text-orange-600 text-9xl font-bold">+</div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <div className="text-3xl font-bold text-gray-900">
                India <span className="text-teal-600">Top</span> <span className="text-orange-600">Doctor</span>
              </div>
            </Link>
            <p className="text-gray-600">Your health is our priority</p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-100">
            <div className="grid lg:grid-cols-2">
              <div className="hidden lg:block bg-gradient-to-br from-teal-500 to-teal-700 p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-400 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 h-full flex flex-col justify-between text-white">
                  <div>
                    <h2 className="text-4xl font-bold mb-4">{heading}</h2>
                    <p className="text-teal-100 text-lg mb-8">{subheading}</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Verified Doctors</h3>
                        <p className="text-teal-100 text-sm">Connect with certified and experienced medical professionals</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Top Hospitals</h3>
                        <p className="text-teal-100 text-sm">Access to 400+ leading hospitals across multiple cities</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Easy Booking</h3>
                        <p className="text-teal-100 text-sm">Book appointments instantly with real-time availability</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 sm:p-12">
                {authMode !== 'forgot' && (
                  <div className="mb-8">
                    <div className="flex gap-4 mb-6">
                      <button
                        onClick={() => setAuthMode('signin')}
                        className={`flex-1 py-3 font-semibold rounded-xl transition-all duration-300 ${
                          authMode === 'signin'
                            ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => setAuthMode('signup')}
                        className={`flex-1 py-3 font-semibold rounded-xl transition-all duration-300 ${
                          authMode === 'signup'
                            ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Sign Up
                      </button>
                    </div>

                    {/* ✅ Role selector — now includes Hospital */}
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                      {roles.map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          onClick={() => setUserRole(key)}
                          className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                            userRole === key
                              ? 'bg-white text-teal-600 shadow-md'
                              : 'text-gray-600 hover:text-teal-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {authMode === 'signin' && (
                  <SignIn
                    userRole={userRole}
                    onSwitchToSignUp={() => setAuthMode('signup')}
                    onForgotPassword={() => setAuthMode('forgot')}
                  />
                )}
                {authMode === 'signup' && (
                  <SignUp
                    userRole={userRole}
                    onSwitchToSignIn={() => setAuthMode('signin')}
                  />
                )}
                {authMode === 'forgot' && (
                  <ForgotPassword
                    userRole={userRole}
                    onBackToSignIn={() => setAuthMode('signin')}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="text-center mt-6 text-sm text-gray-600">
            <p>© 2026 India Top Doctor. All rights reserved.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        .animate-pulse {
          animation: pulse 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
