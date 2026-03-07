'use client'

import { useState, useContext, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LogOut, ChevronDown, Stethoscope, Calendar, FileText, Bell, ClipboardList, Info, Star, BookOpen, Phone, Building2 } from 'lucide-react'
import { AuthContext } from '@/app/context/AuthContext'

const publicNavLinks = [
  { name: 'Doctors', href: '/patient/doctors', icon: Stethoscope },
  { name: 'About', href: '/about', icon: Info },
  { name: 'Testimonials', href: '/testimonial', icon: Star },
  { name: 'Blog', href: '/blog', icon: BookOpen },
  { name: 'Contact', href: '/contact', icon: Phone },
]

const authLinks = [
  { name: 'Appointments', href: '/patient/MyAppointments', icon: Calendar },
  { name: 'Prescriptions', href: '/patient/YourPrescription', icon: ClipboardList },
  { name: 'Notifications', href: '/patient/notifications', icon: Bell },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const profileRef = useRef(null)
  const pathname = usePathname()
  const { UserAuthData, logout } = useContext(AuthContext)
  const isLoggedIn = !!UserAuthData?.token && UserAuthData?.role == "patient"

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
    setIsProfileOpen(false)
  }

  const initials = UserAuthData?.name
    ? UserAuthData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Playfair+Display:wght@600&display=swap');

        .nav-root { font-family: 'DM Sans', sans-serif; }
        .nav-logo-text { font-family: 'Playfair Display', serif; }

        .nav-link {
          position: relative;
          transition: color 0.2s, background 0.2s;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          border-radius: 99px;
          background: #0ea5e9;
          transition: width 0.25s ease;
        }
        .nav-link:hover::after { width: 70%; }
        .nav-link:hover { color: #0ea5e9; }

        .nav-link-active {
          color: #0284c7 !important;
          font-weight: 600;
        }
        .nav-link-active::after {
          width: 70% !important;
        }

        .profile-dropdown {
          animation: dropIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: top right;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: scale(0.94) translateY(-6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .mobile-drawer {
          transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
        }

        .avatar-ring {
          background: conic-gradient(from 180deg, #38bdf8, #0ea5e9, #7dd3fc, #38bdf8);
          animation: spin 4s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .pulse-dot {
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
      `}</style>

      <nav className={`nav-root sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_0_0_#e2e8f0,0_4px_24px_-4px_rgba(0,0,0,0.08)]'
          : 'bg-white shadow-sm border-b border-slate-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">

            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
                <Stethoscope size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="nav-logo-text text-lg text-slate-800 hidden sm:block">
                India<span className="text-sky-500">Top</span>Doctor
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-0.5">
              {publicNavLinks.map((link) => {
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`nav-link px-3.5 py-2 text-[13.5px] rounded-lg ${active ? 'nav-link-active bg-sky-50' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {link.name}
                  </Link>
                )
              })}

              {isLoggedIn && (
                <>
                  <div className="w-px h-5 bg-slate-200 mx-2" />
                  {authLinks.map((link) => {
                    const Icon = link.icon
                    const active = isActive(link.href)
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        className={`nav-link flex items-center gap-1.5 px-3.5 py-2 text-[13.5px] font-medium rounded-lg ${active ? 'nav-link-active bg-sky-50' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        {link.name === 'Notifications' ? (
                          <span className="relative">
                            <Icon size={14} className={active ? 'text-sky-500' : 'opacity-60'} />
                            <span className="pulse-dot absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                          </span>
                        ) : (
                          <Icon size={14} className={active ? 'text-sky-500' : 'opacity-60'} />
                        )}
                        {link.name}
                      </Link>
                    )
                  })}
                </>
              )}
            </div>

            <div className="hidden lg:flex items-center gap-2">
              {isLoggedIn ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen((o) => !o)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-200"
                  >
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <div className={`absolute inset-0 rounded-full ${isProfileOpen ? 'avatar-ring' : ''}`} style={{ padding: '1.5px' }}>
                        <div className="w-full h-full rounded-full bg-white" />
                      </div>
                      {UserAuthData?.profileImage ? (
                        <img src={UserAuthData.profileImage} alt={UserAuthData.name || 'User'} className="w-8 h-8 rounded-full object-cover border-2 border-sky-400" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {initials}
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-semibold text-slate-800 leading-none mb-0.5">{UserAuthData?.name?.split(' ')[0] || 'User'}</p>
                      <p className="text-[11px] text-slate-400 leading-none">Patient</p>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="profile-dropdown absolute right-0 top-[calc(100%+8px)] w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                      <div className="px-4 py-3.5 bg-gradient-to-br from-sky-50 to-blue-50 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-800">{UserAuthData?.name || 'User'}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{UserAuthData?.email}</p>
                      </div>
                      <div className="p-1.5">
                        {authLinks.map((link) => {
                          const Icon = link.icon
                          const active = isActive(link.href)
                          return (
                            <Link
                              key={link.name}
                              href={link.href}
                              onClick={() => setIsProfileOpen(false)}
                              className={`flex items-center gap-2.5 px-3 py-2.5 text-[13px] rounded-xl transition-colors duration-150 font-medium
                                ${active ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50'}`}
                            >
                              <Icon size={14} className={active ? 'text-sky-500' : 'opacity-70'} />
                              {link.name}
                              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />}
                            </Link>
                          )
                        })}
                      </div>
                      <div className="p-1.5 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-rose-500 hover:bg-rose-50 rounded-xl transition-colors duration-150 font-medium"
                        >
                          <LogOut size={14} />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth" className="px-4 py-2 text-[13.5px] font-medium text-slate-600 hover:text-sky-600 transition-colors duration-200 rounded-lg hover:bg-slate-50">
                    Log in
                  </Link>
                  <Link href="/auth" className="px-4 py-2 text-[13.5px] font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 rounded-xl shadow-sm shadow-sky-200 hover:shadow-md hover:shadow-sky-200 transition-all duration-200">
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
            </button>
          </div>
        </div>

        <div className={`mobile-drawer lg:hidden ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 pointer-events-none'} overflow-hidden`}>
          <div className="px-4 pt-2 pb-6 bg-white border-t border-slate-100 space-y-0.5">

            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 pt-3 pb-1">Explore</p>
            {publicNavLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href)
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-colors duration-150
                    ${active ? 'bg-sky-50 text-sky-600 font-semibold' : 'text-slate-700 font-medium hover:bg-sky-50 hover:text-sky-600'}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-sky-100' : 'bg-slate-100'}`}>
                    <Icon size={14} className={active ? 'text-sky-500' : 'text-slate-500'} />
                  </div>
                  {link.name}
                  {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400" />}
                </Link>
              )
            })}

            {isLoggedIn && (
              <>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 pt-4 pb-1">My Account</p>
                {authLinks.map((link) => {
                  const Icon = link.icon
                  const active = isActive(link.href)
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-colors duration-150
                        ${active ? 'bg-sky-50 text-sky-600 font-semibold' : 'text-slate-700 font-medium hover:bg-sky-50 hover:text-sky-600'}`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-sky-100' : 'bg-slate-100'}`}>
                        {link.name === 'Notifications' ? (
                          <span className="relative">
                            <Icon size={14} className={active ? 'text-sky-500' : 'text-slate-500'} />
                            <span className="pulse-dot absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                          </span>
                        ) : (
                          <Icon size={14} className={active ? 'text-sky-500' : 'text-slate-500'} />
                        )}
                      </div>
                      {link.name}
                      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400" />}
                    </Link>
                  )
                })}
              </>
            )}

            <div className="pt-3 mt-2 border-t border-slate-100">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-3 bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl border border-sky-100">
                    {UserAuthData?.profileImage ? (
                      <img src={UserAuthData.profileImage} alt={UserAuthData.name || 'User'} className="w-10 h-10 rounded-full object-cover border-2 border-sky-400" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-slate-900 font-semibold text-sm truncate">{UserAuthData?.name || 'User'}</p>
                      <p className="text-slate-400 text-xs truncate">{UserAuthData?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-500 text-sm font-medium hover:bg-rose-50 rounded-xl transition-colors duration-150"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/auth" onClick={() => setIsMenuOpen(false)} className="block w-full text-center px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 hover:border-sky-300 hover:text-sky-600 rounded-xl transition-all duration-200">
                    Log in
                  </Link>
                  <Link href="/auth" onClick={() => setIsMenuOpen(false)} className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl shadow-sm shadow-sky-200">
                    Get Started — it's free
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
