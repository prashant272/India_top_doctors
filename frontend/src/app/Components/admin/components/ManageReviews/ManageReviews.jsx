'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Star, Trash2, Loader2, Search, Filter, ChevronDown,
  CheckCircle, AlertCircle, X, RefreshCw, Stethoscope,
  Globe, MessageSquare, TrendingUp
} from 'lucide-react'
import { useReview } from '@/app/hooks/useReview'

function StarDisplay({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= value ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
      ))}
    </div>
  )
}

function getPatientName(review) {
  return review.patient?.basicInfo?.fullName || review.patient?.name || 'Anonymous'
}

function getDoctorName(review) {
  return review.doctor?.basicInfo?.fullName || review.doctor?.name || '—'
}

function UserAvatar({ name }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'
  const colors = ['from-teal-400 to-teal-600', 'from-blue-400 to-blue-600', 'from-violet-400 to-violet-600', 'from-orange-400 to-orange-600', 'from-rose-400 to-rose-600']
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0
  return (
    <div className={`w-10 h-10 text-xs rounded-xl bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center font-black text-white flex-shrink-0`}>
      {initials}
    </div>
  )
}

function TypeBadge({ type }) {
  if (type === 'doctor') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] bg-teal-50 text-teal-600 border border-teal-200 px-2 py-0.5 rounded-full font-bold">
        <Stethoscope className="w-2.5 h-2.5" /> Doctor
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] bg-violet-50 text-violet-600 border border-violet-200 px-2 py-0.5 rounded-full font-bold">
      <Globe className="w-2.5 h-2.5" /> Platform
    </span>
  )
}

