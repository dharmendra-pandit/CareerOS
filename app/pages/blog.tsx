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

    // Read stored blog bookmarks
    try {
      const stored = localStorage.getItem('careeros_bookmarked_blogs')
      if (stored) setBookmarkedBlogIds(JSON.parse(stored))
    } catch (e) {
      console.error('Failed reading blog bookmarks', e)
    }
  }, [])

  // Toggle bookmark handler
  const toggleBookmarkBlog = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setBookmarkedBlogIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      localStorage.setItem('careeros_bookmarked_blogs', JSON.stringify(next))
      return next
    })
  }

  // Like blog handler
  const handleLikeBlog = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/blogs/${id}/like`, { method: 'POST' })
      if (res.ok) {
        const updated = await res.json()
        setBlogs((prev) => prev.map((b) => (b._id === id ? { ...b, likes: updated.likes } : b)))
        if (activeBlog && activeBlog._id === id) {
          setActiveBlog((prev) => (prev ? { ...prev, likes: updated.likes } : null))
        }
      }
    } catch (err) {
      console.error('Failed to like blog:', err)
    }
  }

  // Open single blog detail
  const handleOpenBlog = async (id: string) => {
    setActiveBlogId(id)
    setLoadingActive(true)
    setScrollProgress(0)

    // Pre-set from local list
    const found = blogs.find((b) => b._id === id)
    if (found) setActiveBlog(found)

    try {
      const res = await fetch(`/api/blogs/${id}`)
      if (res.ok) {
        const data = await res.json()
        setActiveBlog(data)
        // Also update read count in overall state
        setBlogs((prev) => prev.map((b) => (b._id === id ? { ...b, reads: data.reads } : b)))
      }
    } catch (err) {
      console.error('Failed fetching blog detail:', err)
    } finally {
      setLoadingActive(false)
    }
  }

  const handleCloseBlog = () => {
    setActiveBlogId(null)
    setActiveBlog(null)
  }

  // Comment submission handler
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeBlogId || !newCommentText.trim()) return

    try {
      const res = await fetch(`/api/blogs/${activeBlogId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: commentAuthor || 'Dharmendra Pandit',
          text: newCommentText.trim()
        })
      })

      if (res.ok) {
        const updatedComments = await res.json()
        setActiveBlog((prev) => (prev ? { ...prev, comments: updatedComments } : null))
        setBlogs((prev) =>
          prev.map((b) => (b._id === activeBlogId ? { ...b, comments: updatedComments } : b))
        )
        setNewCommentText('')
      }
    } catch (err) {
      console.error('Failed to post comment:', err)
    }
  }

  // Scroll listener for reading progress bar
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const totalHeight = target.scrollHeight - target.clientHeight
    if (totalHeight > 0) {
      const current = target.scrollTop
      setScrollProgress(Math.min(100, Math.max(0, (current / totalHeight) * 100)))
    }
  }

  // Share Article link
  const handleShareArticle = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopiedShare(true)
      setTimeout(() => setCopiedShare(false), 2500)
    }
  }

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>()
    blogs.forEach((b) => b.tags?.forEach((t) => set.add(t)))
    return Array.from(set)
  }, [blogs])

  // Filtered blogs based on search query & selected tag
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchesSearch =
        searchQuery === '' ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTag = !selectedTag || (b.tags && b.tags.includes(selectedTag))

      return matchesSearch && matchesTag
    })
  }, [blogs, searchQuery, selectedTag])

  // Top featured blog (first item or most read)
  const featuredBlog = useMemo(() => {
    if (blogs.length === 0) return null
    return [...blogs].sort((a, b) => b.reads - a.reads)[0]
  }, [blogs])

  // Calculate read time string
  const getReadTime = (content: string) => {
    const words = content.trim().split(/\s+/).length
    const mins = Math.ceil(words / 200)
    return `${mins} min read`
  }

  // Format date helper
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recently'
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getAvatarInitials = (name: string) => {
    if (!name) return 'DP'
    const parts = name.split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  /* ========================================================================= */
  /* READER OVERLAY VIEW (SINGLE ARTICLE)                                      */
  /* ========================================================================= */
  if (activeBlogId) {
    return (
      <div
        onScroll={handleScroll}
        className="fixed inset-0 z-50 bg-zinc-950/95 overflow-y-auto backdrop-blur-xl animate-fade-in text-zinc-100"
      >
        {/* Fixed Top Reading Progress Bar */}
        <div
          className="fixed top-0 left-0 h-1 bg-indigo-500 transition-all duration-150 z-50 shadow-[0_0_10px_#6366f1]"
          style={{ width: `${scrollProgress}%` }}
        />

        <div className="min-h-screen p-4 sm:p-8 max-w-4xl mx-auto space-y-8 relative">
          
          {/* Top Sticky Header Bar */}
          <div className="sticky top-4 z-40 flex items-center justify-between p-4 rounded-2xl glass-panel bg-zinc-950/90 border border-zinc-800/80 shadow-2xl">
            <button
              onClick={handleCloseBlog}
              className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back to Publications</span>
            </button>

            {activeBlog && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleShareArticle}
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
                  title="Share Article"
                >
                  {copiedShare ? <Check size={14} className="text-indigo-400" /> : <Share2 size={14} />}
                </button>

                <button
                  onClick={() => toggleBookmarkBlog(activeBlog._id)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    bookmarkedBlogIds.includes(activeBlog._id)
                      ? 'bg-indigo-600 text-white border-indigo-500/30'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                  title="Bookmark Article"
                >
                  <Bookmark size={14} className={bookmarkedBlogIds.includes(activeBlog._id) ? 'fill-white' : ''} />
                </button>

                <button
                  onClick={(e) => handleLikeBlog(e, activeBlog._id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 transition-all cursor-pointer"
                >
                  <Heart size={14} className="text-indigo-400" />
                  <span>{activeBlog.likes}</span>
                </button>
              </div>
            )}
          </div>

          {/* Article Loading State */}
          {loadingActive ? (
            <div className="flex flex-col items-center justify-center py-28 space-y-4">
              <div className="w-10 h-10 border-2 border-zinc-700 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
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
                      className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Main Article Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-100 tracking-tight leading-tight">
                  {activeBlog.title}
                </h1>

                {/* Author & Meta Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-indigo-400 text-xs">
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
                    <span className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-xl font-semibold">
                      <Eye size={13} className="text-indigo-400" /> {activeBlog.reads} reads
                    </span>
                    <span className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-xl font-semibold">
                      <Heart size={13} className="text-indigo-400" /> {activeBlog.likes} likes
                    </span>
                  </div>
                </div>

              </div>

              {/* Key Summary Box */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
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
              <div className="p-6 rounded-2xl glass-card bg-zinc-900/60 border border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div>
                  <h4 className="text-sm font-bold text-zinc-100">Did you find this article insightful?</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Show support for the author or share it with colleagues.</p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={(e) => handleLikeBlog(e, activeBlog._id)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    <Heart size={14} className="fill-white text-white" />
                    <span>Like ({activeBlog.likes})</span>
                  </button>

                  <button
                    onClick={handleShareArticle}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-all cursor-pointer"
                  >
                    <Share2 size={14} />
                    <span>{copiedShare ? 'Copied' : 'Share'}</span>
                  </button>
                </div>
              </div>

              {/* Discussion Section */}
              <div className="pt-8 border-t border-zinc-850 space-y-6">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-indigo-400" />
                  <h3 className="text-base font-bold text-zinc-100">
                    Discussion ({activeBlog.comments?.length || 0})
                  </h3>
                </div>

                {/* Comment Form */}
                <form
                  onSubmit={handlePostComment}
                  className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 space-y-3"
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
                        className="w-full text-xs font-medium rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 p-2.5 focus:border-indigo-500 outline-none"
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
                      className="w-full text-xs font-normal rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 p-3 focus:border-indigo-500 outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                    >
                      <Send size={12} />
                      <span>Post Comment</span>
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-3">
                  {!activeBlog.comments || activeBlog.comments.length === 0 ? (
                    <div className="text-center py-6 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-850">
                      <p className="text-xs text-zinc-500 font-normal">
                        No comments yet. Start the conversation above.
                      </p>
                    </div>
                  ) : (
                    activeBlog.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-4 rounded-2xl border border-zinc-850 bg-zinc-900/40 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-[9px] text-indigo-400">
                              {getAvatarInitials(comment.author)}
                            </div>
                            <span className="font-bold text-zinc-200">{comment.author}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed font-normal pl-8">
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
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-zinc-800/80 bg-gradient-to-r from-indigo-950/40 via-zinc-900/60 to-zinc-900/40 shadow-2xl shadow-indigo-500/5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 inline-flex items-center gap-1.5 glow-indigo">
              <FileText size={13} /> Engineering &amp; Industry Blog
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">
              CareerOS Technical Publications
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
              Technical guides, architecture breakdowns, interview prep strategies, and industry insights.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800/80 backdrop-blur-md">
            <div className="text-center px-3">
              <span className="block text-xl font-black text-zinc-100">{blogs.length}</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Articles</span>
            </div>
            <div className="text-center px-3 border-l border-zinc-800/80">
              <span className="block text-xl font-black text-indigo-400">
                {blogs.reduce((acc, b) => acc + (b.reads || 0), 0)}
              </span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Reads</span>
            </div>
          </div>
        </div>
      </div>

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
              className="w-full text-xs font-medium rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 pl-10 pr-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all"
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  selectedTag === null
                    ? 'bg-indigo-600 text-white border-indigo-500/30 shadow-md shadow-indigo-600/20'
                    : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                All Topics
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    tag === selectedTag
                      ? 'bg-indigo-600 text-white border-indigo-500/30 shadow-md shadow-indigo-600/20'
                      : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:bg-zinc-900'
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
              className="glass-card rounded-2xl p-6 border border-zinc-800/80 bg-zinc-900/40 space-y-4 animate-pulse h-72"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 glass-card rounded-3xl border border-zinc-800/80 bg-zinc-900/40 space-y-3">
          <p className="text-xs font-medium text-zinc-400">{error}</p>
          <button
            onClick={fetchBlogs}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-3xl border border-zinc-800/80 bg-zinc-900/40 space-y-3">
          <FileText size={36} className="mx-auto text-zinc-600" />
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
                className="glass-card rounded-2xl p-5 sm:p-6 border border-zinc-800/80 bg-zinc-900/40 hover:border-indigo-500/40 cursor-pointer flex flex-col justify-between h-72 transition-all duration-300 group relative hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]"
              >
                <div className="space-y-3">
                  
                  {/* Top Row: Tags & Read time */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {blog.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
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
                          isBookmarked ? 'text-indigo-400' : 'text-zinc-600 hover:text-zinc-300'
                        }`}
                      >
                        <Bookmark size={13} className={isBookmarked ? 'fill-indigo-400' : ''} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
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
                    <div className="w-6 h-6 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[9px] font-black text-indigo-400 flex-shrink-0">
                      {getAvatarInitials(blog.author)}
                    </div>
                    <span className="font-bold text-zinc-300 truncate">{blog.author}</span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 font-normal text-[11px]">
                    <span className="flex items-center gap-1 hover:text-zinc-300">
                      <Eye size={12} className="text-indigo-400" /> {blog.reads}
                    </span>
                    <button
                      onClick={(e) => handleLikeBlog(e, blog._id)}
                      className="flex items-center gap-1 hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      <Heart size={12} className="text-indigo-400" /> {blog.likes}
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
