'use client'

import { useState, useRef, useContext } from 'react'
import {
  Image as ImageIcon, Plus, Pencil, Trash2, Loader2,
  AlertCircle, ExternalLink, Link as LinkIcon, X,
  BookOpen, ZoomIn, LayoutGrid, List, Upload, RotateCcw,
} from 'lucide-react'
import useDoctorGallery from '@/app/hooks/useDoctorGallery'
import { AuthContext } from '@/app/context/AuthContext'


function GalleryFormModal({ doctorId, existing, onClose, onSaved, createGallery, updateGallery, actionLoading }) {
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    title:       existing?.title       || '',
    imageUrl:    existing?.imageUrl    || '',
    linkUrl:     existing?.linkUrl     || '',
    description: existing?.description || '',
  })
  const [imageMode,   setImageMode]   = useState(existing?.imageUrl ? 'url' : 'upload')
  const [previewUrl,  setPreviewUrl]  = useState(existing?.imageUrl || '')
  const [imageBase64, setImageBase64] = useState('')
  const [error,       setError]       = useState('')
  const isEdit = !!existing

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) { setError('Only JPG, PNG, WEBP or GIF files are allowed.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('File size must be under 5MB.'); return }
    setError('')
    const fileReader = new FileReader()
    fileReader.onload = (event) => {
      setPreviewUrl(event.target.result)
      setImageBase64(event.target.result)
    }
    fileReader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileChange({ target: { files: [file] } })
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return }
    let finalImageUrl = form.imageUrl
    if (imageMode === 'upload') {
      if (!imageBase64 && !existing?.imageUrl && !form.linkUrl.trim()) {
        setError('Upload an image or provide a link URL.')
        return
      }
      finalImageUrl = imageBase64 || existing?.imageUrl || ''
    } else {
      if (!form.imageUrl.trim() && !form.linkUrl.trim()) {
        setError('Provide at least an image URL or a link.')
        return
      }
    }
    setError('')
    const payload = { ...form, imageUrl: finalImageUrl, doctorId }
    if (isEdit) {
      await updateGallery(existing._id, payload)
    } else {
      await createGallery(payload)
    }
    onSaved()
    onClose()
  }

  const clearImage = () => {
    setPreviewUrl('')
    setImageBase64('')
    setForm(p => ({ ...p, imageUrl: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 overflow-y-auto py-8">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white">
              {isEdit ? 'Edit Gallery Item' : 'Add New Item'}
            </h2>
            <p className="text-teal-200 text-xs mt-0.5">
              {isEdit ? 'Update your gallery entry' : 'Add a photo or link to your gallery'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Clinic Reception, Research Paper..."
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Image <span className="text-slate-300 font-normal">(optional)</span>
              </label>
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => { setImageMode('upload'); clearImage() }}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${imageMode === 'upload' ? 'bg-white text-teal-600 shadow' : 'text-slate-400 hover:text-slate-600'}`}
                >Upload</button>
                <button
                  type="button"
                  onClick={() => { setImageMode('url'); clearImage() }}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${imageMode === 'url' ? 'bg-white text-teal-600 shadow' : 'text-slate-400 hover:text-slate-600'}`}
                >URL</button>
              </div>
            </div>

            {imageMode === 'upload' ? (
              <>
                {previewUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-teal-200 bg-slate-50">
                    <img src={previewUrl} alt="preview" className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200" />
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-teal-600 text-xs font-bold rounded-xl shadow transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />Change
                      </button>
                      <button
                        type="button"
                        onClick={clearImage}
                        className="w-7 h-7 bg-white/90 hover:bg-white text-rose-500 rounded-xl flex items-center justify-center shadow transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                    className="w-full h-44 border-2 border-dashed border-slate-300 hover:border-teal-400 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-50 hover:bg-teal-50/30 transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 bg-teal-50 group-hover:bg-teal-100 rounded-2xl flex items-center justify-center transition-colors">
                      <Upload className="w-6 h-6 text-teal-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-600 group-hover:text-teal-600 transition-colors">Click to upload or drag & drop</p>
                      <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WEBP, GIF · Max 5MB</p>
                    </div>
                  </div>
                )}
                <input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={e => { setForm(p => ({ ...p, imageUrl: e.target.value })); setPreviewUrl(e.target.value) }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 transition-colors"
                />
                {previewUrl && (
                  <div className="relative mt-2 h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={previewUrl} alt="preview" className="w-full h-full object-cover" onError={e => (e.target.style.display = 'none')} />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 w-6 h-6 bg-white/90 hover:bg-white text-rose-500 rounded-lg flex items-center justify-center shadow text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Link URL <span className="text-slate-300 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={form.linkUrl}
              onChange={e => setForm(p => ({ ...p, linkUrl: e.target.value }))}
              placeholder="https://research-paper.com or YouTube..."
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Description <span className="text-slate-300 font-normal">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Brief description visible to patients..."
              rows={2}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 resize-none transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-semibold text-sm rounded-2xl hover:bg-slate-50 transition-colors"
            >Cancel</button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={actionLoading}
              className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold text-sm rounded-2xl hover:from-teal-700 hover:to-teal-800 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-teal-600/25"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
              {actionLoading ? 'Saving...' : isEdit ? 'Update Item' : 'Add to Gallery'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


function DeleteConfirmModal({ item, onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-8 h-8 text-rose-500" />
        </div>
        <h3 className="text-lg font-black text-slate-800 mb-1">Remove Gallery Item?</h3>
        <p className="text-slate-500 text-sm mb-1">
          <span className="font-semibold text-slate-700">"{item?.title}"</span>
        </p>
        <p className="text-slate-400 text-xs mb-6">This will be permanently removed from your gallery.</p>
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


function LightboxModal({ item, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
        <img src={item.imageUrl} alt={item.title} className="w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl" />
        <div className="flex items-center justify-between mt-5 px-1">
          <div>
            <p className="text-white font-bold text-base">{item.title}</p>
            {item.description && <p className="text-white/50 text-sm mt-0.5">{item.description}</p>}
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}


function ImageGridCard({ item, onEdit, onDelete, onClick }) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300 overflow-hidden">
      <div className="relative h-48 overflow-hidden bg-slate-100 cursor-pointer" onClick={() => onClick(item)}>
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => e.target.parentElement.classList.add('hidden')}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
            <ZoomIn className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-slate-800 text-sm line-clamp-1 flex-1">{item.title}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => onEdit(item)} className="w-7 h-7 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center transition-colors">
              <Pencil className="w-3 h-3" />
            </button>
            <button onClick={() => onDelete(item)} className="w-7 h-7 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg flex items-center justify-center transition-colors">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
        {item.description && <p className="text-slate-400 text-xs line-clamp-1 mb-2">{item.description}</p>}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 border border-teal-100">
            <ImageIcon className="w-2.5 h-2.5" />Photo
          </span>
          {item.linkUrl && (
            <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors">
              <ExternalLink className="w-2.5 h-2.5" />View Link
            </a>
          )}
        </div>
      </div>
    </div>
  )
}


function LinkListRow({ item, onEdit, onDelete }) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 overflow-hidden">
      <div className="flex items-stretch">
        <div className="w-1.5 bg-gradient-to-b from-teal-400 to-teal-600 flex-shrink-0 rounded-l-2xl" />
        <div className="flex items-center gap-4 p-4 flex-1 min-w-0">
          <div className="w-11 h-11 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-teal-100">
            <LinkIcon className="w-5 h-5 text-teal-600" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black text-teal-500 uppercase tracking-widest">External Link</span>
            <h3 className="font-bold text-slate-800 text-sm truncate">{item.title}</h3>
            {item.description && <p className="text-slate-400 text-xs truncate mt-0.5">{item.description}</p>}
            <p className="text-[10px] text-teal-500 truncate mt-0.5 font-medium">{item.linkUrl}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors">
              <ExternalLink className="w-3 h-3" />Visit
            </a>
            <button onClick={() => onEdit(item)} className="w-8 h-8 bg-slate-50 hover:bg-teal-50 text-slate-400 hover:text-teal-600 border border-slate-200 rounded-xl flex items-center justify-center transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(item)} className="w-8 h-8 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 border border-slate-200 rounded-xl flex items-center justify-center transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


export default function DoctorGalleryManager({  }) {
   const {UserAuthData} = useContext(AuthContext)
   const doctorId = UserAuthData.userId
  const {
    gallery,
    loading,
    actionLoading,
    fetchDoctorGallery,
    createGallery,
    updateGallery,
    deleteGallery,
  } = useDoctorGallery(doctorId)  

  const [showForm,      setShowForm]      = useState(false)
  const [editing,       setEditing]       = useState(null)
  const [deleting,      setDeleting]      = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [lightbox,      setLightbox]      = useState(null)
  const [view,          setView]          = useState('grid')

  const handleConfirmDelete = async () => {
    if (!deleting) return
    setDeleteLoading(true)
    await deleteGallery(deleting._id)
    setDeleting(null)
    setDeleteLoading(false)
  }

  const imageItems = gallery.filter(item => !!item.imageUrl)
  const linkItems  = gallery.filter(item => !item.imageUrl && !!item.linkUrl)

  return (
    <>
      {showForm && (
        <GalleryFormModal
          doctorId={doctorId}
          existing={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSaved={fetchDoctorGallery}
          createGallery={createGallery}
          updateGallery={updateGallery}
          actionLoading={actionLoading}
        />
      )}
      {lightbox && <LightboxModal item={lightbox} onClose={() => setLightbox(null)} />}
      {deleting && (
        <DeleteConfirmModal
          item={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={handleConfirmDelete}
          loading={deleteLoading}
        />
      )}

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-600/20">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Gallery Manager</h2>
                <p className="text-slate-400 text-sm">
                  {gallery.length === 0
                    ? 'No items yet — add photos or links'
                    : `${imageItems.length} photo${imageItems.length !== 1 ? 's' : ''} · ${linkItems.length} link${linkItems.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setView('grid')}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${view === 'grid' ? 'bg-white shadow text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${view === 'list' ? 'bg-white shadow text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => { setEditing(null); setShowForm(true) }}
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-teal-600/20"
              >
                <Plus className="w-4 h-4" />Add Item
              </button>
            </div>
          </div>

          {gallery.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100">
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-2xl font-black text-slate-800">{gallery.length}</p>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Total Items</p>
              </div>
              <div className="text-center p-3 bg-teal-50 rounded-xl">
                <p className="text-2xl font-black text-teal-700">{imageItems.length}</p>
                <p className="text-xs text-teal-500 font-semibold mt-0.5">Photos</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <p className="text-2xl font-black text-blue-700">{linkItems.length}</p>
                <p className="text-xs text-blue-500 font-semibold mt-0.5">Links</p>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                <div className="h-48 bg-slate-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && gallery.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 text-center py-16 px-6">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-10 h-10 text-teal-300" />
            </div>
            <h4 className="text-slate-700 font-bold text-lg mb-2">Your Gallery is Empty</h4>
            <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
              Add clinic photos, certificates, research papers or useful links to showcase to patients.
            </p>
            <button
              onClick={() => { setEditing(null); setShowForm(true) }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-bold text-sm rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20"
            >
              <Plus className="w-4 h-4" />Add First Item
            </button>
          </div>
        )}

        {!loading && imageItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5" />Photos ({imageItems.length})
              </p>
            </div>
            {view === 'grid' ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {imageItems.map(item => (
                  <ImageGridCard
                    key={item._id}
                    item={item}
                    onEdit={i => { setEditing(i); setShowForm(true) }}
                    onDelete={i => setDeleting(i)}
                    onClick={i => setLightbox(i)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {imageItems.map(item => (
                  <div key={item._id} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all overflow-hidden">
                    <div className="flex items-center gap-4 p-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 cursor-pointer" onClick={() => setLightbox(item)}>
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" onError={e => e.target.parentElement.classList.add('hidden')} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 text-sm truncate">{item.title}</h3>
                        {item.description && <p className="text-slate-400 text-xs truncate mt-0.5">{item.description}</p>}
                        {item.linkUrl && <p className="text-[10px] text-teal-500 truncate mt-1 font-medium">{item.linkUrl}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.linkUrl && (
                          <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-600 text-xs font-bold rounded-xl hover:bg-teal-100 transition-colors border border-teal-100">
                            <ExternalLink className="w-3 h-3" />Link
                          </a>
                        )}
                        <button onClick={() => { setEditing(item); setShowForm(true) }} className="w-8 h-8 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleting(item)} className="w-8 h-8 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl flex items-center justify-center transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && linkItems.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <LinkIcon className="w-3.5 h-3.5" />Resources & Links ({linkItems.length})
            </p>
            <div className="space-y-2.5">
              {linkItems.map(item => (
                <LinkListRow
                  key={item._id}
                  item={item}
                  onEdit={i => { setEditing(i); setShowForm(true) }}
                  onDelete={i => setDeleting(i)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
