'use client'

import { useState, useEffect, useContext, useCallback } from 'react'
import { AuthContext } from '@/app/context/AuthContext'
import {
  Star, MessageCircle, BarChart2, Clock,
  CheckCircle, Loader2, RefreshCw, Search, Filter, X,
  ChevronDown, ChevronUp, Smile, Meh, Frown, ThumbsUp,
  Shield, Trash2,
} from 'lucide-react'
import { useReview } from '@/app/hooks/useReview'

function getPatientName(review) {
  return (
    review.patient?.basicInfo?.fullName ||
    review.patient?.name ||
    review.patientName ||
    'Anonymous'
  )
}

function getPatientImage(review) {
  return review.patient?.basicInfo?.profileImage || null
}

function UserInitialAvatar({ name, image }) {
  const [imgError, setImgError] = useState(false)
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'
  const colors = [
    'from-teal-400 to-teal-600', 'from-blue-400 to-blue-600',
    'from-violet-400 to-violet-600', 'from-orange-400 to-orange-600',
    'from-rose-400 to-rose-600', 'from-emerald-400 to-emerald-600',
  ]
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0

  if (image && !imgError) {
    return (
      <img
        src={image}
        alt={name}
        className="w-11 h-11 rounded-2xl object-cover flex-shrink-0"
        onError={() => setImgError(true)}
      />
    )
  }
  return (
    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center font-black text-white text-sm flex-shrink-0`}>
      {initials}
    </div>
  )
}

function StarDisplay({ value, size = 'sm' }) {
  const starSize = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star key={star} className={`${starSize} ${star <= value ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
      ))}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, colorKey }) {
  const palettes = {
    amber:  { wrap: 'bg-amber-50  border-amber-100',  icon: 'bg-amber-100  text-amber-600',  val: 'text-amber-700'  },
    teal:   { wrap: 'bg-teal-50   border-teal-100',   icon: 'bg-teal-100   text-teal-600',   val: 'text-teal-700'   },
    blue:   { wrap: 'bg-blue-50   border-blue-100',   icon: 'bg-blue-100   text-blue-600',   val: 'text-blue-700'   },
    violet: { wrap: 'bg-violet-50 border-violet-100', icon: 'bg-violet-100 text-violet-600', val: 'text-violet-700' },
  }
  const p = palettes[colorKey] || palettes.teal
  return (
    <div className={`${p.wrap} rounded-2xl p-5 border`}>
      <div className={`w-10 h-10 ${p.icon} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className={`text-3xl font-black ${p.val} mb-0.5`}>{value}</p>
      <p className="text-slate-700 font-semibold text-sm">{label}</p>
      {sub && <p className="text-slate-400 text-xs mt-0.5">{sub}</p>}
    </div>
  )
}

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  const gradient =
    star >= 4 ? 'from-emerald-400 to-green-500' :
    star === 3 ? 'from-amber-400 to-yellow-400' :
    'from-rose-400 to-red-400'
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold text-slate-500 w-4 text-right">{star}</span>
      <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-400 font-semibold w-4">{count}</span>
    </div>
  )
}

// ── Delete Confirm Modal ──────────────────────────────────────────
function DeleteConfirmModal({ onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-8 h-8 text-rose-500" />
        </div>
        <h3 className="text-lg font-black text-slate-800 mb-2">Remove Review?</h3>
        <p className="text-slate-500 text-sm mb-6">
          This review will be removed from your profile permanently.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-semibold text-sm rounded-2xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {loading ? 'Removing...' : 'Yes, Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Review Row ────────────────────────────────────────────────────
function ReviewRow({ review, expanded, onToggle, onDelete }) {
  const formatDate = d =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  const name  = getPatientName(review)
  const image = getPatientImage(review)

  const sentiment =
    review.rating >= 4 ? { icon: Smile, cls: 'text-emerald-600 bg-emerald-50', label: 'Positive' } :
    review.rating === 3 ? { icon: Meh,   cls: 'text-amber-600  bg-amber-50',   label: 'Neutral'  } :
                          { icon: Frown, cls: 'text-rose-600   bg-rose-50',    label: 'Negative' }
  const SentIcon = sentiment.icon

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${expanded ? 'border-teal-200 shadow-md' : 'border-slate-100 hover:border-slate-200 hover:shadow-sm'}`}>
      <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={onToggle}>
        <UserInitialAvatar name={name} image={image} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-bold text-slate-800 text-sm truncate">{name}</p>
            {review.isVerified && (
              <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold shrink-0">
                <CheckCircle className="w-2.5 h-2.5" /> Verified
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 line-clamp-1">{review.reviewText}</p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:block text-right">
            <StarDisplay value={review.rating} />
            <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(review.createdAt)}</p>
          </div>
          <span className={`hidden sm:flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full ${sentiment.cls}`}>
            <SentIcon className="w-3 h-3" />{sentiment.label}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-3 border-t border-slate-50 space-y-3">
          <div className="flex items-center gap-3 sm:hidden">
            <StarDisplay value={review.rating} size="md" />
            <span className="text-xs text-slate-400">{formatDate(review.createdAt)}</span>
            <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${sentiment.cls}`}>
              <SentIcon className="w-3 h-3" />{sentiment.label}
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Review</p>
            <p className="text-sm text-slate-700 leading-relaxed">{review.reviewText}</p>
          </div>

          {review.doctorReply ? (
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
              <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">Your Reply</p>
              <p className="text-sm text-slate-700">{review.doctorReply}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" />No reply sent yet
            </p>
          )}

          {/* Doctor delete button — only visible in expanded state */}
          <div className="flex justify-end pt-1">
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(review) }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />Remove Review
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const SORT_OPTIONS = [
  { value: 'newest',  label: 'Newest First'   },
  { value: 'oldest',  label: 'Oldest First'   },
  { value: 'highest', label: 'Highest Rating' },
  { value: 'lowest',  label: 'Lowest Rating'  },
]

const FILTER_OPTIONS = [
  { value: 'all',      label: 'All'             },
  { value: 'positive', label: 'Positive (4-5★)' },
  { value: 'neutral',  label: 'Neutral (3★)'    },
  { value: 'negative', label: 'Negative (1-2★)' },
  { value: 'verified', label: 'Verified Only'   },
  { value: 'replied',  label: 'With Reply'      },
]

export default function DoctorReviewsDashboard() {
  const { UserAuthData } = useContext(AuthContext)
  const { handleGetDoctorReviews, handleDeleteReview } = useReview()

  const [reviews,        setReviews]        = useState([])
  const [fetchLoading,   setFetchLoading]   = useState(true)
  const [expandedId,     setExpandedId]     = useState(null)
  const [deletingReview, setDeletingReview] = useState(null)
  const [deleteLoading,  setDeleteLoading]  = useState(false)
  const [search,         setSearch]         = useState('')
  const [sort,           setSort]           = useState('newest')
  const [filter,         setFilter]         = useState('all')
  const [showFilters,    setShowFilters]    = useState(false)

  const doctorId =
    UserAuthData?.userId

  const fetchReviews = useCallback(async () => {
    if (!doctorId) return
    setFetchLoading(true)
    try {
      const res  = await handleGetDoctorReviews(doctorId)
      const list = res?.reviews ?? res?.data ?? res ?? []
      setReviews(Array.isArray(list) ? list : [])
    } catch {
      setReviews([])
    } finally {
      setFetchLoading(false)
    }
  }, [doctorId])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const handleConfirmDelete = async () => {
    if (!deletingReview) return
    setDeleteLoading(true)
    try {
      await handleDeleteReview(deletingReview._id)
      setDeletingReview(null)
      setExpandedId(null)
      fetchReviews()
    } catch {
      // error handled inside hook
    } finally {
      setDeleteLoading(false)
    }
  }

  const total           = reviews.length
  const avgRating       = total ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / total : 0
  const positiveCount   = reviews.filter(r => r.rating >= 4).length
  const neutralCount    = reviews.filter(r => r.rating === 3).length
  const negativeCount   = reviews.filter(r => r.rating <= 2).length
  const satisfactionPct = total ? Math.round((positiveCount / total) * 100) : 0
  const replyCount      = reviews.filter(r => r.doctorReply).length
  const replyPct        = total ? Math.round((replyCount / total) * 100) : 0

  const ratingCounts = [5, 4, 3, 2, 1].map(n => ({
    n, count: reviews.filter(r => r.rating === n).length,
  }))

  const processed = reviews
    .filter(r => {
      const name = getPatientName(r)
      const matchSearch =
        !search ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        (r.reviewText || '').toLowerCase().includes(search.toLowerCase())

      const matchFilter =
        filter === 'all'      ? true :
        filter === 'positive' ? r.rating >= 4 :
        filter === 'neutral'  ? r.rating === 3 :
        filter === 'negative' ? r.rating <= 2 :
        filter === 'verified' ? r.isVerified :
        filter === 'replied'  ? !!r.doctorReply :
        true

      return matchSearch && matchFilter
    })
    .sort((a, b) =>
      sort === 'newest'  ? new Date(b.createdAt) - new Date(a.createdAt) :
      sort === 'oldest'  ? new Date(a.createdAt) - new Date(b.createdAt) :
      sort === 'highest' ? b.rating - a.rating :
      sort === 'lowest'  ? a.rating - b.rating : 0
    )

  const activeFilterCount = [filter !== 'all', !!search].filter(Boolean).length

  if (fetchLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
          <p className="text-slate-500 font-semibold text-sm">Loading reviews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {deletingReview && (
        <DeleteConfirmModal
          onClose={() => setDeletingReview(null)}
          onConfirm={handleConfirmDelete}
          loading={deleteLoading}
        />
      )}

      <div className="bg-gradient-to-r from-slate-900 via-teal-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-2">Doctor Dashboard</p>
              <h1 className="text-3xl font-black text-white mb-1">Patient Reviews</h1>
              <p className="text-slate-400 text-sm">All reviews received from your patients</p>
            </div>
            <button
              onClick={fetchReviews}
              disabled={fetchLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 text-white text-sm font-semibold rounded-xl hover:bg-white/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${fetchLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-16">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Star}          label="Average Rating" value={avgRating.toFixed(1)}  sub={`from ${total} reviews`}     colorKey="amber"  />
          <StatCard icon={MessageCircle} label="Total Reviews"  value={total}                  sub="all time"                    colorKey="teal"   />
          <StatCard icon={ThumbsUp}      label="Satisfaction"   value={`${satisfactionPct}%`}  sub={`${positiveCount} positive`} colorKey="blue"   />
          <StatCard icon={Shield}        label="Reply Rate"     value={`${replyPct}%`}         sub={`${replyCount} replied`}     colorKey="violet" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          <div className="space-y-5">

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-teal-600" />Rating Distribution
              </h3>
              {total === 0 ? (
                <p className="text-slate-400 text-sm text-center py-6">No reviews yet</p>
              ) : (
                <div className="flex items-center gap-4 mb-2">
                  <div className="text-center shrink-0">
                    <p className="text-5xl font-black text-slate-800 leading-none">{avgRating.toFixed(1)}</p>
                    <div className="mt-1.5"><StarDisplay value={Math.round(avgRating)} size="sm" /></div>
                    <p className="text-xs text-slate-400 mt-1">{total} total</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {ratingCounts.map(({ n, count }) => (
                      <RatingBar key={n} star={n} count={count} total={total} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Smile className="w-4 h-4 text-teal-600" />Sentiment
              </h3>
              <div className="space-y-3">
                {[
                  { icon: Smile, label: 'Positive', count: positiveCount, bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
                  { icon: Meh,   label: 'Neutral',  count: neutralCount,  bar: 'bg-amber-400',  badge: 'bg-amber-50  text-amber-700'  },
                  { icon: Frown, label: 'Negative', count: negativeCount, bar: 'bg-rose-500',   badge: 'bg-rose-50   text-rose-700'   },
                ].map(({ icon: Icon, label, count, bar, badge }) => (
                  <div key={label} className={`flex items-center gap-3 p-3 rounded-xl ${badge.split(' ')[0]}`}>
                    <div className={`w-8 h-8 ${bar} rounded-lg flex items-center justify-center shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className={`text-xs font-bold ${badge.split(' ')[1]}`}>{label}</p>
                        <span className={`text-xs font-black ${badge.split(' ')[1]}`}>{count}</span>
                      </div>
                      <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                        <div className={`h-full ${bar} rounded-full transition-all duration-500`} style={{ width: total ? `${(count / total) * 100}%` : '0%' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />Recent Activity
              </h3>
              {total === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No reviews yet</p>
              ) : (
                <div className="space-y-3">
                  {reviews
                    .slice()
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5)
                    .map(r => {
                      const name  = getPatientName(r)
                      const image = getPatientImage(r)
                      return (
                        <div key={r._id} className="flex items-center gap-3">
                          <UserInitialAvatar name={name} image={image} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">{name}</p>
                            <StarDisplay value={r.rating} />
                          </div>
                          <p className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                          </p>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by patient name or review text..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
                  >
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 border rounded-xl text-sm font-semibold transition-all ${showFilters || filter !== 'all' ? 'bg-teal-50 border-teal-300 text-teal-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    Filter
                    {activeFilterCount > 0 && (
                      <span className="w-4 h-4 bg-teal-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">{activeFilterCount}</span>
                    )}
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                  {FILTER_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      onClick={() => setFilter(o.value)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${filter === o.value ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600'}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-slate-500 font-semibold">
                {processed.length} of {total} review{total !== 1 ? 's' : ''}
              </p>
              {(search || filter !== 'all') && (
                <button
                  onClick={() => { setSearch(''); setFilter('all') }}
                  className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />Clear filters
                </button>
              )}
            </div>

            {processed.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  {total === 0
                    ? <Star className="w-8 h-8 text-amber-300" />
                    : <Search className="w-8 h-8 text-slate-300" />}
                </div>
                <h4 className="text-slate-700 font-bold mb-1">
                  {total === 0 ? 'No Reviews Yet' : 'No Matching Reviews'}
                </h4>
                <p className="text-slate-400 text-sm">
                  {total === 0
                    ? 'When patients leave reviews they will appear here.'
                    : 'Try adjusting your search or filter.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {processed.map(review => (
                  <ReviewRow
                    key={review._id}
                    review={review}
                    expanded={expandedId === review._id}
                    onToggle={() => setExpandedId(prev => prev === review._id ? null : review._id)}
                    onDelete={r => setDeletingReview(r)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
