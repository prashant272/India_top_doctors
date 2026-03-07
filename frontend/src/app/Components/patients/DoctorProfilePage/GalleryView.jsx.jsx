'use client'

import { useState } from 'react'
import {
  Image as ImageIcon, ExternalLink, Link as LinkIcon,
  BookOpen, X, ZoomIn,
} from 'lucide-react'
import useDoctorGallery from '@/app/hooks/useDoctorGallery'

function LightboxModal({ item, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
        />
        <div className="flex items-center justify-between mt-5 px-1">
          <div>
            <p className="text-white font-bold text-base">{item.title}</p>
            {item.description && (
              <p className="text-white/50 text-sm mt-0.5">{item.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {item.linkUrl && (
              <a
                href={item.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-colors"
              >
                <ExternalLink className="w-4 h-4" />Open Link
              </a>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ImageCard({ item, onClick }) {
  return (
    <div
      onClick={() => onClick(item)}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-teal-100 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className="relative h-52 overflow-hidden bg-slate-100">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => e.target.parentElement.classList.add('hidden')}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
            <ZoomIn className="w-5 h-5 text-white" />
          </div>
        </div>
        {item.linkUrl && (
          <a
            href={item.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-teal-600/90 hover:bg-teal-700 text-white text-[11px] font-bold rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
          >
            <ExternalLink className="w-3 h-3" />Open Link
          </a>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-600 border border-teal-100">
            <ImageIcon className="w-3 h-3" />Photo
          </span>
          {item.linkUrl && (
            <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              <LinkIcon className="w-3 h-3" />Has Link
            </span>
          )}
        </div>
        <h3 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-teal-600 transition-colors mb-1">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>
    </div>
  )
}

function LinkCard({ item }) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-100 transition-all duration-200 overflow-hidden">
      <div className="flex items-stretch">
        <div className="w-1.5 bg-gradient-to-b from-teal-400 to-teal-600 flex-shrink-0 rounded-l-2xl" />
        <div className="flex items-center gap-4 p-4 flex-1 min-w-0">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl flex items-center justify-center flex-shrink-0 border border-teal-100">
            <LinkIcon className="w-5 h-5 text-teal-600" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black text-teal-500 uppercase tracking-widest">
              External Link
            </span>
            <h3 className="font-bold text-slate-800 text-sm truncate group-hover:text-teal-600 transition-colors">
              {item.title}
            </h3>
            {item.description && (
              <p className="text-slate-400 text-xs truncate mt-0.5">{item.description}</p>
            )}
            <p className="text-[10px] text-teal-500 truncate mt-1 font-medium">{item.linkUrl}</p>
          </div>
          <a
            href={item.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm shadow-teal-600/20 shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />Visit
          </a>
        </div>
      </div>
    </div>
  )
}

export default function GalleryView({ doctorId }) {
  const { gallery, loading } = useDoctorGallery(doctorId)
  const [lightbox, setLightbox] = useState(null)

  const imageItems = gallery.filter(item => !!item.imageUrl)
  const linkItems  = gallery.filter(item => !item.imageUrl && !!item.linkUrl)

  if (!loading && gallery.length === 0) return null

  return (
    <>
      {lightbox && (
        <LightboxModal item={lightbox} onClose={() => setLightbox(null)} />
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-teal-600" />
            </div>
            Gallery & Resources
          </h3>
          {gallery.length > 0 && (
            <p className="text-slate-400 text-xs mt-1 ml-11">
              {imageItems.length > 0 && `${imageItems.length} photo${imageItems.length !== 1 ? 's' : ''}`}
              {imageItems.length > 0 && linkItems.length > 0 && ' · '}
              {linkItems.length > 0 && `${linkItems.length} link${linkItems.length !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>

        {loading && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                  <div className="h-52 bg-slate-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 bg-slate-200 rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-1/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && imageItems.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5" />Photos
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {imageItems.map(item => (
                <ImageCard key={item._id} item={item} onClick={setLightbox} />
              ))}
            </div>
          </div>
        )}

        {!loading && linkItems.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <LinkIcon className="w-3.5 h-3.5" />Resources & Links
            </p>
            <div className="space-y-2.5">
              {linkItems.map(item => (
                <LinkCard key={item._id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
