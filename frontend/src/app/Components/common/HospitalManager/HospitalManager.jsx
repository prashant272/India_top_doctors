'use client'

import { useState } from 'react'
import {
  Plus, Pencil, Trash2, CheckCircle, ToggleLeft, ToggleRight,
  UserPlus, UserMinus, MapPin, Phone, Mail, Building2, Search,
  ChevronLeft, ChevronRight, X, Stethoscope, Loader2, ShieldCheck,
} from 'lucide-react'
import {
  useGetHospitals,
  useCreateHospital,
  useUpdateHospital,
  useDeleteHospital,
  useVerifyHospital,
  useToggleActiveStatus,
  useAddDoctor,
  useRemoveDoctor,
} from '@/app/hooks/useHospital'

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  alternatePhone: '',
  departments: '',
  facilities: '',
  address: {
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  },
}

export default function HospitalManager() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [verifiedFilter, setVerifiedFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingHospital, setEditingHospital] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [deleteModal, setDeleteModal] = useState(null)
  const [doctorModal, setDoctorModal] = useState(null)
  const [doctorInput, setDoctorInput] = useState('')
  const [doctorAction, setDoctorAction] = useState('add')

  const { data, isLoading } = useGetHospitals({
    page,
    limit: 8,
    city: cityFilter || undefined,
    verified: verifiedFilter || undefined,
  })

  const { mutate: createHospital, isPending: creating } = useCreateHospital()
  const { mutate: updateHospital, isPending: updating } = useUpdateHospital()
  const { mutate: deleteHospital, isPending: deleting } = useDeleteHospital()
  const { mutate: verifyHospital, isPending: verifying } = useVerifyHospital()
  const { mutate: toggleActive, isPending: toggling } = useToggleActiveStatus()
  const { mutate: addDoctor, isPending: addingDoctor } = useAddDoctor()
  const { mutate: removeDoctor, isPending: removingDoctor } = useRemoveDoctor()

  const hospitals = data?.hospitals || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / 8)

  const handleOpenCreate = () => {
    setEditingHospital(null)
    setForm(INITIAL_FORM)
    setShowForm(true)
  }

  const handleOpenEdit = (hospital) => {
    setEditingHospital(hospital)
    setForm({
      name: hospital.name || '',
      email: hospital.email || '',
      phone: hospital.phone || '',
      alternatePhone: hospital.alternatePhone || '',
      departments: hospital.departments?.join(', ') || '',
      facilities: hospital.facilities?.join(', ') || '',
      address: {
        street: hospital.address?.street || '',
        city: hospital.address?.city || '',
        state: hospital.address?.state || '',
        pincode: hospital.address?.pincode || '',
        country: hospital.address?.country || 'India',
      },
    })
    setShowForm(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('address.')) {
      const key = name.split('.')[1]
      setForm((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      departments: form.departments.split(',').map((d) => d.trim()).filter(Boolean),
      facilities: form.facilities.split(',').map((f) => f.trim()).filter(Boolean),
    }
    if (editingHospital) {
      updateHospital(
        { id: editingHospital._id, body: payload },
        { onSuccess: () => setShowForm(false) }
      )
    } else {
      createHospital(payload, { onSuccess: () => setShowForm(false) })
    }
  }

  const handleDoctorAction = () => {
    if (!doctorInput.trim()) return
    const args = { hospitalId: doctorModal._id, doctorId: doctorInput.trim() }
    if (doctorAction === 'add') {
      addDoctor(args, { onSuccess: () => { setDoctorModal(null); setDoctorInput('') } })
    } else {
      removeDoctor(args, { onSuccess: () => { setDoctorModal(null); setDoctorInput('') } })
    }
  }

  const filtered = hospitals.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-7 h-7 text-teal-600" />
              Hospital Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">{total} hospitals registered</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> Add Hospital
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search hospitals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <input
            type="text"
            placeholder="Filter by city"
            value={cityFilter}
            onChange={(e) => { setCityFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-[140px]"
          />
          <select
            value={verifiedFilter}
            onChange={(e) => { setVerifiedFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Status</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Building2 className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-lg font-medium">No hospitals found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((hospital) => (
              <div
                key={hospital._id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-800 truncate">{hospital.name}</h3>
                      {hospital.isVerified && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full font-medium ${
                        hospital.isActive
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {hospital.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(hospital)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-teal-600 transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteModal(hospital)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{hospital.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{hospital.phone}</span>
                  </div>
                  {hospital.address?.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{hospital.address.city}, {hospital.address.state}</span>
                    </div>
                  )}
                  {hospital.departments?.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{hospital.departments.join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-500">
                  {hospital.doctors?.length || 0} doctor(s) assigned
                </div>

                <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                  {!hospital.isVerified && (
                    <button
                      onClick={() => verifyHospital(hospital._id)}
                      disabled={verifying}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 font-medium transition-all disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Verify
                    </button>
                  )}
                  <button
                    onClick={() => toggleActive(hospital._id)}
                    disabled={toggling}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all disabled:opacity-50"
                  >
                    {hospital.isActive
                      ? <ToggleRight className="w-3.5 h-3.5" />
                      : <ToggleLeft className="w-3.5 h-3.5" />}
                    {hospital.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => { setDoctorModal(hospital); setDoctorAction('add') }}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Doctor
                  </button>
                  <button
                    onClick={() => { setDoctorModal(hospital); setDoctorAction('remove') }}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 font-medium transition-all"
                  >
                    <UserMinus className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-600 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {editingHospital ? 'Update Hospital' : 'Add New Hospital'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Hospital Name *', name: 'name', required: true },
                  { label: 'Email *', name: 'email', type: 'email', required: true },
                  { label: 'Phone *', name: 'phone', required: true },
                  { label: 'Alternate Phone', name: 'alternatePhone' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                      {field.label}
                    </label>
                    <input
                      type={field.type || 'text'}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      required={field.required}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 mb-3">Address</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Street', name: 'address.street' },
                    { label: 'City', name: 'address.city' },
                    { label: 'State', name: 'address.state' },
                    { label: 'Pincode', name: 'address.pincode' },
                    { label: 'Country', name: 'address.country' },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="text-xs text-slate-500 mb-1 block">{field.label}</label>
                      <input
                        type="text"
                        name={field.name}
                        value={field.name.startsWith('address.') ? form.address[field.name.split('.')[1]] : form[field.name]}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  Departments <span className="font-normal text-slate-400">(comma separated)</span>
                </label>
                <input
                  type="text"
                  name="departments"
                  value={form.departments}
                  onChange={handleChange}
                  placeholder="Cardiology, Neurology, Orthopedic"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  Facilities <span className="font-normal text-slate-400">(comma separated)</span>
                </label>
                <input
                  type="text"
                  name="facilities"
                  value={form.facilities}
                  onChange={handleChange}
                  placeholder="ICU, OT, Blood Bank, Pharmacy"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {(creating || updating) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingHospital ? 'Update Hospital' : 'Create Hospital'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Delete Hospital</h3>
                <p className="text-sm text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-800">{deleteModal.name}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  deleteHospital(deleteModal._id, { onSuccess: () => setDeleteModal(null) })
                }
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {doctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">
                {doctorAction === 'add' ? 'Add Doctor' : 'Remove Doctor'}
              </h3>
              <button
                onClick={() => { setDoctorModal(null); setDoctorInput('') }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-500">
              Hospital: <span className="font-semibold text-slate-700">{doctorModal.name}</span>
            </p>
            <div className="flex gap-2">
              {['add', 'remove'].map((a) => (
                <button
                  key={a}
                  onClick={() => setDoctorAction(a)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    doctorAction === a
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {a === 'add' ? 'Add' : 'Remove'}
                </button>
              ))}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Doctor ID</label>
              <input
                type="text"
                value={doctorInput}
                onChange={(e) => setDoctorInput(e.target.value)}
                placeholder="Enter doctor ObjectId"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              onClick={handleDoctorAction}
              disabled={addingDoctor || removingDoctor || !doctorInput.trim()}
              className={`w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${
                doctorAction === 'add'
                  ? 'bg-teal-600 hover:bg-teal-700'
                  : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {(addingDoctor || removingDoctor) && <Loader2 className="w-4 h-4 animate-spin" />}
              {doctorAction === 'add' ? 'Add Doctor' : 'Remove Doctor'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
