'use client'

import React, { useState, useEffect, useMemo } from 'react'
import MarkdownRenderer, { stripMarkdown } from '../components/MarkdownRenderer'
import {
  Search,
  Tag as TagIcon,
  Eye,
  Heart,
  MessageSquare,
  ArrowLeft,
  User,
  Calendar,
  Send,
  X,
  Clock,
  Bookmark,
  Share2,
  Check,
  TrendingUp,
  BookOpen,
  FileText
} from 'lucide-react'

interface Comment {
  id: string
  text: string
  author: string
  createdAt: string
}

interface BlogPost {
  _id: string
  title: string
  content: string
  tags: string[]
  author: string
  reads: number
  likes: number
  comments: Comment[]
  createdAt: string
}

export default function Blog() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Reader detail overlay state
  const [activeBlogId, setActiveBlogId] = useState<string | null>(null)
  const [activeBlog, setActiveBlog] = useState<BlogPost | null>(null)
  const [loadingActive, setLoadingActive] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Local storage bookmarks
  const [bookmarkedBlogIds, setBookmarkedBlogIds] = useState<string[]>([])
  const [copiedShare, setCopiedShare] = useState(false)

  // Comment Form State
  const [newCommentText, setNewCommentText] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('')

  // Fetch blogs on load
  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/blogs')
      if (!res.ok) throw new Error('Failed to load blog posts')
      const data = await res.json()
      setBlogs(data)
    } catch (err: any) {
      console.error(err)
      setError('Error loading blog posts. Please ensure backend services are connected.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch user profile to default comment author
  const fetchProfileName = async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        if (data.name) setCommentAuthor(data.name)
      }
    } catch (err) {
      console.error('Failed to fetch profile name for comments:', err)
      setCommentAuthor('Dharmendra Pandit')
    }
  }

  useEffect(() => {
    fetchBlogs()
    fetchProfileName()

    try {
      const stored = localStorage.getItem('careeros_bookmarked_blogs')
      if (stored) setBookmarkedBlogIds(JSON.parse(stored))
    } catch (e) {
      console.error('Failed to parse blog bookmarks from storage', e)
    }
  }, [])

  // Reading progress tracker for active article
  useEffect(() => {
    if (!activeBlogId) return

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)))
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeBlogId])

  // Handle bookmarking
  const toggleBookmarkBlog = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setBookmarkedBlogIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      localStorage.setItem('careeros_bookmarked_blogs', JSON.stringify(next))
      return next
    })
  }

  // Handle opening a blog details view
  const handleOpenBlog = async (id: string) => {
    try {
      setActiveBlogId(id)
      setLoadingActive(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })

      const res = await fetch(`/api/blogs/${id}`)
      if (!res.ok) throw new Error('Failed to retrieve blog details')
      const blogData = await res.json()

      setActiveBlog(blogData)

      // Update read count in local list
      setBlogs((prev) => prev.map((b) => (b._id === id ? { ...b, reads: b.reads + 1 } : b)))
    } catch (err) {
      console.error(err)
      alert('Could not open article details.')
      setActiveBlogId(null)
    } finally {
      setLoadingActive(false)
    }
  }

  // Handle liking a blog
  const handleLikeBlog = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/blogs/${id}/like`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to like post')
      const data = await res.json()

      if (activeBlog && activeBlog._id === id) {
        setActiveBlog((prev) => (prev ? { ...prev, likes: data.likes } : null))
      }
      setBlogs((prev) => prev.map((b) => (b._id === id ? { ...b, likes: data.likes } : b)))
    } catch (err) {
      console.error(err)
    }
  }

  // Handle posting a comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCommentText.trim() || !commentAuthor.trim() || !activeBlog) return

    try {
      const res = await fetch(`/api/blogs/${activeBlog._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newCommentText,
          author: commentAuthor
        })
      })

      if (!res.ok) throw new Error('Failed to submit comment')
      const data = await res.json()

      setActiveBlog((prev) => (prev ? { ...prev, comments: data.comments } : null))
      setBlogs((prev) =>
        prev.map((b) => (b._id === activeBlog._id ? { ...b, comments: data.comments } : b))
      )

      setNewCommentText('')
    } catch (err) {
      console.error(err)
      alert('Failed to submit comment.')
    }
  }

  const handleShareArticle = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(window.location.href)
    setCopiedShare(true)
    setTimeout(() => setCopiedShare(false), 2000)
  }

  // Calculate estimated reading time
  const getReadTime = (content: string) => {
    const words = content ? content.trim().split(/\s+/).length : 0
    const minutes = Math.max(1, Math.ceil(words / 200))
    return `${minutes} min read`
  }

  // Dynamic tags list
  const allTags = useMemo(
    () => Array.from(new Set(blogs.flatMap((blog) => blog.tags || []))),
    [blogs]
  )

  // Filter logic
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch =
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.author.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTag = !selectedTag || blog.tags.includes(selectedTag)

      return matchesSearch && matchesTag
    })
  }, [blogs, searchQuery, selectedTag])

  // Featured article
  const featuredBlog = useMemo(() => {
    if (blogs.length === 0) return null
    return [...blogs].sort((a, b) => b.reads - a.reads)[0]
  }, [blogs])

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Get Initials for Avatar
  const getAvatarInitials = (name: string) => {
    if (!name) return 'CP'
    const parts = name.split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  /* ========================================================================= */
  /* SINGLE BLOG ARTICLE READ VIEW                                             */
  /* ========================================================================= */
  if (activeBlogId) {
    return (
      <div className="relative min-h-screen text-zinc-100 animate-fade-in pb-16">
        {/* Top Reading Progress Bar */}
        <div
          className="fixed top-0 left-0 h-1 bg-white z-50 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />

        <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-8">
          
          {/* Top Floating Bar */}
          <div className="sticky top-4 z-40 flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 shadow-xl">
            <button
              onClick={() => {
                setActiveBlogId(null)
                setActiveBlog(null)
              }}
              className="flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 px-3.5 py-2 rounded-lg border border-zinc-800 transition-all cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Articles
            </button>

            {activeBlog && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareArticle}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-all cursor-pointer"
                  title="Share Article Link"
                >
                  {copiedShare ? <Check size={13} className="text-zinc-100" /> : <Share2 size={13} />}
                  <span>{copiedShare ? 'Copied' : 'Share'}</span>
                </button>

                <button
                  onClick={(e) => toggleBookmarkBlog(activeBlog._id, e)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    bookmarkedBlogIds.includes(activeBlog._id)
                      ? 'bg-zinc-100 text-zinc-950 border-white'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                  title="Bookmark Article"
                >
                  <Bookmark size={14} className={bookmarkedBlogIds.includes(activeBlog._id) ? 'fill-zinc-950' : ''} />
                </button>

                <button
                  onClick={(e) => handleLikeBlog(e, activeBlog._id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  <Heart size={14} className="text-zinc-300" />
                  <span>{activeBlog.likes}</span>
                </button>
              </div>
            )}
          </div>

          {/* Article Loading State */}
          {loadingActive ? (
            <div className="flex flex-col items-center justify-center py-28 space-y-4">
              <div className="w-10 h-10 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Loading Article Content...
              </p>
            </div>
          ) : activeBlog ? (
            <div className="space-y-8 max-w-3xl mx-auto">
              
              {/* Header */}
              <div className="space-y-4 border-b border-zinc-850 pb-6">
                
                {/* Category Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  {activeBlog.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-800 text-zinc-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Main Article Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-100 tracking-tight leading-tight">
                  {activeBlog.title}
                </h1>

                {/* Author & Meta Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-200 text-xs">
                      {getAvatarInitials(activeBlog.author)}
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-zinc-100">{activeBlog.author}</span>
                      <span className="text-[11px] text-zinc-400 font-normal flex items-center gap-2 mt-0.5">
                        <Calendar size={11} className="text-zinc-500" />
                        {formatDate(activeBlog.createdAt)}
                        <span>•</span>
                        <Clock size={11} className="text-zinc-500" />
                        {getReadTime(activeBlog.content)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg font-medium">
                      <Eye size={13} className="text-zinc-400" /> {activeBlog.reads} reads
                    </span>
                    <span className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg font-medium">
                      <Heart size={13} className="text-zinc-400" /> {activeBlog.likes} likes
                    </span>
                  </div>
                </div>

              </div>

              {/* Key Summary Box */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs">
                  <BookOpen size={14} /> Executive Summary
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                  {stripMarkdown(activeBlog.content).slice(0, 220)}...
                </p>
              </div>

              {/* Article Main Body */}
              <article className="prose prose-invert max-w-none text-zinc-200 text-base leading-relaxed space-y-6">
                <MarkdownRenderer content={activeBlog.content} />
              </article>

              {/* Bottom Reaction Toolbar */}
              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div>
                  <h4 className="text-sm font-bold text-zinc-100">Did you find this article insightful?</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Show support for the author or share it with colleagues.</p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={(e) => handleLikeBlog(e, activeBlog._id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 transition-colors cursor-pointer"
                  >
                    <Heart size={14} className="fill-zinc-950 text-zinc-950" />
                    <span>Like ({activeBlog.likes})</span>
                  </button>

                  <button
                    onClick={handleShareArticle}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
                  >
                    <Share2 size={14} />
                    <span>{copiedShare ? 'Copied' : 'Share'}</span>
                  </button>
                </div>
              </div>

              {/* Discussion Section */}
              <div className="pt-8 border-t border-zinc-850 space-y-6">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-zinc-300" />
                  <h3 className="text-base font-bold text-zinc-100">
                    Discussion ({activeBlog.comments?.length || 0})
                  </h3>
                </div>

                {/* Comment Form */}
                <form
                  onSubmit={handlePostComment}
                  className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-3"
                >
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                        Author Name
                      </label>
                      <input
                        type="text"
                        required
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                        className="w-full text-xs font-medium rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 p-2.5 focus:border-zinc-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                      Comment
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Share your technical perspective or feedback..."
                      className="w-full text-xs font-normal rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 p-3 focus:border-zinc-500 outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 transition-colors cursor-pointer"
                    >
                      <Send size={12} />
                      <span>Post Comment</span>
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-3">
                  {!activeBlog.comments || activeBlog.comments.length === 0 ? (
                    <div className="text-center py-6 p-4 rounded-xl bg-zinc-900 border border-zinc-850">
                      <p className="text-xs text-zinc-500 font-normal">
                        No comments yet. Start the conversation above.
                      </p>
                    </div>
                  ) : (
                    activeBlog.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-4 rounded-xl border border-zinc-850 bg-zinc-900 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-[9px] text-zinc-300">
                              {getAvatarInitials(comment.author)}
                            </div>
                            <span className="font-semibold text-zinc-200">{comment.author}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed font-normal pl-7">
                          {comment.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          ) : null}

        </div>
      </div>
    )
  }

  /* ========================================================================= */
  /* BLOG LISTING VIEW                                                         */
  /* ========================================================================= */
  return (
    <div className="p-6 text-zinc-100 min-h-screen max-w-7xl mx-auto space-y-7 animate-fade-in">
      
      {/* Top Hero Banner */}
      <div className="rounded-2xl p-6 sm:p-8 bg-zinc-900 border border-zinc-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 border border-zinc-700 text-zinc-300 inline-flex items-center gap-1.5">
              <FileText size={12} /> Engineering &amp; Industry Blog
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
              CareerOS Technical Publications
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
              Technical guides, architecture breakdowns, interview prep strategies, and industry insights.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-zinc-950 p-3.5 rounded-xl border border-zinc-850">
            <div className="text-center px-3">
              <span className="block text-xl font-bold text-zinc-100">{blogs.length}</span>
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Articles</span>
            </div>
            <div className="text-center px-3 border-l border-zinc-850">
              <span className="block text-xl font-bold text-zinc-200">
                {blogs.reduce((acc, b) => acc + (b.reads || 0), 0)}
              </span>
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Total Reads</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Spotlight Card */}
      {featuredBlog && !searchQuery && !selectedTag && (
        <div
          onClick={() => handleOpenBlog(featuredBlog._id)}
          className="rounded-2xl p-6 sm:p-7 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-zinc-800 border border-zinc-700 text-zinc-200">
                Featured Article
              </span>
              <span className="text-xs text-zinc-400 font-normal">
                {getReadTime(featuredBlog.content)}
              </span>
            </div>

            <button
              onClick={(e) => toggleBookmarkBlog(featuredBlog._id, e)}
              className="text-zinc-500 hover:text-zinc-200 p-1 rounded-md transition-colors"
            >
              <Bookmark
                size={15}
                className={bookmarkedBlogIds.includes(featuredBlog._id) ? 'fill-zinc-100 text-zinc-100' : ''}
              />
            </button>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 group-hover:text-white transition-colors">
              {featuredBlog.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-2 font-normal max-w-4xl">
              {stripMarkdown(featuredBlog.content)}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-zinc-850 text-xs text-zinc-400 font-medium">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-zinc-300">
                {getAvatarInitials(featuredBlog.author)}
              </div>
              <span className="font-semibold text-zinc-200">{featuredBlog.author}</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <Eye size={13} /> {featuredBlog.reads} reads
              </span>
              <span className="flex items-center gap-1">
                <Heart size={13} /> {featuredBlog.likes}
              </span>
              <span className="text-zinc-200 font-semibold group-hover:underline">
                Read Publication →
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Search & Tag Filter Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search articles by title, keyword, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 pl-10 pr-4 py-2.5 focus:border-zinc-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Dynamic Topic Pills */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 max-w-full md:max-w-lg">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                  selectedTag === null
                    ? 'bg-zinc-100 text-zinc-950 border-white'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                All Topics
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                    tag === selectedTag
                      ? 'bg-zinc-100 text-zinc-950 border-white'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Blog Cards Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl p-6 border border-zinc-800 bg-zinc-900 space-y-4 animate-pulse h-72"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-3">
          <p className="text-xs font-medium text-zinc-400">{error}</p>
          <button
            onClick={fetchBlogs}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-3">
          <FileText size={32} className="mx-auto text-zinc-600" />
          <h3 className="text-sm font-semibold text-zinc-300">No articles match your search</h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Try adjusting your search terms or resetting the selected topic filter.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBlogs.map((blog) => {
            const isBookmarked = bookmarkedBlogIds.includes(blog._id)

            return (
              <div
                key={blog._id}
                onClick={() => handleOpenBlog(blog._id)}
                className="rounded-2xl p-5 sm:p-6 border border-zinc-800 bg-zinc-900 hover:border-zinc-700 cursor-pointer flex flex-col justify-between h-72 transition-all duration-200 group relative"
              >
                <div className="space-y-3">
                  
                  {/* Top Row: Tags & Read time */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {blog.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-zinc-800 border border-zinc-700 text-zinc-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 font-medium">
                        {getReadTime(blog.content)}
                      </span>
                      <button
                        onClick={(e) => toggleBookmarkBlog(blog._id, e)}
                        className={`p-1 rounded transition-colors ${
                          isBookmarked ? 'text-zinc-100' : 'text-zinc-600 hover:text-zinc-300'
                        }`}
                      >
                        <Bookmark size={13} className={isBookmarked ? 'fill-zinc-100' : ''} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                    {blog.title}
                  </h3>

                  {/* Content Preview */}
                  <p className="text-xs text-zinc-400 font-normal line-clamp-3 leading-relaxed">
                    {stripMarkdown(blog.content)}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between border-t border-zinc-850 pt-3 mt-4 text-xs text-zinc-500">
                  <div className="flex items-center gap-2 truncate max-w-[140px]">
                    <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] font-bold text-zinc-300 flex-shrink-0">
                      {getAvatarInitials(blog.author)}
                    </div>
                    <span className="font-semibold text-zinc-300 truncate">{blog.author}</span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 font-normal text-[11px]">
                    <span className="flex items-center gap-1 hover:text-zinc-300">
                      <Eye size={12} /> {blog.reads}
                    </span>
                    <button
                      onClick={(e) => handleLikeBlog(e, blog._id)}
                      className="flex items-center gap-1 hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                      <Heart size={12} /> {blog.likes}
                    </button>
                    <span className="flex items-center gap-1 hover:text-zinc-300">
                      <MessageSquare size={12} /> {blog.comments?.length || 0}
                    </span>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
