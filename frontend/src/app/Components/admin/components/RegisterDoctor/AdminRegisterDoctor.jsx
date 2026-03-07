'use client'

import { useState } from 'react'
import {
  User, Mail, Phone, Lock, MapPin, Stethoscope,
  Briefcase, DollarSign, GraduationCap, ChevronRight,
  ChevronLeft, CheckCircle, Loader2, AlertCircle, Eye,
  EyeOff, UserPlus, Calendar, Hash, Clock, Plus, Trash2,
  Camera, Shield,
} from 'lucide-react'
import { useAuth } from '@/app/hooks/useAuth'

const SPECIALIZATIONS = [
  'General Physician', 'Cardiologist', 'Dermatologist', 'Neurologist',
  'Orthopedic', 'Pediatrician', 'Gynecologist', 'Psychiatrist',
  'Ophthalmologist', 'ENT Specialist', 'Urologist', 'Oncologist',
  'Endocrinologist', 'Pulmonologist', 'Rheumatologist', 'Nephrologist',
]

const QUALIFICATIONS = [
  'MBBS', 'MD', 'MS', 'BDS', 'MDS', 'DNB', 'DM', 'MCh',
  'MBBS + MD', 'MBBS + MS', 'MBBS + DNB',
]

const GENDERS = ['Male', 'Female', 'Other']
const DAYS    = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const STEPS = [
  { id: 1, label: 'Basic Info',   icon: User        },
  { id: 2, label: 'Professional', icon: Stethoscope },
  { id: 3, label: 'Availability', icon: Clock       },
  { id: 4, label: 'Security',     icon: Shield      },
]

const initialBasicInfo = {
  fullName: '', email: '', phone: '', gender: '', dob: '', profileImage: '',
}

const initialProfessionalInfo = {
  specialization: '', qualification: '', experience: '', licenseNumber: '', consultationFee: '',
}

const initialAvailability = {
  startTime: '',
  endTime: '',
  workingDays: [],
  location: {
    address: '',
    city: '',
    state: '',
    country: 'India',
    coordinates: {
      type: 'Point',
      coordinates: [0, 0],
    },
  },
}

const initialPasswords = { password: '', confirmPassword: '' }

function FieldLabel({ children, required }) {
  return (
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  )
}

