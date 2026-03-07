'use client'

import { useState, useEffect, useContext } from 'react'
import { useBlog } from '@/app/hooks/useBlog'
import { BookOpen, Clock, Eye, Tag, Star, Globe, Heart, Hash, X } from 'lucide-react'
import { AuthContext } from '@/app/context/AuthContext'

function BlogDetailModal({ blog, onClose }) {
  const formatDate = d =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl mt-8">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 line-clamp-1 pr-4">{blog.title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {blog.featuredImage && (
          <div className="h-56 overflow-hidden bg-slate-100">
            <img
              src={blog.featuredImage}
              alt={blog.title}
              className="w-full h-full object-cover"
              onError={e => (e.target.style.display = 'none')}
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center gap-4 text-xs text-slate-400 mb-4 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(blog.publishedAt || blog.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {blog.views ?? 0} views
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {blog.likes ?? 0} likes
            </span>
          </div>
          {blog.excerpt && (
            <p className="text-slate-500 text-sm italic border-l-4 border-teal-200 pl-4 mb-4 py-1">
              {blog.excerpt}
            </p>
          )}
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{blog.content}</p>
          {Array.isArray(blog.tags) && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-slate-100">
              {blog.tags.map((tag, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 bg-teal-50 text-teal-600 rounded-full font-semibold"
                >
                  <Hash className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BlogCard({ blog, onClick }) {
  const formatDate = d =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  return (
    <div
      onClick={() => onClick(blog)}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-100 transition-all cursor-pointer group overflow-hidden"
    >
      {blog.featuredImage && (
        <div className="h-44 overflow-hidden bg-slate-100">
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => (e.target.style.display = 'none')}
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200">
            <Globe className="w-3 h-3" /> Published
          </span>
          {blog.isFeatured && (
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
              <Star className="w-3 h-3" /> Featured
            </span>
          )}
        </div>
        <h3 className="text-slate-800 font-bold text-base mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
          {blog.title}
        </h3>
        {blog.excerpt && (
          <p className="text-slate-400 text-sm line-clamp-2 mb-3">{blog.excerpt}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(blog.publishedAt || blog.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {blog.views ?? 0} views
          </span>
          {Array.isArray(blog.tags) && blog.tags.length > 0 && (
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {blog.tags.slice(0, 2).join(', ')}
              {blog.tags.length > 2 && ` +${blog.tags.length - 2}`}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BlogsTab({ doctorId, displayName }) {
  const { loading: blogLoading, handleGetDoctorBlogs } = useBlog()

  const [blogs, setBlogs] = useState([])
  const [selectedBlog, setSelectedBlog] = useState(null)

  useEffect(() => {
    if (!doctorId) return
    const fetchBlogs = async () => {
      try {
        const res = await handleGetDoctorBlogs(doctorId, { status: 'published' })
        const data = res?.data ?? res?.blogs ?? res ?? []
        setBlogs(Array.isArray(data) ? data : [])
      } catch (_) {
        setBlogs([])
      }
    }
    fetchBlogs()
  }, [doctorId])

  return (
    <>
      {selectedBlog && (
        <BlogDetailModal blog={selectedBlog} onClose={() => setSelectedBlog(null)} />
      )}

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-purple-600" />
            </div>
            Articles by {displayName}
          </h3>
          {blogs.length > 0 && (
            <span className="text-sm font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {blogs.length} article{blogs.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {blogLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-2/3 mb-3" />
                <div className="h-3 bg-slate-100 rounded w-full mb-2" />
                <div className="h-3 bg-slate-100 rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 border border-slate-100 text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-8 h-8 text-purple-300" />
            </div>
            <h4 className="text-slate-700 font-semibold text-base mb-1">No Articles Yet</h4>
            <p className="text-slate-400 text-sm">
              {displayName} hasn't published any articles yet.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {blogs.map(blog => (
              <BlogCard key={blog._id} blog={blog} onClick={setSelectedBlog} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
