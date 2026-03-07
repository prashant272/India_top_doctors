'use client'

import { useState, useCallback, useEffect, useContext, useRef } from 'react'
import { Star, Plus, CheckCircle, Send, Loader2, AlertCircle, Globe, X, MessageCircle, Quote } from 'lucide-react'
import { AuthContext } from '@/app/context/AuthContext'
import { useReview } from '@/app/hooks/useReview'

function StarRating({ value, onChange, readonly = false, size = 'md' }) {
  const [hovered, setHovered] = useState(0)
  const starSize = size === 'lg' ? 'w-7 h-7' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? 'cursor-default' : 'cursor-pointer transition-transform hover:scale-110'}
        >
          <Star className={`${starSize} transition-colors ${star <= (hovered || value) ? 'fill-orange-400 text-orange-400' : 'fill-slate-200 text-slate-200'}`} />
        </button>
      ))}
    </div>
  )
}

function getPatientName(review) {
  return review.patient?.basicInfo?.fullName || review.patient?.name || review.patientName || 'Anonymous'
}

function getPatientImage(review) {
  return review.patient?.basicInfo?.profileImage || null
}

function UserInitialAvatar({ name, image, size = 'md' }) {
  const [imgError, setImgError] = useState(false)
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'
  const colors = ['from-orange-400 to-orange-600', 'from-teal-400 to-teal-600', 'from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-rose-400 to-rose-600']
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0
  const sizeClass = size === 'sm' ? 'w-10 h-10 text-xs' : size === 'lg' ? 'w-16 h-16 text-base' : 'w-12 h-12 text-sm'
  if (image && !imgError) {
    return <img src={image} alt={name} className={`${sizeClass} rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow-md`} onError={() => setImgError(true)} />
  }
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center font-black text-white flex-shrink-0 ring-2 ring-white shadow-md`}>
      {initials}
    </div>
  )
}

function PlatformReviewFormModal({ existingReview, onClose, onSaved }) {
  const { handleCreateReview, handleUpdateReview, loading } = useReview()
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [reviewText, setReviewText] = useState(existingReview?.reviewText || '')
  const [error, setError] = useState('')
  const isEdit = !!existingReview

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a star rating.'); return }
    if (!reviewText.trim()) { setError('Please write your review.'); return }
    setError('')
    try {
      if (isEdit) {
        await handleUpdateReview(existingReview._id, { rating, reviewText })
      } else {
        await handleCreateReview({ type: 'platform', rating, reviewText })
      }
      onSaved()
      onClose()
    } catch (e) {
      setError(e?.response?.data?.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white">{isEdit ? 'Edit Your Review' : 'Review DocCare Platform'}</h2>
            <p className="text-teal-100 text-xs mt-0.5">Help us improve your experience</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Your Rating</label>
            <StarRating value={rating} onChange={setRating} size="lg" />
            {rating > 0 && (
              <p className="text-xs text-teal-600 font-semibold mt-2">
                {['', 'Poor – Not recommended', 'Fair – Below expectations', 'Good – Decent experience', 'Very Good – Highly satisfied', 'Excellent – Outstanding!'][rating]}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Your Review</label>
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Share your experience using DocCare – ease of booking, UI, support, overall satisfaction..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 resize-none transition-colors leading-relaxed"
            />
            <p className="text-[11px] text-slate-400 mt-1 text-right">{reviewText.length} chars</p>
          </div>
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-semibold text-sm rounded-2xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold text-sm rounded-2xl hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Saving...' : isEdit ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TestimonialCard({ review, currentUserId, currentUserRole, onEdit }) {
  const formatDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
  const name = getPatientName(review)
  const image = getPatientImage(review)
  const patientId = review.patient?._id || review.patient
  const isOwner = currentUserRole === 'patient' && currentUserId && String(patientId) === String(currentUserId)

  return (
    <div className="relative flex-shrink-0 w-80 mx-3 group">
      <div className="relative bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 p-6 overflow-hidden hover:-translate-y-1 transform">
        <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-400 opacity-10 rounded-bl-full" />
          <div className="absolute top-3 right-3 w-12 h-12 bg-teal-400 opacity-10 rounded-bl-full" />
        </div>

        <div className="absolute top-5 left-5">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
            <Quote className="w-4 h-4 text-white" />
          </div>
        </div>

        {isOwner && (
          <button
            onClick={() => onEdit(review)}
            className="absolute top-5 right-5 w-7 h-7 bg-teal-50 hover:bg-teal-100 text-teal-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.415.586H9v-2.414a2 2 0 01.586-1.414z" />
            </svg>
          </button>
        )}

        <div className="mt-8 mb-4">
          <StarRating value={review.rating} readonly size="sm" />
        </div>

        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-5 italic">
          "{review.reviewText}"
        </p>

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 via-orange-400 to-teal-500" />

        <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
          <UserInitialAvatar name={name} image={image} size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-gray-900 text-sm truncate">{name}</p>
              {review.isVerified && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
            </div>
            <p className="text-[11px] text-gray-400 font-medium">{formatDate(review.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function MarqueeTrack({ reviews, currentUserId, currentUserRole, onEdit, direction = 'left' }) {
  const trackRef = useRef(null)
  const animRef = useRef(null)
  const posRef = useRef(0)
  const pausedRef = useRef(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track || reviews.length === 0) return

    const step = () => {
      if (!pausedRef.current) {
        posRef.current += direction === 'left' ? -0.5 : 0.5
        const halfWidth = track.scrollWidth / 2
        if (direction === 'left' && Math.abs(posRef.current) >= halfWidth) posRef.current = 0
        if (direction === 'right' && posRef.current >= 0) posRef.current = -halfWidth
        track.style.transform = `translateX(${posRef.current}px)`
      }
      animRef.current = requestAnimationFrame(step)
    }

    if (direction === 'right') posRef.current = -(track.scrollWidth / 2)
    animRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animRef.current)
  }, [reviews, direction])

  const doubled = [...reviews, ...reviews]

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}
    >
      <div ref={trackRef} className="flex will-change-transform py-3">
        {doubled.map((review, i) => (
          <TestimonialCard
            key={`${review._id}-${i}`}
            review={review}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-80 mx-3 bg-white rounded-3xl border border-gray-100 shadow-md p-6 animate-pulse">
      <div className="w-9 h-9 bg-gray-200 rounded-xl mb-4" />
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => <div key={i} className="w-3.5 h-3.5 bg-gray-200 rounded" />)}
      </div>
      <div className="space-y-2 mb-5">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-4/5" />
        <div className="h-3 bg-gray-100 rounded w-3/5" />
      </div>
      <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        <div className="space-y-1.5">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-2.5 w-16 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  )
}

export default function PlatformReviewsSection() {
  const { UserAuthData } = useContext(AuthContext)
  const { handleGetPlatformReviews } = useReview()

  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingReview, setEditingReview] = useState(null)

  const currentUserId = UserAuthData?.user?._id || UserAuthData?.user?.id || UserAuthData?._id || UserAuthData?.id
  const currentUserRole = UserAuthData?.user?.role || UserAuthData?.role || null

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const res = await handleGetPlatformReviews()
      const list = res?.reviews ?? res?.data ?? res ?? []
      setReviews(Array.isArray(list) ? list : [])
    } catch {
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : '0.0'
  const ratingCounts = [5, 4, 3, 2, 1].map(n => ({ n, count: reviews.filter(r => r.rating === n).length }))
  const userHasReview = currentUserRole === 'patient' && reviews.some(r => String(r.patient?._id || r.patient) === String(currentUserId))

  const row1 = reviews.filter((_, i) => i % 2 === 0)
  const row2 = reviews.filter((_, i) => i % 2 !== 0)

  return (
    <>
      {showForm && (
        <PlatformReviewFormModal
          existingReview={editingReview}
          onClose={() => { setShowForm(false); setEditingReview(null) }}
          onSaved={fetchReviews}
        />
      )}

      <section className="w-full py-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden relative">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 border-8 border-orange-400 rounded-full" />
          <div className="absolute bottom-20 right-20 w-80 h-80 border-8 border-teal-400 rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-orange-500 font-semibold text-sm tracking-wider uppercase mb-3">TESTIMONIALS</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Real experiences from real patients using India Top Doctor every day</p>
          </div>

          {reviews.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="text-center shrink-0">
                  <p className="text-7xl font-black text-gray-900 leading-none">{avgRating}</p>
                  <div className="mt-2 flex justify-center">
                    <StarRating value={Math.round(Number(avgRating))} readonly size="md" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 font-semibold">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex-1 w-full space-y-2">
                  {ratingCounts.map(({ n, count }) => {
                    const pct = reviews.length ? (count / reviews.length) * 100 : 0
                    return (
                      <div key={n} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-4 text-right font-bold">{n}</span>
                        <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400 shrink-0" />
                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-orange-400 to-teal-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-5 font-semibold">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {UserAuthData?.token && currentUserRole === 'patient' && !userHasReview && (
            <button
              onClick={() => { setEditingReview(null); setShowForm(true) }}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-teal-300 text-teal-600 font-bold text-sm rounded-2xl hover:bg-teal-50 hover:border-teal-400 transition-all duration-200 group mb-8"
            >
              <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />
              Share Your India Top Doctor Experience
            </button>
          )}

          {!UserAuthData?.token && (
            <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4 mb-8">
              <div>
                <p className="text-sm font-bold text-gray-800">Love using DocCare?</p>
                <p className="text-xs text-gray-500 mt-0.5">Login to share your platform experience with others</p>
              </div>
              <MessageCircle className="w-8 h-8 text-orange-300" />
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-4 mt-2">
            <div className="flex px-6 overflow-hidden">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
            <div className="flex px-6 overflow-hidden">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-10 h-10 text-orange-300" />
              </div>
              <h4 className="text-gray-700 font-black text-lg mb-2">No Reviews Yet</h4>
              <p className="text-gray-400 text-sm">Be the first to share your India Top Doctor experience</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {row1.length > 0 && (
              <MarqueeTrack
                reviews={row1}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                onEdit={r => { setEditingReview(r); setShowForm(true) }}
                direction="left"
              />
            )}
            {row2.length > 0 && (
              <MarqueeTrack
                reviews={row2}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                onEdit={r => { setEditingReview(r); setShowForm(true) }}
                direction="right"
              />
            )}
          </div>
        )}

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 mt-16">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center border-2 border-transparent hover:border-teal-200">
              <p className="text-4xl font-bold text-gray-900 mb-2">2500+</p>
              <p className="text-gray-600 font-medium">Happy Patients</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center border-2 border-transparent hover:border-orange-200">
              <p className="text-4xl font-bold text-gray-900 mb-2">4.9/5</p>
              <p className="text-gray-600 font-medium">Average Rating</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center border-2 border-transparent hover:border-purple-200">
              <p className="text-4xl font-bold text-gray-900 mb-2">98%</p>
              <p className="text-gray-600 font-medium">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
