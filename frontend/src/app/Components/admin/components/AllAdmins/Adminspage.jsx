'use client'

import { useEffect, useState } from 'react'
import { Shield, Trash2, Search, RefreshCw, UserCog, Mail, Calendar, AlertTriangle, X, ChevronLeft, ChevronRight } from 'lucide-react'
import useAdmin from '@/app/hooks/useAdmin'

function DeleteModal({ admin, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border border-red-100">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 mx-auto mb-5">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-black text-gray-900 text-center mb-2">Remove Admin Access</h3>
        <p className="text-gray-500 text-center text-sm mb-6 leading-relaxed">
          Are you sure you want to remove <span className="font-bold text-gray-800">{admin?.name || admin?.email}</span> from admin panel? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

function AdminCard({ admin, onDelete }) {
  const initials = (admin?.fullName || admin?.email || 'A').slice(0, 2).toUpperCase()
  const colors = ['bg-violet-100 text-violet-700', 'bg-sky-100 text-sky-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700']
  const color = colors[(admin?.fullName || admin?.email || '').charCodeAt(0) % colors.length]

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center font-black text-lg flex-shrink-0`}>
            {admin?.profileImage
              ? <img src={admin.profileImage} alt="" className="w-full h-full object-cover rounded-2xl" />
              : initials
            }
          </div>
          <div>
            <p className="font-black text-gray-900 text-base">{admin?.fullName
 || 'Unnamed Admin'}</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full mt-1">
              <Shield className="w-3 h-3" />
              {admin?.role || 'Admin'}
            </span>
          </div>
        </div>
        <button
          onClick={() => onDelete(admin)}
          className="w-9 h-9 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all duration-200"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Mail className="w-4 h-4 text-gray-300 flex-shrink-0" />
          <span className="truncate">{admin?.email || '—'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4 text-gray-300 flex-shrink-0" />
          <span>Joined {admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
        </div>
      </div>

      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${admin?.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
        <span className={`w-2 h-2 rounded-full ${admin?.isActive !== false ? 'bg-emerald-500' : 'bg-gray-400'}`} />
        {admin?.isActive !== false ? 'Active' : 'Inactive'}
      </div>
    </div>
  )
}

const PAGE_SIZE = 12

export default function AdminsPage() {
  const { admins, loadingAdmins, error, fetchAllAdmins, removeAdminById } = useAdmin()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [page, setPage] = useState(1)


  useEffect(() => { fetchAllAdmins() }, [fetchAllAdmins])

  const filtered = admins.filter(a =>
    (a?.fullName
 || '').toLowerCase().includes(search.toLowerCase()) ||
    (a?.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (a?.role || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await removeAdminById(deleteTarget._id)
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      {deleteTarget && (
        <DeleteModal
          admin={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/30">
                <UserCog className="w-5 h-5 text-white" />
              </div>
              Admins
            </h1>
            <p className="text-sm text-gray-400 font-medium mt-1">{admins.length} total administrators</p>
          </div>
          <button
            onClick={fetchAllAdmins}
            disabled={loadingAdmins}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loadingAdmins ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name, email or role..."
            className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-800 font-medium placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm font-semibold">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {loadingAdmins ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 animate-pulse">
                <div className="flex gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
                    <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded-lg" />
                  <div className="h-3 bg-gray-100 rounded-lg w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-24">
            <UserCog className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold text-lg">No admins found</p>
            <p className="text-gray-300 text-sm mt-1">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {paginated.map(admin => (
              <AdminCard key={admin._id} admin={admin} onDelete={setDeleteTarget} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${page === i + 1 ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30' : 'border border-gray-200 text-gray-500 hover:bg-gray-100'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}