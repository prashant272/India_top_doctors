'use client'

import { useState, useCallback, useEffect, useContext } from 'react'
import { Star, Plus, ChevronDown, CheckCircle, Pencil, Trash2, Send, Loader2, AlertCircle, MessageCircle, X } from 'lucide-react'
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
          <Star className={`${starSize} transition-colors ${star <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
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

function UserInitialAvatar({ name, image }) {
  const [imgError, setImgError] = useState(false)
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'
  const colors = ['from-teal-400 to-teal-600', 'from-blue-400 to-blue-600', 'from-violet-400 to-violet-600', 'from-orange-400 to-orange-600', 'from-rose-400 to-rose-600']
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0
  if (image && !imgError) {
    return <img src={image} alt={name} className="w-11 h-11 rounded-2xl object-cover flex-shrink-0" onError={() => setImgError(true)} />
  }
  return (
    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center font-black text-white text-sm flex-shrink-0`}>
      {initials}
    </div>
  )
}

function ReviewFormModal({ doctorId, existingReview, onClose, onSaved }) {
  const { handleCreateReview, handleUpdateReview, loading } = useReview()
  const [rating, setRating]         = useState(existingReview?.rating || 0)
  const [reviewText, setReviewText] = useState(existingReview?.reviewText || '')
  const [error, setError]           = useState('')
  const isEdit = !!existingReview

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a star rating.'); return }
    if (!reviewText.trim()) { setError('Please write a review comment.'); return }
    setError('')
    try {
      if (isEdit) {
        await handleUpdateReview(existingReview._id, { rating, reviewText })
      } else {
        await handleCreateReview({ type: 'doctor', doctorId, rating, reviewText })
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
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white">{isEdit ? 'Edit Your Review' : 'Write a Review'}</h2>
            <p className="text-teal-200 text-xs mt-0.5">Your feedback helps other patients choose wisely</p>
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
              placeholder="Describe your experience – diagnosis, treatment, wait time, doctor's behaviour..."
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
              className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold text-sm rounded-2xl hover:from-teal-700 hover:to-teal-800 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-teal-600/25"
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

function DeleteConfirmModal({ onConfirm, onClose, loading, isDoctor = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-8 h-8 text-rose-500" />
        </div>
        <h3 className="text-lg font-black text-slate-800 mb-2">
          {isDoctor ? 'Remove This Review?' : 'Delete Your Review?'}
        </h3>
        <p className="text-slate-500 text-sm mb-6">
          {isDoctor ? 'This review will be permanently removed from your profile.' : 'This action cannot be undone. Your review will be permanently removed.'}
        </p>
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
            {loading ? 'Removing...' : 'Yes, Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ReviewCard({ review, currentUserId, currentUserRole, onEdit, onDelete }) {
  const formatDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
  const name      = getPatientName(review)
  const image     = getPatientImage(review)
  const patientId = review.patient?._id || review.patient

  const isPatientOwner = currentUserRole === 'patient' && currentUserId && String(patientId) === String(currentUserId)
  const isDoctorOwner  = currentUserRole === 'doctor'
  const canEdit        = isPatientOwner
  const canDelete      = isPatientOwner || isDoctorOwner

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <UserInitialAvatar name={name} image={image} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-slate-800 text-sm">{name}</h4>
              {review.isVerified && (
                <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                  <CheckCircle className="w-2.5 h-2.5" /> Verified Patient
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <StarRating value={review.rating} readonly size="sm" />
              <span className="text-xs text-slate-400">{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>
        {(canEdit || canDelete) && (
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {canEdit && (
              <button onClick={() => onEdit(review)} className="w-8 h-8 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {canDelete && (
              <button onClick={() => onDelete(review)} className="w-8 h-8 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl flex items-center justify-center transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
      <p className="text-slate-600 text-sm leading-relaxed mt-3 pl-[52px]">{review.reviewText}</p>
      {review.doctorReply && (
        <div className="mt-3 ml-[52px] bg-teal-50 border border-teal-100 rounded-xl p-3">
          <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">Doctor's Reply</p>
          <p className="text-xs text-slate-600">{review.doctorReply}</p>
        </div>
      )}
    </div>
  )
}

export default function ReviewsTab({ doctorId, displayName }) {
  const { UserAuthData }                              = useContext(AuthContext)
  const { handleGetDoctorReviews, handleDeleteReview } = useReview()

  const [reviews,        setReviews]        = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [showForm,       setShowForm]       = useState(false)
  const [editingReview,  setEditingReview]  = useState(null)
  const [deletingReview, setDeletingReview] = useState(null)
  const [deleteLoading,  setDeleteLoading]  = useState(false)
  const [showAll,        setShowAll]        = useState(false)

  const currentUserId   = UserAuthData?.user?._id || UserAuthData?.user?.id || UserAuthData?._id || UserAuthData?.id
  const currentUserRole = UserAuthData?.user?.role || UserAuthData?.role || null

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true)
    try {
      const res  = await handleGetDoctorReviews(doctorId)
      const list = res?.reviews ?? res?.data ?? res ?? []
      setReviews(Array.isArray(list) ? list : [])
    } catch {
      setReviews([])
    } finally {
      setReviewsLoading(false)
    }
  }, [doctorId])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const avgRating    = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : '0.0'
  const ratingCounts = [5, 4, 3, 2, 1].map(n => ({ n, count: reviews.filter(r => r.rating === n).length }))

  const handleConfirmDelete = async () => {
    if (!deletingReview) return
    setDeleteLoading(true)
    try {
      await handleDeleteReview(deletingReview._id)
      setDeletingReview(null)
      fetchReviews()
    } catch {}
    finally { setDeleteLoading(false) }
  }

  const userHasReview  = currentUserRole === 'patient' && reviews.some(r => String(r.patient?._id || r.patient) === String(currentUserId))
  const visibleReviews = showAll ? reviews : reviews.slice(0, 4)

  return (
    <>
      {showForm && (
        <ReviewFormModal
          doctorId={doctorId}
          existingReview={editingReview}
          onClose={() => { setShowForm(false); setEditingReview(null) }}
          onSaved={fetchReviews}
        />
      )}
      {deletingReview && (
        <DeleteConfirmModal
          onClose={() => setDeletingReview(null)}
          onConfirm={handleConfirmDelete}
          loading={deleteLoading}
          isDoctor={currentUserRole === 'doctor'}
        />
      )}

      <div className="space-y-5">
        {reviews.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="text-center shrink-0">
                <p className="text-6xl font-black text-slate-800 leading-none">{avgRating}</p>
                <div className="mt-2"><StarRating value={Math.round(Number(avgRating))} readonly size="sm" /></div>
                <p className="text-xs text-slate-400 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex-1 w-full space-y-2">
                {ratingCounts.map(({ n, count }) => {
                  const pct = reviews.length ? (count / reviews.length) * 100 : 0
                  return (
                    <div key={n} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-4 text-right font-semibold">{n}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 w-4 font-semibold">{count}</span>
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
            className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-teal-300 text-teal-600 font-bold text-sm rounded-2xl hover:bg-teal-50 hover:border-teal-400 transition-all duration-200 group"
          >
            <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />Write a Review
          </button>
        )}

        {!UserAuthData?.token && (
          <div className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-2xl px-5 py-4">
            <div>
              <p className="text-sm font-bold text-slate-800">Share your experience</p>
              <p className="text-xs text-slate-500 mt-0.5">Login to leave a review for {displayName}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-teal-300" />
          </div>
        )}

        {reviewsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-11 h-11 bg-slate-200 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-8 h-8 text-amber-300" />
            </div>
            <h4 className="text-slate-700 font-bold mb-1">No Reviews Yet</h4>
            <p className="text-slate-400 text-sm">Be the first to review {displayName}</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {visibleReviews.map(review => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  currentUserId={currentUserId}
                  currentUserRole={currentUserRole}
                  onEdit={r => { setEditingReview(r); setShowForm(true) }}
                  onDelete={r => setDeletingReview(r)}
                />
              ))}
            </div>
            {reviews.length > 4 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-slate-200 text-slate-600 font-semibold text-sm rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                {showAll ? 'Show Less' : `View All ${reviews.length} Reviews`}
                <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
              </button>
            )}
          </>
        )}
      </div>
    </>
  )
}