function DeleteConfirmModal({ review, onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-8 h-8 text-rose-500" />
        </div>
        <h3 className="text-lg font-black text-slate-800 mb-1">Delete This Review?</h3>
        <p className="text-slate-500 text-sm mb-1">By <span className="font-semibold text-slate-700">{getPatientName(review)}</span></p>
        <p className="text-slate-400 text-xs mb-6 line-clamp-2 italic">"{review.reviewText}"</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-semibold text-sm rounded-2xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {loading ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ReviewRow({ review, onDelete }) {
  const formatDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start gap-3">
        <UserAvatar name={getPatientName(review)} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-bold text-slate-800 text-sm">{getPatientName(review)}</span>
            {review.isVerified && (
              <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded-full font-semibold">
                <CheckCircle className="w-2.5 h-2.5" /> Verified
              </span>
            )}
            <TypeBadge type={review.type} />
            <span className="text-[10px] text-slate-400 ml-auto">{formatDate(review.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <StarDisplay value={review.rating} />
            <span className="text-xs text-slate-400 font-medium">{review.rating}.0</span>
            {review.type === 'doctor' && review.doctor && (
              <span className="text-[11px] text-slate-400">
                → <span className="text-slate-600 font-semibold">Dr. {getDoctorName(review)}</span>
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{review.reviewText}</p>
        </div>
        <button
          onClick={() => onDelete(review)}
          className="w-9 h-9 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    teal:   { bg: 'bg-teal-50',   text: 'text-teal-600',   icon: 'text-teal-500'   },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', icon: 'text-violet-500' },
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-600',  icon: 'text-amber-500'  },
    slate:  { bg: 'bg-slate-50',  text: 'text-slate-600',  icon: 'text-slate-500'  },
  }
  const c = colorMap[color] || colorMap.slate
  return (
    <div className={`${c.bg} rounded-2xl p-4 flex items-center gap-3`}>
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div>
        <p className="text-2xl font-black text-slate-800 leading-none">{value}</p>
        <p className={`text-xs font-semibold ${c.text} mt-0.5`}>{label}</p>
      </div>
    </div>
  )
}

const FILTER_TYPES = [
  { key: 'all',      label: 'All Reviews',      icon: MessageSquare },
  { key: 'doctor',   label: 'Doctor Reviews',   icon: Stethoscope   },
  { key: 'platform', label: 'Platform Reviews', icon: Globe         },
]

const RATING_OPTIONS = ['All Ratings', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star']
const SORT_OPTIONS = [
  { key: 'newest',  label: 'Newest First'   },
  { key: 'oldest',  label: 'Oldest First'   },
  { key: 'highest', label: 'Highest Rating' },
  { key: 'lowest',  label: 'Lowest Rating'  },
]

export default function ManageReviews() {
  const { handleGetAllReviews, handleDeleteReview } = useReview()

  const [allReviews,    setAllReviews]    = useState([])
  const [pageLoading,   setPageLoading]   = useState(true)
  const [deleteTarget,  setDeleteTarget]  = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toast,         setToast]         = useState(null)
  const [typeFilter,    setTypeFilter]    = useState('all')
  const [ratingFilter,  setRatingFilter]  = useState('All Ratings')
  const [sortBy,        setSortBy]        = useState('newest')
  const [search,        setSearch]        = useState('')
  const [showFilters,   setShowFilters]   = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchAll = useCallback(async () => {
    setPageLoading(true)
    try {
      const res = await handleGetAllReviews()
      setAllReviews(res?.reviews ?? [])
    } catch {
      setAllReviews([])
      showToast('Failed to load reviews.', 'error')
    } finally {
      setPageLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await handleDeleteReview(deleteTarget._id)
      setAllReviews(prev => prev.filter(r => r._id !== deleteTarget._id))
      setDeleteTarget(null)
      showToast('Review deleted successfully.')
    } catch (e) {
      showToast(e?.response?.data?.message || e.message || 'Failed to delete review.', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const totalDoctor   = allReviews.filter(r => r.type === 'doctor').length
  const totalPlatform = allReviews.filter(r => r.type === 'platform').length
  const avgRating     = allReviews.length
    ? (allReviews.reduce((s, r) => s + (r.rating || 0), 0) / allReviews.length).toFixed(1)
    : '0.0'

  const filtered = allReviews
    .filter(r => {
      if (typeFilter !== 'all' && r.type !== typeFilter) return false
      if (ratingFilter !== 'All Ratings' && r.rating !== parseInt(ratingFilter)) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        if (
          !getPatientName(r).toLowerCase().includes(q) &&
          !r.reviewText?.toLowerCase().includes(q) &&
          !getDoctorName(r).toLowerCase().includes(q)
        ) return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'newest')  return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'oldest')  return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === 'highest') return b.rating - a.rating
      if (sortBy === 'lowest')  return a.rating - b.rating
      return 0
    })

  const activeFilterCount = [
    typeFilter !== 'all',
    ratingFilter !== 'All Ratings',
    sortBy !== 'newest',
  ].filter(Boolean).length

  return (
    <>
      {deleteTarget && (
        <DeleteConfirmModal
          review={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}

      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold transition-all ${toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="max-w-5xl mx-auto space-y-6">

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-black text-slate-800">Manage Reviews</h1>
              <p className="text-slate-500 text-sm mt-0.5">Monitor, filter and remove patient reviews</p>
            </div>
            <button
              onClick={fetchAll}
              disabled={pageLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-semibold text-sm rounded-2xl hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${pageLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={MessageSquare} label="Total Reviews"    value={allReviews.length} color="slate"  />
            <StatCard icon={Stethoscope}   label="Doctor Reviews"   value={totalDoctor}       color="teal"   />
            <StatCard icon={Globe}         label="Platform Reviews" value={totalPlatform}     color="violet" />
            <StatCard icon={TrendingUp}    label="Avg Rating"       value={avgRating}         color="amber"  />
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4">
            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-48 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by patient, doctor or review text..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 transition-colors"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl text-sm font-semibold transition-colors ${showFilters || activeFilterCount > 0 ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 bg-teal-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Rating</label>
                  <div className="flex flex-wrap gap-2">
                    {RATING_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setRatingFilter(opt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${ratingFilter === opt ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Sort By</label>
                  <div className="flex flex-wrap gap-2">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => setSortBy(opt.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${sortBy === opt.key ? 'bg-teal-50 border-teal-300 text-teal-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {FILTER_TYPES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTypeFilter(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${typeFilter === key ? 'bg-slate-800 border-slate-800 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${typeFilter === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {key === 'all' ? allReviews.length : allReviews.filter(r => r.type === key).length}
                </span>
              </button>
            ))}
          </div>

          {!pageLoading && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing <span className="font-bold text-slate-700">{filtered.length}</span> of <span className="font-bold text-slate-700">{allReviews.length}</span> reviews
              </p>
              {(search || activeFilterCount > 0) && (
                <button
                  onClick={() => { setSearch(''); setTypeFilter('all'); setRatingFilter('All Ratings'); setSortBy('newest') }}
                  className="text-xs text-rose-500 font-semibold hover:text-rose-600 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear All Filters
                </button>
              )}
            </div>
          )}

          {pageLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-slate-200 rounded w-1/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/3" />
                      <div className="h-3 bg-slate-100 rounded w-full" />
                      <div className="h-3 bg-slate-100 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-14 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-8 h-8 text-slate-300" />
              </div>
              <h4 className="text-slate-600 font-bold mb-1">No Reviews Found</h4>
              <p className="text-slate-400 text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(review => (
                <ReviewRow
                  key={review._id}
                  review={review}
                  onDelete={r => setDeleteTarget(r)}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  )
}
