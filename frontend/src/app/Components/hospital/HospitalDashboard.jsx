'use client'

import { useState, useContext, useEffect, useCallback } from 'react'
import {
  Building2, MapPin, Phone, Mail, Edit3, Users, ShieldCheck,
  LogOut, Activity, CheckCircle, XCircle, Plus,
  UserPlus, UserMinus, ToggleLeft, ToggleRight, AlertTriangle,
  RefreshCw, Camera, Globe, Stethoscope, Award, Clock,
  ChevronDown, ChevronUp, User, Pencil, Save, X, BadgeCheck,
  Search, Trash2, Lock, Key, Eye, EyeOff, Contact,
} from 'lucide-react'
import { AuthContext } from '@/app/context/AuthContext'
import {
  useGetProviderMe,
  useUpdateProviderMe,
  useProviderGetMyHospitals,
  useProviderCreateHospital,
  useProviderUpdateHospital,
  useProviderDeleteHospital,
  useProviderToggleActiveStatus,
  useProviderAddDoctor,
  useProviderRemoveDoctor,
} from '@/app/hooks/useProvider'

const iClass = "w-full px-4 py-3 text-gray-900 text-sm font-medium bg-white border-2 border-gray-200 rounded-xl placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"

const EMPTY_CONTACT_PERSON = {
  name: '', email: '', phone: '', alternatePhone: '', designation: '',
}

const EMPTY_HOSPITAL_FORM = {
  name: '', email: '', phone: '', address: '', city: '',
  state: '', pincode: '', specialties: '', description: '',
  beds: '', website: '', facilities: '', emergencyContact: '',
  established: '', accreditation: '',
  contactPerson: { ...EMPTY_CONTACT_PERSON },
}

const parseCSV = (str) => str.split(',').map(s => s.trim()).filter(Boolean)

const Modal = ({ title, onClose, children, wide }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}>
      <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
)

const SectionCard = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
)

const FormButtons = ({ onCancel, loading, saveLabel = 'Save Changes' }) => (
  <div className="flex gap-3 pt-2">
    <button type="button" onClick={onCancel} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
      Cancel
    </button>
    <button type="submit" disabled={loading} className="flex-1 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
      <Save className="w-4 h-4" />
      {loading ? 'Saving...' : saveLabel}
    </button>
  </div>
)

const FieldLabel = ({ children }) => (
  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{children}</label>
)

const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  )
}

const StatCard = ({ icon: Icon, label, value, color }) => (
  <SectionCard>
    <div className="p-5 text-center">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
    </div>
  </SectionCard>
)

const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
    <Icon className="w-12 h-12 mx-auto mb-3 text-gray-200" />
    <p className="font-semibold text-gray-500">{title}</p>
    {subtitle && <p className="text-sm mt-1 text-gray-400">{subtitle}</p>}
  </div>
)

