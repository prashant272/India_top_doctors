'use client'

import { useEffect, useState } from 'react'
import { useBlog } from '@/app/hooks/useBlog'
import {
  BookOpen, Search, Hash, ArrowRight,
  User, Globe, Star, X, ChevronLeft, ChevronRight,
  Calendar, Filter, AlertCircle, Flame, Clock, BadgeCheck,
} from 'lucide-react'
import Navbar from '../Components/common/Navbar/Navbar'
import Footer from '../Components/common/Footer/Footer'

function getImageUrl(featuredImage) {
  if (!featuredImage) return null
  if (typeof featuredImage === 'string') return featuredImage
  if (typeof featuredImage === 'object' && featuredImage.url) return featuredImage.url
  return null
}

function formatDateParts(d) {
  if (!d) return { day: '--', month: '---', year: '----' }
  const date = new Date(d)
  return {
    day:   date.toLocaleDateString('en-IN', { day: '2-digit' }),
    month: date.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase(),
    year:  date.toLocaleDateString('en-IN', { year: 'numeric' }),
  }
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function readTime(content) {
  if (!content) return '3 min read'
  return `${Math.max(1, Math.ceil(content.split(' ').length / 200))} min read`
}

function ImageWithFallback({ src, alt, className }) {
  const [errored, setErrored] = useState(false)
  if (!src || errored) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-100 to-teal-200">
        <BookOpen className="w-16 h-16 text-teal-300" />
      </div>
    )
  }
  return <img src={src} alt={alt} className={className} onError={() => setErrored(true)} />
}

