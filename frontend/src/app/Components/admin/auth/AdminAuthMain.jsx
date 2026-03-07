'use client'

import { useState } from 'react'
import { Shield, Crown, CheckCircle, Building2, Award, Users } from 'lucide-react'
import Link from 'next/link'
import SignIn from './SignIn'
import SignUp from './SignUp'
import ForgotPassword from '../../auth/ForgotPassword'


export default function AdminAuthMain() {
  const [authMode, setAuthMode] = useState('signin')
  const [userRole, setUserRole] = useState('admin')

  const leftPanelContent = {
    signin: {
      heading: 'Welcome Back!',
      subheading: 'Sign in to manage doctors, patients, and platform operations.',
    },
    signup: {
      heading: 'Create Account',
      subheading: 'Register a new admin, super admin, or provider account.',
    },
    forgot: {
      heading: 'Reset Password',
      subheading: 'We will send a verification OTP to your registered email address.',
    },
  }

  const { heading, subheading } = leftPanelContent[authMode]

  const roles = [
    { key: 'admin', label: 'Admin', icon: Shield, activeColor: 'text-teal-400' },
    { key: 'superadmin', label: 'Super Admin', icon: Crown, activeColor: 'text-violet-400' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-teal-500 rounded-full blur-3xl animate-custom-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500 rounded-full blur-3xl animate-custom-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-teal-400 text-9xl font-bold">+</div>
        <div className="absolute top-40 right-32 text-violet-400 text-7xl font-bold">+</div>
        <div className="absolute bottom-40 left-32 text-teal-400 text-8xl font-bold">+</div>
        <div className="absolute bottom-20 right-20 text-violet-400 text-9xl font-bold">+</div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl">

          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <div className="text-3xl font-bold text-white">
                India <span className="text-teal-400">Top</span> <span className="text-violet-400">Doctor</span>
              </div>
            </Link>
            <p className="text-slate-400">Admin Control Panel — Authorized Access Only</p>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-700">
            <div className="grid lg:grid-cols-2">

              <div className="hidden lg:block bg-gradient-to-br from-teal-600 to-teal-800 p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-400 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 h-full flex flex-col justify-between text-white">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Shield className="w-6 h-6" />
                      </div>
                      <span className="text-lg font-bold">Secure Admin Portal</span>
                    </div>
                    <h2 className="text-4xl font-bold mb-4">{heading}</h2>
                    <p className="text-teal-100 text-lg mb-8">{subheading}</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Full Platform Control</h3>
                        <p className="text-teal-100 text-sm">Manage all doctors, patients, and appointments</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Hospital Management</h3>
                        <p className="text-teal-100 text-sm">Oversee 400+ hospitals and their operations</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Provider Oversight</h3>
                        <p className="text-teal-100 text-sm">Monitor providers managing hospital listings</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Analytics & Reports</h3>
                        <p className="text-teal-100 text-sm">Access real-time data and generate reports</p>
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
                        className={`flex-1 py-3 font-semibold rounded-xl transition-all duration-300 ${authMode === 'signin'
                            ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => setAuthMode('signup')}
                        className={`flex-1 py-3 font-semibold rounded-xl transition-all duration-300 ${authMode === 'signup'
                            ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                      >
                        Sign Up
                      </button>
                    </div>

                    <div className="flex gap-2 p-1 bg-slate-700 rounded-xl">
                      {roles.map(({ key, label, icon: Icon, activeColor }) => (
                        <button
                          key={key}
                          onClick={() => setUserRole(key)}
                          className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${userRole === key
                              ? `bg-slate-800 ${activeColor} shadow-md`
                              : `text-slate-400 hover:${activeColor}`
                            }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="hidden sm:inline">{label}</span>
                          <span className="sm:hidden">{label.split(' ')[0]}</span>
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

          <div className="text-center mt-6 text-sm text-slate-500">
            <p>© 2026 India Top Doctor. Admin Portal — Restricted Access.</p>
          </div>
        </div>
      </div>

    </div>
  )
}