const TagList = ({ items, color = 'teal', icon: Icon }) => {
  if (!items?.length) return <p className="text-sm text-gray-400 italic">None added</p>
  const styles = {
    teal: 'text-teal-700 bg-teal-50 border-teal-100',
    gray: 'text-gray-600 bg-gray-100 border-gray-200',
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${styles[color]}`}>
          {Icon && <Icon className="w-3 h-3" />}
          {item}
        </span>
      ))}
    </div>
  )
}

const HospitalFormFields = ({ form, setForm }) => {
  const f  = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))
  const cp = (key) => (e) => setForm(prev => ({
    ...prev,
    contactPerson: { ...prev.contactPerson, [key]: e.target.value },
  }))

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Basic Info</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <FieldLabel>Hospital Name *</FieldLabel>
            <input required type="text" value={form.name} onChange={f('name')} placeholder="Hospital name" className={iClass} />
          </div>
          <div>
            <FieldLabel>Email *</FieldLabel>
            <input required type="email" value={form.email} onChange={f('email')} className={iClass} />
          </div>
          <div>
            <FieldLabel>Phone</FieldLabel>
            <input type="tel" value={form.phone} onChange={f('phone')} className={iClass} />
          </div>
          <div>
            <FieldLabel>Website</FieldLabel>
            <input type="url" value={form.website} onChange={f('website')} placeholder="https://" className={iClass} />
          </div>
          <div>
            <FieldLabel>Emergency Contact</FieldLabel>
            <input type="text" value={form.emergencyContact} onChange={f('emergencyContact')} className={iClass} />
          </div>
          <div className="col-span-2">
            <FieldLabel>About</FieldLabel>
            <textarea rows={2} value={form.description} onChange={f('description')} placeholder="Describe the hospital..." className={`${iClass} resize-none`} />
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Location</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <FieldLabel>Street Address</FieldLabel>
            <input type="text" value={form.address} onChange={f('address')} className={iClass} />
          </div>
          <div>
            <FieldLabel>City</FieldLabel>
            <input type="text" value={form.city} onChange={f('city')} className={iClass} />
          </div>
          <div>
            <FieldLabel>State</FieldLabel>
            <input type="text" value={form.state} onChange={f('state')} className={iClass} />
          </div>
          <div>
            <FieldLabel>Pincode</FieldLabel>
            <input type="text" value={form.pincode} onChange={f('pincode')} className={iClass} />
          </div>
          <div>
            <FieldLabel>Total Beds</FieldLabel>
            <input type="number" value={form.beds} onChange={f('beds')} className={iClass} />
          </div>
          <div>
            <FieldLabel>Established Year</FieldLabel>
            <input type="number" value={form.established} onChange={f('established')} placeholder="e.g. 1998" className={iClass} />
          </div>
          <div>
            <FieldLabel>Accreditation</FieldLabel>
            <input type="text" value={form.accreditation} onChange={f('accreditation')} placeholder="NABH, JCI..." className={iClass} />
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Medical Details</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Specialties</FieldLabel>
            <input type="text" value={form.specialties} onChange={f('specialties')} placeholder="Cardiology, Ortho..." className={iClass} />
            <p className="text-xs text-gray-400 mt-1">Comma separated</p>
          </div>
          <div>
            <FieldLabel>Facilities</FieldLabel>
            <input type="text" value={form.facilities} onChange={f('facilities')} placeholder="ICU, OT, Pharmacy..." className={iClass} />
            <p className="text-xs text-gray-400 mt-1">Comma separated</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-teal-50 rounded-lg flex items-center justify-center">
            <Contact className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Person</p>
          <span className="text-[10px] text-gray-400 font-medium">(Admin only — not shown publicly)</span>
        </div>
        <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Full Name</FieldLabel>
              <input type="text" value={form.contactPerson.name} onChange={cp('name')} placeholder="e.g. Ramesh Gupta" className={iClass} />
            </div>
            <div>
              <FieldLabel>Designation</FieldLabel>
              <input type="text" value={form.contactPerson.designation} onChange={cp('designation')} placeholder="e.g. Hospital Administrator" className={iClass} />
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <input type="email" value={form.contactPerson.email} onChange={cp('email')} placeholder="contact@hospital.com" className={iClass} />
            </div>
            <div>
              <FieldLabel>Phone</FieldLabel>
              <input type="tel" value={form.contactPerson.phone} onChange={cp('phone')} placeholder="+91 98000 00000" className={iClass} />
            </div>
            <div>
              <FieldLabel>Alternate Phone</FieldLabel>
              <input type="tel" value={form.contactPerson.alternatePhone} onChange={cp('alternatePhone')} placeholder="+91 11 2345 6789" className={iClass} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HospitalDetailPanel({ h, onEdit, onDelete, onToggle, onVerify, onManageDoctors, toggling, verifying }) {
  const [expanded, setExpanded] = useState(false)
  const cp = h.contactPerson

  return (
    <SectionCard>
      <div className="h-2 bg-gradient-to-r from-teal-400 to-teal-600 rounded-t-2xl" />
      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center shrink-0 border border-teal-100 overflow-hidden">
            {h.logo?.url
              ? <img src={h.logo.url} alt={h.name} className="w-full h-full object-cover" />
              : <Building2 className="w-8 h-8 text-teal-600" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-gray-900">{h.name}</h3>
              {h.isVerified && <BadgeCheck className="w-5 h-5 text-teal-600" />}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${h.isActive ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-gray-500 bg-gray-100 border-gray-200'}`}>
                {h.isActive ? 'Active' : 'Inactive'}
              </span>
              {!h.isVerified && (
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Unverified
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              {h.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{h.email}</span>}
              {h.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{h.phone}</span>}
              {(h.address?.city || h.address?.state) && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {[h.address?.city, h.address?.state].filter(Boolean).join(', ')}
                </span>
              )}
              {h.website && (
                <a href={h.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-teal-600 hover:underline">
                  <Globe className="w-3 h-3" />{h.website}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Doctors',       value: h.doctors?.length || 0, icon: Users,    color: 'text-blue-600 bg-blue-50'       },
            { label: 'Beds',          value: h.beds || '—',           icon: Activity, color: 'text-purple-600 bg-purple-50'  },
            { label: 'Established',   value: h.established || '—',    icon: Clock,    color: 'text-orange-600 bg-orange-50'  },
            { label: 'Accreditation', value: h.accreditation || '—',  icon: Award,    color: 'text-emerald-600 bg-emerald-50'},
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5 ${color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <p className="text-sm font-bold text-gray-800">{String(value)}</p>
              <p className="text-[10px] text-gray-400 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {cp && (cp.name || cp.email || cp.phone) && (
          <div className="mb-4 bg-teal-50/60 border border-teal-100 rounded-xl p-3">
            <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Contact className="w-3 h-3" /> Contact Person
            </p>
            <div className="space-y-1">
              {cp.name && (
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <User className="w-3 h-3 text-gray-400 shrink-0" />
                  <span className="font-semibold">{cp.name}</span>
                  {cp.designation && <span className="text-gray-400">· {cp.designation}</span>}
                </div>
              )}
              {cp.email && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                  <a href={`mailto:${cp.email}`} className="hover:text-teal-600 hover:underline">{cp.email}</a>
                </div>
              )}
              {cp.phone && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                  <a href={`tel:${cp.phone}`} className="hover:text-teal-600">{cp.phone}</a>
                  {cp.alternatePhone && <span className="text-gray-400">/ {cp.alternatePhone}</span>}
                </div>
              )}
            </div>
          </div>
        )}

        {h.specialties?.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Specialties</p>
            <div className="flex flex-wrap gap-1.5">
              {h.specialties.map((s, i) => (
                <span key={i} className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full">{s}</span>
              ))}
            </div>
          </div>
        )}

        {h.facilities?.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Facilities</p>
            <div className="flex flex-wrap gap-1.5">
              {h.facilities.map((f, i) => (
                <span key={i} className="text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />{f}
                </span>
              ))}
            </div>
          </div>
        )}

        {h.address?.street && (
          <div className="mb-3 flex items-start gap-2 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 mt-0.5 text-gray-400 shrink-0" />
            <span>{[h.address.street, h.address.city, h.address.state, h.address.pincode].filter(Boolean).join(', ')}</span>
          </div>
        )}

        {h.emergencyContact && (
          <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
            <Phone className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>Emergency: <span className="font-semibold text-gray-700">{h.emergencyContact}</span></span>
          </div>
        )}

        {h.description && (
          <div className="mb-3">
            <p className={`text-xs text-gray-500 leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}>{h.description}</p>
            <button onClick={() => setExpanded(p => !p)} className="text-xs font-semibold text-teal-600 hover:text-teal-700 mt-1 flex items-center gap-1">
              {expanded ? <><ChevronUp className="w-3 h-3" />Show less</> : <><ChevronDown className="w-3 h-3" />Show more</>}
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
          <button onClick={() => onEdit(h)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all">
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={() => onManageDoctors(h)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all">
            <UserPlus className="w-3.5 h-3.5" /> Doctors
          </button>
          <button onClick={() => onToggle(h._id)} disabled={toggling} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-all disabled:opacity-50">
            {h.isActive ? <><ToggleRight className="w-3.5 h-3.5" />Deactivate</> : <><ToggleLeft className="w-3.5 h-3.5" />Activate</>}
          </button>
          {!h.isVerified && (
            <button onClick={() => onVerify(h._id)} disabled={verifying} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all disabled:opacity-50">
              <ShieldCheck className="w-3.5 h-3.5" /> Verify
            </button>
          )}
          <button onClick={() => onDelete(h)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all ml-auto">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>
    </SectionCard>
  )
}

export default function HospitalDashboard() {
  const { UserAuthData, logout, Userdispatch } = useContext(AuthContext)
  const [activeTab, setActiveTab]               = useState('hospitals')
  const [modal, setModal]                       = useState(null)
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [notify, setNotify]                     = useState({ msg: '', type: '' })
  const [searchQuery, setSearchQuery]           = useState('')
  const [editingSection, setEditingSection]     = useState(null)
  const [doctorForm, setDoctorForm]             = useState({ doctorId: '' })
  const [hospitalForm, setHospitalForm]         = useState(EMPTY_HOSPITAL_FORM)
  const [showPassword, setShowPassword]         = useState(false)
  const [accountForm, setAccountForm]           = useState({ name: '', email: '', phone: '', currentPassword: '', newPassword: '' })

  const { data: meData }                                                    = useGetProviderMe()
  const { data: hospitalsData, isLoading: hospitalsLoading, refetch }      = useProviderGetMyHospitals({ page: 1, limit: 50 })
  const { mutateAsync: updateMe, isPending: updatingMe }                   = useUpdateProviderMe()
  const { mutateAsync: createHospital, isPending: creating }               = useProviderCreateHospital()
  const { mutateAsync: updateHospital, isPending: updating }               = useProviderUpdateHospital()
  const { mutateAsync: deleteHospital, isPending: deleting }               = useProviderDeleteHospital()
  const { mutateAsync: toggleActiveStatus, isPending: toggling }           = useProviderToggleActiveStatus()
  const { mutateAsync: addDoctor, isPending: addingDoctor }                = useProviderAddDoctor()
  const { mutateAsync: removeDoctor, isPending: removingDoctor }           = useProviderRemoveDoctor()

  const hospitals     = hospitalsData?.hospitals || []
  const totalDoctors  = hospitals.reduce((a, h) => a + (h.doctors?.length || 0), 0)
  const verifiedCount = hospitals.filter(h => h.isVerified).length
  const activeCount   = hospitals.filter(h => h.isActive).length

  useEffect(() => {
    if (UserAuthData) {
      setAccountForm(prev => ({
        ...prev,
        name:  UserAuthData.name  || '',
        email: UserAuthData.email || '',
        phone: UserAuthData.phone || '',
      }))
    }
  }, [UserAuthData])

  const filtered = hospitals.filter(h =>
    h.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.address?.city?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const showNotify = useCallback((msg, isError = false) => {
    setNotify({ msg, type: isError ? 'error' : 'success' })
    setTimeout(() => setNotify({ msg: '', type: '' }), 4000)
  }, [])

  const closeModal = useCallback(() => { setModal(null); setSelectedHospital(null) }, [])

  const withNotify = async (fn, successMsg, errorFallback) => {
    try   { await fn(); showNotify(successMsg) }
    catch (err) { showNotify(err?.response?.data?.message || errorFallback, true) }
  }

  const buildHospitalPayload = () => ({
    ...hospitalForm,
    specialties:   parseCSV(hospitalForm.specialties),
    facilities:    parseCSV(hospitalForm.facilities),
    contactPerson: hospitalForm.contactPerson,
  })

  const handleUpdateAccount = async (e) => {
    e.preventDefault()
    await withNotify(async () => {
      await updateMe({ name: accountForm.name, email: accountForm.email, phone: accountForm.phone })
      Userdispatch({ type: 'UPDATE_PROFILE', payload: { name: accountForm.name, email: accountForm.email } })
      setEditingSection(null)
    }, 'Account updated successfully', 'Failed to update account')
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (!accountForm.currentPassword || !accountForm.newPassword)
      return showNotify('Fill in both password fields', true)
    await withNotify(async () => {
      await updateMe({ currentPassword: accountForm.currentPassword, newPassword: accountForm.newPassword })
      setAccountForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }))
      setEditingSection(null)
    }, 'Password changed successfully', 'Failed to change password')
  }

  const handleCreateHospital = async (e) => {
    e.preventDefault()
    await withNotify(async () => {
      await createHospital(buildHospitalPayload())
      closeModal()
      setHospitalForm(EMPTY_HOSPITAL_FORM)
    }, 'Hospital created successfully', 'Failed to create hospital')
  }

  const handleUpdateHospital = async (e) => {
    e.preventDefault()
    await withNotify(async () => {
      await updateHospital({ id: selectedHospital._id, body: buildHospitalPayload() })
      closeModal()
    }, 'Hospital updated successfully', 'Failed to update hospital')
  }

  const handleDeleteHospital = async (id) => {
    await withNotify(async () => {
      await deleteHospital(id)
      closeModal()
    }, 'Hospital deleted', 'Failed to delete')
  }

  const handleToggle = (id) => withNotify(() => toggleActiveStatus(id), 'Status updated', 'Failed to update status')

  const handleAddDoctor = async (e) => {
    e.preventDefault()
    await withNotify(async () => {
      await addDoctor({ hospitalId: selectedHospital._id, doctorId: doctorForm.doctorId })
      setDoctorForm({ doctorId: '' })
    }, 'Doctor added', 'Failed to add doctor')
  }

  const handleRemoveDoctor = (doctorId) =>
    withNotify(() => removeDoctor({ hospitalId: selectedHospital._id, doctorId }), 'Doctor removed', 'Failed to remove doctor')

  const openEditHospital = (h) => {
    setSelectedHospital(h)
    setHospitalForm({
      name:             h.name             || '',
      email:            h.email            || '',
      phone:            h.phone            || '',
      address:          h.address?.street  || '',
      city:             h.address?.city    || '',
      state:            h.address?.state   || '',
      pincode:          h.address?.pincode || '',
      specialties:      h.specialties?.join(', ')  || '',
      description:      h.description      || '',
      beds:             h.beds             || '',
      website:          h.website          || '',
      facilities:       h.facilities?.join(', ')   || '',
      emergencyContact: h.emergencyContact  || '',
      established:      h.established      || '',
      accreditation:    h.accreditation    || '',
      contactPerson: {
        name:           h.contactPerson?.name           || '',
        email:          h.contactPerson?.email          || '',
        phone:          h.contactPerson?.phone          || '',
        alternatePhone: h.contactPerson?.alternatePhone || '',
        designation:    h.contactPerson?.designation    || '',
      },
    })
    setModal('edit')
  }

  const initials = (UserAuthData?.name || 'P').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const tabs = [
    { key: 'hospitals', label: 'My Hospitals', icon: Building2 },
    { key: 'profile',   label: 'My Account',   icon: User      },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-900 hidden sm:block">India Top Doctor</span>
            </div>
            <div className="flex items-center gap-1">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${activeTab === key ? 'bg-teal-50 text-teal-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
              <button onClick={logout} title="Logout" className="flex items-center px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {notify.msg && (
          <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 border ${notify.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-teal-50 border-teal-200 text-teal-700'}`}>
            {notify.type === 'error' ? <XCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
            {notify.msg}
          </div>
        )}

        {activeTab === 'hospitals' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={Building2}   label="Total Hospitals" value={hospitals.length} color="text-teal-600 bg-teal-50"       />
              <StatCard icon={Users}       label="Total Doctors"   value={totalDoctors}      color="text-blue-600 bg-blue-50"       />
              <StatCard icon={ShieldCheck} label="Verified"        value={verifiedCount}     color="text-emerald-600 bg-emerald-50" />
              <StatCard icon={Activity}    label="Active"          value={activeCount}       color="text-orange-600 bg-orange-50"   />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name or city..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => refetch()} title="Refresh" className="flex items-center px-3 py-2.5 text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:border-teal-400 transition-all">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setHospitalForm(EMPTY_HOSPITAL_FORM); setModal('create') }}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Hospital
                </button>
              </div>
            </div>

            {hospitalsLoading ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium text-gray-400">Loading hospitals...</p>
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState icon={Building2} title="No hospitals found" subtitle="Add your first hospital to get started" />
            ) : (
              <div className="space-y-4">
                {filtered.map((h) => (
                  <HospitalDetailPanel
                    key={h._id}
                    h={h}
                    onEdit={openEditHospital}
                    onDelete={(h) => { setSelectedHospital(h); setModal('delete') }}
                    onToggle={handleToggle}
                    onVerify={() => {}}
                    onManageDoctors={(h) => { setSelectedHospital(h); setModal('doctors') }}
                    toggling={toggling}
                    verifying={false}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <SectionCard>
              <div className="h-32 bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 relative rounded-t-2xl">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent rounded-t-2xl" />
              </div>
              <div className="px-6 pb-6">
                <div className="flex items-end justify-between -mt-10 mb-5">
                  <div className="relative">
                    <div className="w-20 h-20 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                      {UserAuthData?.profileImage
                        ? <img src={UserAuthData.profileImage} alt="avatar" className="w-full h-full object-cover" />
                        : <span className="text-2xl font-black text-teal-600">{initials}</span>
                      }
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center hover:bg-teal-700 transition-colors shadow-sm">
                      <Camera className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 pb-1">
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full capitalize">
                      {UserAuthData?.role || 'provider'}
                    </span>
                  </div>
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-0.5">{UserAuthData?.name || 'Provider'}</h1>
                <p className="text-sm text-gray-500">{UserAuthData?.email}</p>
              </div>
            </SectionCard>

            <SectionCard>
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-gray-900">Account Information</h3>
                </div>
                <button
                  onClick={() => setEditingSection(editingSection === 'account' ? null : 'account')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
              <div className="px-6 py-2">
                {editingSection === 'account' ? (
                  <form onSubmit={handleUpdateAccount} className="space-y-4 py-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Full Name</FieldLabel>
                        <input type="text" value={accountForm.name} onChange={e => setAccountForm(p => ({ ...p, name: e.target.value }))} className={iClass} />
                      </div>
                      <div>
                        <FieldLabel>Email Address</FieldLabel>
                        <input type="email" value={accountForm.email} onChange={e => setAccountForm(p => ({ ...p, email: e.target.value }))} className={iClass} />
                      </div>
                      <div>
                        <FieldLabel>Phone Number</FieldLabel>
                        <input type="tel" value={accountForm.phone} onChange={e => setAccountForm(p => ({ ...p, phone: e.target.value }))} className={iClass} />
                      </div>
                    </div>
                    <FormButtons onCancel={() => setEditingSection(null)} loading={updatingMe} />
                  </form>
                ) : (
                  <div>
                    <InfoRow icon={Mail}  label="Email Address" value={UserAuthData?.email} />
                    <InfoRow icon={Phone} label="Phone Number"  value={UserAuthData?.phone} />
                    <InfoRow icon={User}  label="Role"          value={UserAuthData?.role}  />
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard>
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-gray-900">Password & Security</h3>
                </div>
                <button
                  onClick={() => setEditingSection(editingSection === 'password' ? null : 'password')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-all"
                >
                  <Key className="w-3.5 h-3.5" /> Change Password
                </button>
              </div>
              <div className="px-6 py-4">
                {editingSection === 'password' ? (
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Current Password</FieldLabel>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={accountForm.currentPassword}
                            onChange={e => setAccountForm(p => ({ ...p, currentPassword: e.target.value }))}
                            className={iClass}
                            placeholder="Enter current password"
                          />
                          <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <FieldLabel>New Password</FieldLabel>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={accountForm.newPassword}
                          onChange={e => setAccountForm(p => ({ ...p, newPassword: e.target.value }))}
                          className={iClass}
                          placeholder="Enter new password"
                        />
                      </div>
                    </div>
                    <FormButtons onCancel={() => setEditingSection(null)} loading={updatingMe} saveLabel="Change Password" />
                  </form>
                ) : (
                  <p className="text-sm text-gray-400 py-1">Keep your account secure by using a strong, unique password.</p>
                )}
              </div>
            </SectionCard>

            <SectionCard>
              <div className="px-6 py-5">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-gray-900">Your Hospitals Overview</h3>
                </div>
                {hospitals.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No hospitals added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {hospitals.map(h => (
                      <div key={h._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-teal-50 transition-colors cursor-pointer" onClick={() => setActiveTab('hospitals')}>
                        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shrink-0 border border-gray-200 overflow-hidden">
                          {h.logo?.url ? <img src={h.logo.url} alt={h.name} className="w-full h-full object-cover" /> : <Building2 className="w-4 h-4 text-teal-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{h.name}</p>
                          <p className="text-xs text-gray-400">{[h.address?.city, h.address?.state].filter(Boolean).join(', ') || 'No location'}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {h.isVerified && <BadgeCheck className="w-4 h-4 text-teal-500" />}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${h.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                            {h.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        )}
      </div>

      {modal === 'create' && (
        <Modal title="Add New Hospital" onClose={closeModal} wide>
          <form onSubmit={handleCreateHospital} className="space-y-4">
            <HospitalFormFields form={hospitalForm} setForm={setHospitalForm} />
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal} className="flex-1 py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">Cancel</button>
              <button type="submit" disabled={creating} className="flex-1 py-3 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all disabled:opacity-50">
                {creating ? 'Creating...' : 'Create Hospital'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'edit' && selectedHospital && (
        <Modal title={`Edit — ${selectedHospital.name}`} onClose={closeModal} wide>
          <form onSubmit={handleUpdateHospital} className="space-y-4">
            <HospitalFormFields form={hospitalForm} setForm={setHospitalForm} />
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal} className="flex-1 py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">Cancel</button>
              <button type="submit" disabled={updating} className="flex-1 py-3 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all disabled:opacity-50">
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'delete' && selectedHospital && (
        <Modal title="Delete Hospital" onClose={closeModal}>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <p className="text-gray-600 font-medium">Permanently delete</p>
              <p className="text-xl font-bold text-red-600 mt-1">"{selectedHospital.name}"</p>
              <p className="text-sm text-gray-400 mt-2">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={closeModal} className="flex-1 py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">Cancel</button>
              <button onClick={() => handleDeleteHospital(selectedHospital._id)} disabled={deleting} className="flex-1 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'doctors' && selectedHospital && (
        <Modal title={`Doctors — ${selectedHospital.name}`} onClose={closeModal} wide>
          <div className="space-y-5">
            <form onSubmit={handleAddDoctor} className="flex gap-2">
              <input
                required
                type="text"
                value={doctorForm.doctorId}
                onChange={e => setDoctorForm({ doctorId: e.target.value })}
                placeholder="Enter Doctor ID to add"
                className={iClass}
              />
              <button type="submit" disabled={addingDoctor} className="shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all disabled:opacity-50">
                <UserPlus className="w-4 h-4" />
                {addingDoctor ? '...' : 'Add'}
              </button>
            </form>

            {selectedHospital.doctors?.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {selectedHospital.doctors.length} Doctor{selectedHospital.doctors.length !== 1 ? 's' : ''}
                </p>
                {selectedHospital.doctors.map((doc) => {
                  const id    = doc._id || doc
                  const name  = doc.basicInfo?.fullName || doc.name || `Doctor ${String(id).slice(-6)}`
                  const spec  = doc.professionalInfo?.specialization || doc.specialization || ''
                  const email = doc.basicInfo?.email || doc.email || ''
                  return (
                    <div key={String(id)} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{name}</p>
                          <div className="flex items-center gap-2">
                            {spec  && <p className="text-xs text-teal-600 font-medium">{spec}</p>}
                            {email && <p className="text-xs text-gray-400">{email}</p>}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveDoctor(String(id))} disabled={removingDoctor} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all disabled:opacity-50">
                        <UserMinus className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState icon={Users} title="No doctors assigned yet" />
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