function BlogDetailModal({ blog, onClose }) {
  const imageUrl = getImageUrl(blog.featuredImage)
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-600 border border-teal-200">
              <Globe className="w-3 h-3" /> Platform Blog
            </span>
            {blog.isFeatured && (
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                <Star className="w-3 h-3" /> Featured
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {imageUrl && (
          <div className="h-64 overflow-hidden bg-gray-100">
            <ImageWithFallback src={imageUrl} alt={blog.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 leading-tight">{blog.title}</h1>
          <div className="flex items-center gap-5 text-sm text-gray-400 mb-5 flex-wrap">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-500" /> Admin
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-500" />
              {formatDate(blog.publishedAt || blog.createdAt)}
            </span>
          </div>
          {blog.excerpt && (
            <p className="text-gray-500 text-base italic border-l-4 border-teal-300 pl-4 mb-6 py-1 bg-teal-50 rounded-r-xl">
              {blog.excerpt}
            </p>
          )}
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{blog.content}</p>
          {Array.isArray(blog.tags) && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-100">
              {blog.tags.map((tag, i) => (
                <span key={i} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-teal-50 text-teal-600 rounded-full font-semibold border border-teal-100">
                  <Hash className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>
          )}
          {(blog.seo?.metaTitle || blog.seo?.metaDescription) && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">SEO Preview</p>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-teal-600 text-sm font-semibold mb-1">{blog.seo.metaTitle || blog.title}</p>
                {blog.seo.metaDescription && (
                  <p className="text-gray-500 text-xs leading-relaxed">{blog.seo.metaDescription}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FeaturedBlogCard({ blog, onClick }) {
  const imageUrl = getImageUrl(blog.featuredImage)
  const category = Array.isArray(blog.tags) && blog.tags.length > 0 ? blog.tags[0] : 'General'

  return (
    <article
      onClick={() => onClick(blog)}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-teal-200 cursor-pointer lg:col-span-2"
    >
      <div className="grid lg:grid-cols-2 h-full">
        <div className="relative overflow-hidden h-60 lg:h-auto min-h-[260px]">
          <ImageWithFallback
            src={imageUrl}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="flex items-center gap-1 px-3 py-1 bg-amber-400 text-white text-xs font-bold rounded-full shadow-lg">
              <Flame className="w-3 h-3 fill-white" /> Featured
            </span>
            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full capitalize shadow-lg">
              {category}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 text-white/80 text-xs">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(blog.publishedAt || blog.createdAt)}</span>
          </div>
        </div>

        <div className="p-7 flex flex-col justify-center space-y-4">
          <span className="inline-flex items-center gap-1.5 self-start text-xs font-bold px-3 py-1 bg-teal-50 text-teal-600 border border-teal-100 rounded-full">
            <BadgeCheck className="w-3.5 h-3.5" /> Editor's Pick
          </span>
          <h2 className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight group-hover:text-teal-600 transition-colors duration-300">
            {blog.title}
          </h2>
          {blog.excerpt && (
            <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{blog.excerpt}</p>
          )}
          <div className="flex items-center gap-3 pt-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-black">A</div>
            <div>
              <p className="text-gray-800 text-sm font-semibold">Admin</p>
              <p className="text-gray-400 text-xs">DocCare Editorial Team</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 self-start px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-bold rounded-xl group-hover:from-teal-600 group-hover:to-teal-700 transition-all duration-300 shadow-md shadow-teal-500/20">
            Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </article>
  )
}

function BlogCard({ blog, onClick }) {
  const { day, month, year } = formatDateParts(blog.publishedAt || blog.createdAt)
  const category = Array.isArray(blog.tags) && blog.tags.length > 0 ? blog.tags[0] : 'General'
  const imageUrl = getImageUrl(blog.featuredImage)

  return (
    <article
      onClick={() => onClick(blog)}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-teal-200 hover:-translate-y-1.5 cursor-pointer flex flex-col"
    >
      <div className="relative overflow-hidden">
        <div className="aspect-[16/10] bg-gradient-to-br from-teal-100 to-teal-200 relative overflow-hidden">
          <ImageWithFallback
            src={imageUrl}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
        <div className="absolute top-3 right-3 bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-3.5 py-2.5 text-center min-w-[52px]">
            <p className="text-2xl font-black leading-none">{day}</p>
            <p className="text-[10px] font-bold mt-0.5">{month}</p>
            <p className="text-[10px] opacity-80">{year}</p>
          </div>
        </div>
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-orange-500 text-white text-[11px] font-bold rounded-full capitalize shadow-md">
            {category}
          </span>
        </div>
        {blog.isFeatured && (
          <div className="absolute bottom-3 left-3">
            <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-400 text-white shadow-md">
              <Star className="w-3 h-3 fill-white" /> Featured
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 space-y-3">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-[10px] font-black shrink-0">A</div>
          <span className="font-medium text-gray-500">Admin</span>
        </div>
        <h3 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-teal-600 transition-colors duration-300 leading-snug">
          {blog.title}
        </h3>
        {blog.excerpt && (
          <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed flex-1">{blog.excerpt}</p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-1">
            {Array.isArray(blog.tags) && blog.tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 bg-teal-50 text-teal-600 border border-teal-100 rounded-full font-semibold">
                #{tag}
              </span>
            ))}
          </div>
          <span className="flex items-center gap-1 text-teal-600 font-bold text-xs group-hover:text-orange-500 transition-colors shrink-0">
            Read More <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </article>
  )
}

function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="aspect-[16/10] bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2 items-center">
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="flex justify-between pt-3 border-t border-gray-100">
          <div className="flex gap-1">
            <div className="h-4 bg-gray-100 rounded-full w-14" />
            <div className="h-4 bg-gray-100 rounded-full w-14" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  )
}

const LIMIT = 9

export default function BlogPage() {
  const { loading, handleGetPlatformBlogs } = useBlog()

  const [blogs,        setBlogs]        = useState([])
  const [total,        setTotal]        = useState(0)
  const [page,         setPage]         = useState(1)
  const [search,       setSearch]       = useState('')
  const [searchInput,  setSearchInput]  = useState('')
  const [activeTag,    setActiveTag]    = useState('')
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [allTags,      setAllTags]      = useState([])

  const fetchBlogs = async (pg = 1, q = search) => {
    try {
      const params = { page: pg, limit: LIMIT }
      if (q) params.search = q
      const res  = await handleGetPlatformBlogs(params)
      const data = res?.data ?? res?.blogs ?? res?.result ?? []
      const tot  = res?.total ?? data.length
      setBlogs(Array.isArray(data) ? data : [])
      setTotal(tot)
      const tags = [...new Set(data.flatMap(b => b.tags || []))]
      if (pg === 1) setAllTags(prev => [...new Set([...prev, ...tags])])
    } catch (_) {
      setBlogs([])
    }
  }

  useEffect(() => { fetchBlogs(1, '') }, [])
  useEffect(() => { fetchBlogs(page, search) }, [page])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
    fetchBlogs(1, searchInput)
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearch('')
    setActiveTag('')
    setPage(1)
    fetchBlogs(1, '')
  }

  const filteredByTag = activeTag
    ? blogs.filter(b => Array.isArray(b.tags) && b.tags.includes(activeTag))
    : blogs

  const featuredBlog   = filteredByTag.find(b => b.isFeatured) || filteredByTag[0]
  const remainingBlogs = featuredBlog ? filteredByTag.filter(b => b._id !== featuredBlog._id) : filteredByTag
  const totalPages     = Math.ceil(total / LIMIT)

  return (
    <>
      <Navbar />
      {selectedBlog && (
        <BlogDetailModal blog={selectedBlog} onClose={() => setSelectedBlog(null)} />
      )}

      <div className="min-h-screen bg-slate-50">

        {/* ── Compact Hero Banner ── */}
        <div className="relative bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 50%, rgba(20,184,166,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(8,145,178,0.15) 0%, transparent 45%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          <div className="absolute right-0 top-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/15 border border-teal-400/25 rounded-full text-teal-300 text-xs font-semibold backdrop-blur-sm">
                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                <BookOpen className="w-3.5 h-3.5" />
                Health & Wellness Blog
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
                Latest News &{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 whitespace-nowrap">
                  Health Articles
                </span>
              </h1>
              <p className="text-slate-400 text-sm max-w-md">
                Expert insights, research and health tips from our trusted medical team.
              </p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto sm:min-w-[320px]">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full pl-10 pr-9 py-2.5 bg-white/10 border border-white/15 rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                />
                {searchInput && (
                  <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-orange-900/30 hover:scale-[1.03] active:scale-[0.97] text-sm"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {allTags.length > 0 && (
            <div className="flex items-center gap-2.5 mb-7 flex-wrap">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                <Filter className="w-4 h-4" /> Filter:
              </div>
              <button
                onClick={() => setActiveTag('')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  activeTag === ''
                    ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-500/20'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-teal-300 hover:text-teal-600'
                }`}
              >
                All
              </button>
              {allTags.slice(0, 10).map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
                  className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-bold border transition-all capitalize ${
                    activeTag === tag
                      ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-500/20'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-teal-300 hover:text-teal-600'
                  }`}
                >
                  <Hash className="w-3 h-3" /> {tag}
                </button>
              ))}
            </div>
          )}

          {(search || activeTag) && (
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <p className="text-sm text-slate-500 font-medium">
                {activeTag ? `Showing articles tagged "${activeTag}"` : `Results for "${search}"`}
                {' '}— <span className="text-slate-800 font-bold">{filteredByTag.length}</span> article{filteredByTag.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={clearSearch}
                className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 px-3 py-1 bg-red-50 rounded-full border border-red-200 transition"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <BlogCardSkeleton key={i} />)}
            </div>
          ) : filteredByTag.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {featuredBlog && <FeaturedBlogCard blog={featuredBlog} onClick={setSelectedBlog} />}
                {remainingBlogs.map(blog => (
                  <BlogCard key={blog._id} blog={blog} onClick={setSelectedBlog} />
                ))}
              </div>

              {!activeTag && totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-teal-50 hover:border-teal-300 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                        acc.push(p)
                        return acc
                      }, [])
                      .map((p, i) =>
                        p === '...' ? (
                          <span key={`e-${i}`} className="px-2 text-slate-400 text-sm">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-10 h-10 rounded-xl text-sm font-bold transition shadow-sm ${
                              page === p
                                ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-teal-50 hover:border-teal-300'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                  </div>

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-teal-50 hover:border-teal-300 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-teal-300" />
              </div>
              <h4 className="text-slate-700 font-bold text-xl mb-2">No Articles Found</h4>
              <p className="text-slate-400 text-sm mb-5">
                {search
                  ? `No results for "${search}". Try a different keyword.`
                  : 'No articles have been published yet. Check back soon!'}
              </p>
              {search && (
                <button
                  onClick={clearSearch}
                  className="px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition text-sm shadow-lg shadow-teal-600/20"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  )
}
