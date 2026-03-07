'use client'

import { useEffect, useState } from 'react'
import { Calendar, User, ArrowRight, Tag, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useBlog } from '@/app/hooks/useBlog'

function formatDateParts(d) {
  if (!d) return { day: '--', month: '---', year: '----' }
  const date = new Date(d)
  return {
    day:   date.toLocaleDateString('en-IN', { day:   '2-digit' }),
    month: date.toLocaleDateString('en-IN', { month: 'short'   }).toUpperCase(),
    year:  date.toLocaleDateString('en-IN', { year:  'numeric' }),
  }
}

function getImageUrl(featuredImage) {
  if (!featuredImage) return null
  if (typeof featuredImage === 'string') return featuredImage
  if (typeof featuredImage === 'object' && featuredImage.url) return featuredImage.url
  return null
}

function BlogCard({ post }) {
  const router = useRouter()
  const { day, month, year } = formatDateParts(post.publishedAt || post.createdAt)
  const category = Array.isArray(post.tags) && post.tags.length > 0 ? post.tags[0] : 'General'
  const imageUrl = getImageUrl(post.featuredImage)

  return (
    <article
      onClick={() => router.push('/blog')}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-teal-200 transform hover:-translate-y-2 cursor-pointer"
    >
      <div className="relative overflow-hidden">
        <div className="aspect-[4/3] bg-gradient-to-br from-teal-100 to-teal-200 relative overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={e => { e.target.style.display = 'none' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-teal-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        <div className="absolute top-4 right-4 bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-4 py-3 text-center">
            <p className="text-3xl font-bold leading-none mb-1">{day}</p>
            <p className="text-xs font-semibold">{month}</p>
            <p className="text-xs">{year}</p>
          </div>
        </div>

        <div className="absolute top-4 left-4">
          <span className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full capitalize">
            {category}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <User className="w-4 h-4 text-teal-600" />
          <span>By Admin</span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-teal-600 transition-colors duration-300">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center justify-end pt-4 border-t border-gray-100">
          <span className="flex items-center gap-2 text-teal-600 font-semibold text-sm group-hover:text-orange-600 transition-colors duration-300">
            Read More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </span>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-teal-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </article>
  )
}

function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg border-2 border-gray-100 animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-6 space-y-4">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-5 bg-gray-200 rounded w-full" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-5/6" />
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  )
}

export default function BlogSection() {
  const { loading, handleGetPlatformBlogs } = useBlog()
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res  = await handleGetPlatformBlogs({ limit: 3 })
        const data = res?.data ?? res?.blogs ?? res?.result ?? res ?? []
        setBlogs(Array.isArray(data) ? data : [])
      } catch (_) {
        setBlogs([])
      }
    }
    fetchBlogs()
  }, [])

  const totalArticles = blogs.length > 0 ? `${blogs.length * 10}+` : '100+'
  const categories    = blogs.length > 0
    ? [...new Set(blogs.flatMap(b => b.tags || []))].length || 10
    : 10

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-orange-500 font-semibold text-sm tracking-wider uppercase mb-3">BLOG</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Latest News & Articles
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Stay informed with the latest insights, research, and health tips from our expert team of medical professionals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {loading ? (
            [1, 2, 3].map(i => <BlogCardSkeleton key={i} />)
          ) : blogs.length > 0 ? (
            blogs.map(post => <BlogCard key={post._id} post={post} />)
          ) : (
            <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-teal-300" />
              </div>
              <h4 className="text-gray-700 font-semibold text-lg mb-1">No Articles Yet</h4>
              <p className="text-gray-400 text-sm">Check back soon for the latest health articles and news.</p>
            </div>
          )}
        </div>

        {blogs.length > 0 && (
          <div className="text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold text-lg rounded-full hover:from-orange-500 hover:to-orange-600 transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
            >
              <span>View All Articles</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}

        <div className="mt-20 bg-gradient-to-r from-teal-50 via-orange-50 to-teal-50 rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
                <Tag className="w-8 h-8 text-teal-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{categories}+</p>
              <p className="text-gray-600 font-medium">Categories</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{totalArticles}</p>
              <p className="text-gray-600 font-medium">Articles Published</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
                <User className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">50K+</p>
              <p className="text-gray-600 font-medium">Monthly Readers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
