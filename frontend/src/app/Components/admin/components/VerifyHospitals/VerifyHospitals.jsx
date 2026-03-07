'use client'

import { useState, useEffect } from 'react'
import {
  Building2, MapPin, Phone, Mail, ShieldCheck, ShieldX,
  Search, RefreshCw, BadgeCheck, AlertTriangle, Eye,
  CheckCircle, XCircle, Users, Activity, Globe, Clock,
  ChevronDown, ChevronUp, Filter, X, Stethoscope, Award, Contact, User
} from 'lucide-react'
import useAdmin from '@/app/hooks/useAdmin'

const SectionCard = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
)

const Modal = ({ title, onClose, children, wide }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}>
      <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
)

const Badge = ({ children, color }) => {
  const colors = {
    green: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    red:   'text-red-700 bg-red-50 border-red-200',
    amber: 'text-amber-700 bg-amber-50 border-amber-200',
    teal:  'text-teal-700 bg-teal-50 border-teal-200',
    gray:  'text-gray-600 bg-gray-100 border-gray-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${colors[color]}`}>
      {children}
    </span>
  )
}

const ContactPersonCard = ({ cp }) => {
  if (!cp || (!cp.name && !cp.email && !cp.phone)) return null
  return (
    <div>
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
        <Contact className="w-3.5 h-3.5 text-teal-500" /> Contact Person
        <span className="normal-case font-normal text-gray-300 ml-1">(Admin only)</span>
      </h4>
      <div className="bg-teal-50/70 border border-teal-100 rounded-xl p-4 space-y-2.5">
        {cp.name && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Name</p>
              <p className="text-sm font-semibold text-gray-800">
                {cp.name}
                {cp.designation && (
                  <span className="ml-2 text-xs font-normal text-gray-400">· {cp.designation}</span>
                )}
              </p>
            </div>
          </div>
        )}
        {cp.email && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <a href={`mailto:${cp.email}`} className="text-sm font-semibold text-teal-600 hover:underline">
                {cp.email}
              </a>
            </div>
          </div>
        )}
        {cp.phone && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Phone</p>
              <p className="text-sm font-semibold text-gray-800">
                <a href={`tel:${cp.phone}`} className="hover:text-teal-600">{cp.phone}</a>
                {cp.alternatePhone && (
                  <span className="text-gray-400 font-normal ml-2">/ {cp.alternatePhone}</span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminVerifyHospitals() {
  const [search, setSearch]                     = useState('')
  const [filter, setFilter]                     = useState('all')
  const [expanded, setExpanded]                 = useState({})
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [modal, setModal]                       = useState(null)
  const [notify, setNotify]                     = useState({ msg: '', type: '' })
  const [verifying, setVerifying]               = useState(false)
  const [toggling, setToggling]                 = useState(false)

  const {
    hospitals,
    loadingHospitals,
    fetchAllHospitals,
    verifyHospitalById,
    toggleHospitalById,
  } = useAdmin()

  useEffect(() => {
    fetchAllHospitals({ limit: 100 })
  }, [fetchAllHospitals])

  const showNotify = (msg, isError = false) => {
    setNotify({ msg, type: isError ? 'error' : 'success' })
    setTimeout(() => setNotify({ msg: '', type: '' }), 4000)
  }


  const filtered = hospitals.filter(h => {
    const matchSearch =
      h.name?.toLowerCase().includes(search.toLowerCase())          ||
      h.email?.toLowerCase().includes(search.toLowerCase())         ||
      h.address?.city?.toLowerCase().includes(search.toLowerCase())
    if (filter === 'pending')  return matchSearch && !h.isVerified
    if (filter === 'verified') return matchSearch && h.isVerified
    if (filter === 'inactive') return matchSearch && !h.isActive
    return matchSearch
  })

  const counts = {
    all:      hospitals.length,
    pending:  hospitals.filter(h => !h.isVerified).length,
    verified: hospitals.filter(h => h.isVerified).length,
    inactive: hospitals.filter(h => !h.isActive).length,
  }

  const handleVerify = async (id) => {
    setVerifying(true)
    try {
      await verifyHospitalById(id)
      showNotify('Hospital verified successfully')
      setModal(null)
      setSelectedHospital(null)
    } catch (err) {
      showNotify(err?.message || 'Failed to verify hospital', true)
    } finally {
      setVerifying(false)
    }
  }

  const handleToggle = async (id) => {
    setToggling(true)
    try {
      await toggleHospitalById(id)
      showNotify('Status updated successfully')
      if (selectedHospital?._id === id) {
        setSelectedHospital(prev => ({ ...prev, isActive: !prev.isActive }))
      }
    } catch (err) {
      showNotify(err?.message || 'Failed to update status', true)
    } finally {
      setToggling(false)
    }
  }

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  const openDetail   = (h)  => { setSelectedHospital(h); setModal('detail') }
  const closeModal   = ()   => { setModal(null); setSelectedHospital(null) }

  const tabs = [
    { key: 'all',      label: 'All'      },
    { key: 'pending',  label: 'Pending'  },
    { key: 'verified', label: 'Verified' },
    { key: 'inactive', label: 'Inactive' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-5">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hospital Verification</h1>
            <p className="text-sm text-gray-500 mt-0.5">Review and verify hospital registrations</p>
          </div>
          <button
            onClick={() => fetchAllHospitals({ limit: 100 })}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border-2 border-gray-200 hover:border-teal-400 rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {notify.msg && (
          <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 border ${
            notify.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-teal-50 border-teal-200 text-teal-700'
          }`}>
            {notify.type === 'error'
              ? <XCircle className="w-4 h-4 shrink-0" />
              : <CheckCircle className="w-4 h-4 shrink-0" />
            }
            {notify.msg}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: 'all',      label: 'Total',    icon: Building2,     color: 'bg-teal-50 text-teal-600'       },
            { key: 'pending',  label: 'Pending',  icon: AlertTriangle, color: 'bg-amber-50 text-amber-600'     },
            { key: 'verified', label: 'Verified', icon: ShieldCheck,   color: 'bg-emerald-50 text-emerald-600' },
            { key: 'inactive', label: 'Inactive', icon: ShieldX,       color: 'bg-red-50 text-red-600'         },
          ].map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`bg-white rounded-2xl border-2 p-4 text-left transition-all ${filter === key ? 'border-teal-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{counts[key]}</p>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
            </button>
          ))}
        </div>

        <SectionCard>
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, email or city..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-sm bg-gray-50 text-black border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="flex gap-1">
                {tabs.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === key ? 'bg-teal-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    {label}
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${filter === key ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {counts[key]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loadingHospitals ? (
            <div className="p-16 text-center text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium">Loading hospitals...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-gray-400">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-semibold text-gray-500">No hospitals found</p>
              <p className="text-sm mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((h) => (
                <div key={h._id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center shrink-0 border border-teal-100">
                      {h.logo?.url
                        ? <img src={h.logo.url} alt={h.name} className="w-full h-full object-cover rounded-xl" />
                        : <Building2 className="w-6 h-6 text-teal-600" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="text-base font-bold text-gray-900">{h.name}</h3>
                        {h.isVerified
                          ? <Badge color="green"><BadgeCheck className="w-3 h-3" /> Verified</Badge>
                          : <Badge color="amber"><AlertTriangle className="w-3 h-3" /> Pending</Badge>
                        }
                        {h.isActive
                          ? <Badge color="teal">Active</Badge>
                          : <Badge color="red">Inactive</Badge>
                        }

                        {h.contactPerson?.name && (
                          <Badge color="gray">
                            <Contact className="w-3 h-3" /> {h.contactPerson.name}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
                        {h.email && (
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{h.email}</span>
                        )}
                        {h.phone && (
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{h.phone}</span>
                        )}
                        {(h.address?.city || h.address?.state) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {[h.address?.city, h.address?.state].filter(Boolean).join(', ')}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {h.doctors?.length || 0} Doctors
                        </span>
                        {h.beds && (
                          <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{h.beds} Beds</span>
                        )}
                        {h.createdBy && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-teal-400" />
                            Owner: {h.createdBy}
                          </span>
                        )}
                        {h.createdAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(h.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>

                      {h.specialties?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {h.specialties.slice(0, 3).map((s, i) => (
                            <span key={i} className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">{s}</span>
                          ))}
                          {h.specialties.length > 3 && (
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              +{h.specialties.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {h.description && (
                        <>
                          <p className={`text-xs text-gray-500 leading-relaxed ${!expanded[h._id] ? 'line-clamp-2' : ''}`}>
                            {h.description}
                          </p>
                          <button onClick={() => toggleExpand(h._id)} className="text-xs font-semibold text-teal-600 hover:text-teal-700 mt-1 flex items-center gap-1">
                            {expanded[h._id]
                              ? <><ChevronUp className="w-3 h-3" />Show less</>
                              : <><ChevronDown className="w-3 h-3" />Show more</>
                            }
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => openDetail(h)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      {!h.isVerified && (
                        <button
                          onClick={() => { setSelectedHospital(h); setModal('confirm') }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Verify
                        </button>
                      )}
                      <button
                        onClick={() => handleToggle(h._id)}
                        disabled={toggling}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-50 ${
                          h.isActive
                            ? 'text-red-700 bg-red-50 hover:bg-red-100'
                            : 'text-teal-700 bg-teal-50 hover:bg-teal-100'
                        }`}
                      >
                        {h.isActive
                          ? <><ShieldX className="w-3.5 h-3.5" />Deactivate</>
                          : <><ShieldCheck className="w-3.5 h-3.5" />Activate</>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {modal === 'confirm' && selectedHospital && (
        <Modal title="Verify Hospital" onClose={closeModal}>
          <div className="text-center space-y-5">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-10 h-10 text-emerald-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">You are about to verify</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{selectedHospital.name}</p>
              <div className="flex items-center justify-center gap-3 mt-2 text-xs text-gray-400">
                {selectedHospital.email && (
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{selectedHospital.email}</span>
                )}
                {selectedHospital.address?.city && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedHospital.address.city}</span>
                )}
              </div>
              {selectedHospital.createdBy && (
                <p className="text-xs text-gray-400 mt-1">
                  Owner: <span className="font-semibold text-teal-600">{selectedHospital.createdBy}</span>
                </p>
              )}
              {selectedHospital.contactPerson?.name && (
                <p className="text-xs text-gray-400 mt-1">
                  Contact: <span className="font-semibold text-gray-600">{selectedHospital.contactPerson.name}</span>
                  {selectedHospital.contactPerson.phone && (
                    <span className="ml-2 text-teal-500">{selectedHospital.contactPerson.phone}</span>
                  )}
                </p>
              )}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
              <p className="text-xs font-semibold text-amber-800 flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4" /> Before verifying, confirm:
              </p>
              <ul className="text-xs text-amber-700 space-y-1 ml-6 list-disc">
                <li>Hospital registration documents are valid</li>
                <li>Contact details have been confirmed</li>
                <li>Location and address are accurate</li>
              </ul>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={closeModal}
                className="flex-1 py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerify(selectedHospital._id)}
                disabled={verifying}
                className="flex-1 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {verifying ? 'Verifying...' : 'Confirm Verify'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'detail' && selectedHospital && (
        <Modal title="Hospital Details" onClose={closeModal} wide>
          <div className="space-y-5">
            <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center shrink-0 border border-teal-100">
                {selectedHospital.logo?.url
                  ? <img src={selectedHospital.logo.url} alt={selectedHospital.name} className="w-full h-full object-cover rounded-2xl" />
                  : <Building2 className="w-8 h-8 text-teal-600" />
                }
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-gray-900">{selectedHospital.name}</h2>
                  {selectedHospital.isVerified
                    ? <Badge color="green"><BadgeCheck className="w-3 h-3" /> Verified</Badge>
                    : <Badge color="amber"><AlertTriangle className="w-3 h-3" /> Pending Verification</Badge>
                  }
                  {selectedHospital.isActive
                    ? <Badge color="teal">Active</Badge>
                    : <Badge color="red">Inactive</Badge>
                  }
                </div>
                {selectedHospital.createdBy && (
                  <p className="text-xs text-gray-400 mb-1">
                    Owner: <span className="font-semibold text-teal-600">{selectedHospital.createdBy}</span>
                  </p>
                )}
                {selectedHospital.description && (
                  <p className="text-sm text-gray-500 leading-relaxed">{selectedHospital.description}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</h4>
                {selectedHospital.email && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedHospital.email}</p>
                    </div>
                  </div>
                )}
                {selectedHospital.phone && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Phone</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedHospital.phone}</p>
                    </div>
                  </div>
                )}
                {selectedHospital.website && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Website</p>
                      <a href={selectedHospital.website} target="_blank" rel="noreferrer" className="text-sm font-semibold text-teal-600 hover:underline">
                        {selectedHospital.website}
                      </a>
                    </div>
                  </div>
                )}
                {selectedHospital.emergencyContact && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Emergency</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedHospital.emergencyContact}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</h4>
                {(selectedHospital.address?.street || selectedHospital.address?.city) && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      {selectedHospital.address?.street && (
                        <p className="text-sm font-semibold text-gray-800">{selectedHospital.address.street}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        {[selectedHospital.address?.city, selectedHospital.address?.state, selectedHospital.address?.pincode].filter(Boolean).join(', ')}
                      </p>
                      {selectedHospital.address?.country && (
                        <p className="text-xs text-gray-400">{selectedHospital.address.country}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <ContactPersonCard cp={selectedHospital.contactPerson} />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-t border-b border-gray-100">
              {[
                { label: 'Doctors',       value: selectedHospital.doctors?.length || 0,   icon: Users    },
                { label: 'Beds',          value: selectedHospital.beds             || '—', icon: Activity },
                { label: 'Est.',          value: selectedHospital.established      || '—', icon: Clock    },
                { label: 'Accreditation', value: selectedHospital.accreditation    || '—', icon: Award    },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <Icon className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                  <p className="text-base font-bold text-gray-900">{String(value)}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>

            {selectedHospital.specialties?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedHospital.specialties.map((s, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-full">
                      <Stethoscope className="w-3 h-3" /> {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedHospital.facilities?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Facilities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedHospital.facilities.map((f, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full">
                      <CheckCircle className="w-3 h-3 text-emerald-500" /> {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => handleToggle(selectedHospital._id)}
                disabled={toggling}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                  selectedHospital.isActive
                    ? 'text-red-700 bg-red-50 hover:bg-red-100'
                    : 'text-teal-700 bg-teal-50 hover:bg-teal-100'
                }`}
              >
                {selectedHospital.isActive
                  ? <><ShieldX className="w-4 h-4" />{toggling ? 'Updating...' : 'Deactivate'}</>
                  : <><ShieldCheck className="w-4 h-4" />{toggling ? 'Updating...' : 'Activate'}</>
                }
              </button>
              {!selectedHospital.isVerified && (
                <button
                  onClick={() => setModal('confirm')}
                  disabled={verifying}
                  className="flex-1 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {verifying ? 'Verifying...' : 'Verify Hospital'}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