function InputField({ icon: Icon, error, ...props }) {
  return (
    <div>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        )}
        <input
          {...props}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl border text-sm text-slate-800 bg-slate-50 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
            error
              ? 'border-red-300 focus:ring-red-400'
              : 'border-slate-200 focus:ring-teal-400 focus:border-teal-400'
          }`}
        />
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}
    </div>
  )
}

function SelectField({ icon: Icon, error, children, ...props }) {
  return (
    <div>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        )}
        <select
          {...props}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl border text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:bg-white appearance-none cursor-pointer transition-all ${
            error
              ? 'border-red-300 focus:ring-red-400'
              : 'border-slate-200 focus:ring-teal-400 focus:border-teal-400'
          }`}
        >
          {children}
        </select>
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}
    </div>
  )
}

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-between mb-8 px-2">
      {STEPS.map((step, idx) => {
        const Icon        = step.icon
        const isCompleted = currentStep > step.id
        const isActive    = currentStep === step.id
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isCompleted ? 'bg-teal-500 shadow-md shadow-teal-500/30' :
                isActive    ? 'bg-teal-600 shadow-lg shadow-teal-600/30 scale-110' :
                              'bg-slate-100'
              }`}>
                {isCompleted
                  ? <CheckCircle className="w-5 h-5 text-white" />
                  : <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                }
              </div>
              <span className={`text-[10px] font-bold whitespace-nowrap ${
                isActive ? 'text-teal-600' : isCompleted ? 'text-teal-500' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all duration-300 ${
                currentStep > step.id ? 'bg-teal-400' : 'bg-slate-200'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function AdminRegisterDoctor() {
  const { signUp } = useAuth()

  const [step,             setStep]             = useState(1)
  const [basicInfo,        setBasicInfo]        = useState(initialBasicInfo)
  const [professionalInfo, setProfessionalInfo] = useState(initialProfessionalInfo)
  const [availabilityList, setAvailabilityList] = useState([{ ...initialAvailability, location: { ...initialAvailability.location, coordinates: { type: 'Point', coordinates: [0, 0] } } }])
  const [passwords,        setPasswords]        = useState(initialPasswords)
  const [errors,           setErrors]           = useState({})
  const [loading,          setLoading]          = useState(false)
  const [success,          setSuccess]          = useState(false)
  const [apiError,         setApiError]         = useState('')
  const [showPass,         setShowPass]         = useState(false)
  const [showConfirm,      setShowConfirm]      = useState(false)
  const [imagePreview,     setImagePreview]     = useState('')

  const updateBasic        = (f) => (e) => setBasicInfo(p => ({ ...p, [f]: e.target.value }))
  const updateProfessional = (f) => (e) => setProfessionalInfo(p => ({ ...p, [f]: e.target.value }))
  const updatePassword     = (f) => (e) => setPasswords(p => ({ ...p, [f]: e.target.value }))

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
      setBasicInfo(p => ({ ...p, profileImage: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  const updateSlot = (idx, field, value) =>
    setAvailabilityList(prev => prev.map((slot, i) =>
      i === idx ? { ...slot, [field]: value } : slot
    ))

  const updateSlotLocation = (idx, field, value) =>
    setAvailabilityList(prev => prev.map((slot, i) =>
      i === idx
        ? { ...slot, location: { ...slot.location, [field]: value } }
        : slot
    ))

  const toggleDay = (idx, day) =>
    setAvailabilityList(prev => prev.map((slot, i) => {
      if (i !== idx) return slot
      const days = slot.workingDays.includes(day)
        ? slot.workingDays.filter(d => d !== day)
        : [...slot.workingDays, day]
      return { ...slot, workingDays: days }
    }))

  const addSlot = () =>
    setAvailabilityList(p => [
      ...p,
      {
        ...initialAvailability,
        location: {
          ...initialAvailability.location,
          coordinates: { type: 'Point', coordinates: [0, 0] },
        },
      },
    ])

  const removeSlot = (idx) =>
    setAvailabilityList(p => p.filter((_, i) => i !== idx))

  const validateStep = () => {
    const e = {}
    if (step === 1) {
      if (!basicInfo.fullName.trim())                  e.fullName = 'Full name is required'
      if (!basicInfo.email.trim())                     e.email    = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(basicInfo.email)) e.email    = 'Invalid email address'
      if (!basicInfo.phone.trim())                     e.phone    = 'Phone is required'
      if (!basicInfo.gender)                           e.gender   = 'Gender is required'
    }
    if (step === 2) {
      if (!professionalInfo.specialization)  e.specialization  = 'Specialization is required'
      if (!professionalInfo.qualification)   e.qualification   = 'Qualification is required'
      if (!professionalInfo.experience)      e.experience      = 'Experience is required'
      if (!professionalInfo.consultationFee) e.consultationFee = 'Consultation fee is required'
    }
    if (step === 4) {
      if (!passwords.password)                e.password = 'Password is required'
      else if (passwords.password.length < 6) e.password = 'Minimum 6 characters required'
      if (passwords.password !== passwords.confirmPassword) e.confirmPassword = 'Passwords do not match'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => { if (validateStep()) setStep(s => s + 1) }
  const handleBack = () => { setErrors({}); setStep(s => s - 1) }

  const handleSubmit = async () => {
    if (!validateStep()) return
    setLoading(true)
    setApiError('')

    const sanitizedAvailability = availabilityList
      .filter(s => s.startTime && s.endTime && s.workingDays.length > 0)
      .map(slot => ({
        ...slot,
        location: {
          ...slot.location,
          coordinates: {
            type: 'Point',
            coordinates:
              Array.isArray(slot.location?.coordinates?.coordinates) &&
              slot.location.coordinates.coordinates.length === 2
                ? slot.location.coordinates.coordinates
                : [0, 0],
          },
        },
      }))

    const payload = {
      basicInfo,
      professionalInfo: {
        ...professionalInfo,
        experience:      Number(professionalInfo.experience),
        consultationFee: Number(professionalInfo.consultationFee),
      },
      availability:    sanitizedAvailability,
      password:        passwords.password,
      role:            'doctor',
      isAdminCreating: true,
    }

    try {
      const res = await signUp(payload, 'doctor')
      if (res?.status === 201 && res?.data?.success) {
        setSuccess(true)
      } else {
        setApiError(res?.data?.msg || 'Registration failed. Please try again.')
      }
    } catch {
      setApiError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep(1)
    setBasicInfo(initialBasicInfo)
    setProfessionalInfo(initialProfessionalInfo)
    setAvailabilityList([{
      ...initialAvailability,
      location: { ...initialAvailability.location, coordinates: { type: 'Point', coordinates: [0, 0] } },
    }])
    setPasswords(initialPasswords)
    setErrors({})
    setSuccess(false)
    setApiError('')
    setImagePreview('')
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-teal-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Doctor Registered!</h2>
          <p className="text-slate-500 text-sm mb-8">
            The doctor account has been successfully created. They can now log in with their credentials.
          </p>
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold rounded-2xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/20"
          >
            <UserPlus className="w-4 h-4" />
            Register Another Doctor
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 px-4 py-8">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/15 border border-teal-400/25 rounded-full text-teal-300 text-xs font-semibold mb-3">
            <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
            Admin Panel
          </div>
          <h1 className="text-3xl font-black text-white">Register New Doctor</h1>
          <p className="text-slate-400 text-sm mt-2">Fill in the details to create a doctor account</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4 pb-12">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">

          <StepIndicator currentStep={step} />

          {apiError && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {apiError}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
                    {imagePreview
                      ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      : <User className="w-10 h-10 text-slate-300" />
                    }
                  </div>
                  <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-teal-500 rounded-xl flex items-center justify-center cursor-pointer hover:bg-teal-600 transition shadow-md">
                    <Camera className="w-4 h-4 text-white" />
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
                <p className="text-xs text-slate-400 font-medium">Upload profile photo (optional)</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Full Name</FieldLabel>
                  <InputField icon={User} placeholder="Dr. Full Name" value={basicInfo.fullName} onChange={updateBasic('fullName')} error={errors.fullName} />
                </div>
                <div>
                  <FieldLabel required>Email Address</FieldLabel>
                  <InputField icon={Mail} type="email" placeholder="doctor@example.com" value={basicInfo.email} onChange={updateBasic('email')} error={errors.email} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Phone Number</FieldLabel>
                  <InputField icon={Phone} type="tel" placeholder="+91 XXXXX XXXXX" value={basicInfo.phone} onChange={updateBasic('phone')} error={errors.phone} />
                </div>
                <div>
                  <FieldLabel required>Gender</FieldLabel>
                  <SelectField icon={User} value={basicInfo.gender} onChange={updateBasic('gender')} error={errors.gender}>
                    <option value="">Select Gender</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </SelectField>
                </div>
              </div>

              <div>
                <FieldLabel>Date of Birth</FieldLabel>
                <InputField icon={Calendar} type="date" value={basicInfo.dob} onChange={updateBasic('dob')} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Specialization</FieldLabel>
                  <SelectField icon={Stethoscope} value={professionalInfo.specialization} onChange={updateProfessional('specialization')} error={errors.specialization}>
                    <option value="">Select Specialization</option>
                    {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </SelectField>
                </div>
                <div>
                  <FieldLabel required>Qualification</FieldLabel>
                  <SelectField icon={GraduationCap} value={professionalInfo.qualification} onChange={updateProfessional('qualification')} error={errors.qualification}>
                    <option value="">Select Qualification</option>
                    {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                  </SelectField>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Experience (years)</FieldLabel>
                  <InputField icon={Briefcase} type="number" min="0" max="60" placeholder="e.g. 5" value={professionalInfo.experience} onChange={updateProfessional('experience')} error={errors.experience} />
                </div>
                <div>
                  <FieldLabel required>Consultation Fee (₹)</FieldLabel>
                  <InputField icon={DollarSign} type="number" min="0" placeholder="e.g. 500" value={professionalInfo.consultationFee} onChange={updateProfessional('consultationFee')} error={errors.consultationFee} />
                </div>
              </div>

              <div>
                <FieldLabel>License Number</FieldLabel>
                <InputField icon={Hash} placeholder="Medical license number" value={professionalInfo.licenseNumber} onChange={updateProfessional('licenseNumber')} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              {availabilityList.map((slot, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">Slot {idx + 1}</span>
                    {availabilityList.length > 1 && (
                      <button onClick={() => removeSlot(idx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Start Time</FieldLabel>
                      <InputField icon={Clock} type="time" value={slot.startTime} onChange={e => updateSlot(idx, 'startTime', e.target.value)} />
                    </div>
                    <div>
                      <FieldLabel>End Time</FieldLabel>
                      <InputField icon={Clock} type="time" value={slot.endTime} onChange={e => updateSlot(idx, 'endTime', e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Working Days</FieldLabel>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {DAYS.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(idx, day)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            slot.workingDays.includes(day)
                              ? 'bg-teal-500 border-teal-400 text-white shadow-md shadow-teal-500/20'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-teal-300'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Clinic Address</FieldLabel>
                    <InputField icon={MapPin} placeholder="Street address" value={slot.location.address} onChange={e => updateSlotLocation(idx, 'address', e.target.value)} />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>City</FieldLabel>
                      <InputField placeholder="City" value={slot.location.city} onChange={e => updateSlotLocation(idx, 'city', e.target.value)} />
                    </div>
                    <div>
                      <FieldLabel>State</FieldLabel>
                      <InputField placeholder="State" value={slot.location.state} onChange={e => updateSlotLocation(idx, 'state', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addSlot}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-teal-300 text-teal-600 font-semibold text-sm rounded-2xl hover:bg-teal-50 hover:border-teal-400 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Another Slot
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-amber-700 text-xs leading-relaxed">
                  Share this password with the doctor securely. They can change it after their first login.
                </p>
              </div>

              <div>
                <FieldLabel required>Password</FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={passwords.password}
                    onChange={updatePassword('password')}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-slate-800 bg-slate-50 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                      errors.password ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-teal-400 focus:border-teal-400'
                    }`}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{errors.password}
                  </p>
                )}
              </div>

              <div>
                <FieldLabel required>Confirm Password</FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={passwords.confirmPassword}
                    onChange={updatePassword('confirmPassword')}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-slate-800 bg-slate-50 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                      errors.confirmPassword ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-teal-400 focus:border-teal-400'
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Review Summary</p>
                <div className="space-y-2">
                  {[
                    { label: 'Name',           value: basicInfo.fullName                                                              },
                    { label: 'Email',          value: basicInfo.email                                                                 },
                    { label: 'Phone',          value: basicInfo.phone                                                                 },
                    { label: 'Gender',         value: basicInfo.gender                                                                },
                    { label: 'Specialization', value: professionalInfo.specialization                                                 },
                    { label: 'Qualification',  value: professionalInfo.qualification                                                  },
                    { label: 'Experience',     value: professionalInfo.experience ? `${professionalInfo.experience} yrs`      : '—'  },
                    { label: 'Fee',            value: professionalInfo.consultationFee ? `₹${professionalInfo.consultationFee}` : '—' },
                    { label: 'Slots',          value: `${availabilityList.length} slot(s) configured`                                },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-medium">{label}</span>
                      <span className="text-slate-700 font-semibold text-right max-w-[60%] truncate">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <div className="flex items-center gap-1.5">
              {STEPS.map(s => (
                <div key={s.id} className={`rounded-full transition-all duration-300 ${
                  step === s.id ? 'w-6 h-2 bg-teal-500' : step > s.id ? 'w-2 h-2 bg-teal-300' : 'w-2 h-2 bg-slate-200'
                }`} />
              ))}
            </div>

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold text-sm rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-md shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-md shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Registering...</>
                  : <><UserPlus className="w-4 h-4" /> Register Doctor</>
                }
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
