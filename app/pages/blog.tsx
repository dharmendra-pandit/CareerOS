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
  Sparkles,
  Clock,
  Bookmark,
  Share2,
  Check,
  TrendingUp,
  BookOpen,
  ThumbsUp
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

  // Local storage bookmarks & likes
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
      setCommentAuthor('Dharmendra Pandit') // Fallback
    }
  }

  useEffect(() => {
    fetchBlogs()
    fetchProfileName()

    // Read stored bookmarks
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

  // Featured article (first or highest reads)
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
          className="fixed top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 z-50 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />

        <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-8">
          
          {/* Top Floating Navigation Bar */}
          <div className="sticky top-4 z-40 flex items-center justify-between p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md shadow-2xl">
            <button
              onClick={() => {
                setActiveBlogId(null)
                setActiveBlog(null)
              }}
              className="flex items-center gap-2 text-xs font-bold text-zinc-300 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 px-3.5 py-2 rounded-xl border border-zinc-800 transition-all cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Articles
            </button>

            {activeBlog && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareArticle}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-all cursor-pointer"
                  title="Share Link"
                >
                  {copiedShare ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
                  <span>{copiedShare ? 'Copied!' : 'Share'}</span>
                </button>

                <button
                  onClick={(e) => toggleBookmarkBlog(activeBlog._id, e)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    bookmarkedBlogIds.includes(activeBlog._id)
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                  title="Bookmark Article"
                >
                  <Bookmark size={14} className={bookmarkedBlogIds.includes(activeBlog._id) ? 'fill-rose-500' : ''} />
                </button>

                <button
                  onClick={(e) => handleLikeBlog(e, activeBlog._id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer shadow-sm shadow-rose-500/10"
                >
                  <Heart size={14} className="fill-rose-500/40 text-rose-500" />
                  <span>{activeBlog.likes}</span>
                </button>
              </div>
            )}
          </div>

          {/* Article Loading State */}
          {loadingActive ? (
            <div className="flex flex-col items-center justify-center py-28 space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-zinc-400 tracking-wider uppercase animate-pulse">
                Fetching Article Content...
              </p>
            </div>
          ) : activeBlog ? (
            <div className="space-y-8 max-w-3xl mx-auto">
              
              {/* Hero Header */}
              <div className="space-y-5 border-b border-zinc-850 pb-8">
                
                {/* Category Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  {activeBlog.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                    >
                      #{tag}
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
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border border-indigo-400/40 flex items-center justify-center font-black text-white text-sm shadow-md shadow-indigo-600/20">
                      {getAvatarInitials(activeBlog.author)}
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-zinc-100">{activeBlog.author}</span>
                      <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-2 mt-0.5">
                        <Calendar size={11} className="text-zinc-500" />
                        {formatDate(activeBlog.createdAt)}
                        <span>•</span>
                        <Clock size={11} className="text-indigo-400" />
                        {getReadTime(activeBlog.content)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl font-semibold">
                      <Eye size={13} className="text-indigo-400" /> {activeBlog.reads} reads
                    </span>
                    <span className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl font-semibold">
                      <Heart size={13} className="text-rose-500" /> {activeBlog.likes} likes
                    </span>
                  </div>
                </div>

              </div>

              {/* Key Takeaways Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/30 via-zinc-900/40 to-zinc-900/30 border border-indigo-500/20 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                  <Sparkles size={14} /> Quick Summary / Key Highlights
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                  {stripMarkdown(activeBlog.content).slice(0, 220)}...
                </p>
              </div>

              {/* Article Main Body */}
              <article className="prose prose-invert max-w-none text-zinc-200 text-base leading-relaxed space-y-6">
                <MarkdownRenderer content={activeBlog.content} />
              </article>

              {/* Bottom Reaction Toolbar */}
              <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div>
                  <h4 className="text-sm font-bold text-zinc-100">Did you find this article insightful?</h4>
                  <p className="text-xs text-zinc-400 mt-0.5 font-medium">Give it a like to show support for the author.</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => handleLikeBlog(e, activeBlog._id)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
                  >
                    <Heart size={15} className="fill-white" />
                    <span>Like ({activeBlog.likes})</span>
                  </button>

                  <button
                    onClick={handleShareArticle}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-all cursor-pointer border border-zinc-700"
                  >
                    <Share2 size={15} />
                    <span>{copiedShare ? 'Copied Link!' : 'Share'}</span>
                  </button>
                </div>
              </div>

              {/* Comments / Discussion Section */}
              <div className="pt-8 border-t border-zinc-850 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={18} className="text-indigo-400" />
                    <h3 className="text-lg font-black text-zinc-100">
                      Community Discussion ({activeBlog.comments?.length || 0})
                    </h3>
                  </div>
                </div>

                {/* Comment Form */}
                <form
                  onSubmit={handlePostComment}
                  className="glass-card p-5 rounded-2xl border border-zinc-800 bg-zinc-950/40 space-y-4 shadow-xl"
                >
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                        className="w-full text-xs font-semibold rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 p-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block mb-1">
                      Add to the conversation
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Share your thoughts, feedback or questions..."
                      className="w-full text-xs font-medium rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 p-3.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                    >
                      <Send size={13} />
                      <span>Post Comment</span>
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-3">
                  {!activeBlog.comments || activeBlog.comments.length === 0 ? (
                    <div className="text-center py-8 p-4 rounded-2xl bg-zinc-900/20 border border-zinc-850">
                      <p className="text-xs text-zinc-500 font-medium italic">
                        No comments yet. Be the first to start the discussion!
                      </p>
                    </div>
                  ) : (
                    activeBlog.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-4 rounded-2xl border border-zinc-850 bg-zinc-900/20 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center font-bold text-[10px] text-indigo-300">
                              {getAvatarInitials(comment.author)}
                            </div>
                            <span className="font-bold text-zinc-200">{comment.author}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-medium">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed font-medium pl-8">
                          {comment.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recommended Next Articles */}
              <div className="pt-8 border-t border-zinc-850 space-y-4">
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <BookOpen size={16} className="text-indigo-400" /> More Recommended Reads
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {blogs
                    .filter((b) => b._id !== activeBlog._id)
                    .slice(0, 2)
                    .map((rec) => (
                      <div
                        key={rec._id}
                        onClick={() => handleOpenBlog(rec._id)}
                        className="p-4 rounded-2xl border border-zinc-850 bg-zinc-900/30 hover:border-indigo-500/30 transition-all cursor-pointer space-y-2 group"
                      >
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">
                          {rec.tags[0] || 'Article'}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-100 group-hover:text-indigo-300 line-clamp-1">
                          {rec.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 line-clamp-2">
                          {stripMarkdown(rec.content)}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

            </div>
          ) : null}

        </div>
      </div>
    )
  }

  /* ========================================================================= */
  /* BLOG LISTING DASHBOARD VIEW                                               */
  /* ========================================================================= */
  return (
    <div className="p-6 text-zinc-100 min-h-screen max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Hero Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-zinc-900 via-purple-950/30 to-zinc-900 border border-zinc-800/80 shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center gap-1.5 w-fit">
              <Sparkles size={12} /> Community Knowledge &amp; Insights
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-100">
              CareerOS Tech Chronicles
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
              Guides, technical roadmaps, interview prep strategies, and success stories written by top engineers.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-850">
            <div className="text-center px-3">
              <span className="block text-2xl font-black text-indigo-400">{blogs.length}</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Articles</span>
            </div>
            <div className="text-center px-3 border-l border-zinc-850">
              <span className="block text-2xl font-black text-emerald-400">
                {blogs.reduce((acc, b) => acc + (b.reads || 0), 0)}
              </span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Reads</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Spotlight Card */}
      {featuredBlog && !searchQuery && !selectedTag && (
        <div
          onClick={() => handleOpenBlog(featuredBlog._id)}
          className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-950/50 via-zinc-900/90 to-purple-950/30 border border-indigo-500/30 hover:border-indigo-500/60 transition-all duration-300 shadow-2xl cursor-pointer group space-y-4 overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-1.5">
                <TrendingUp size={12} /> Featured Article
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                {getReadTime(featuredBlog.content)}
              </span>
            </div>

            <button
              onClick={(e) => toggleBookmarkBlog(featuredBlog._id, e)}
              className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg transition-colors"
            >
              <Bookmark
                size={16}
                className={bookmarkedBlogIds.includes(featuredBlog._id) ? 'fill-rose-400 text-rose-400' : ''}
              />
            </button>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-100 group-hover:text-indigo-300 transition-colors leading-tight">
              {featuredBlog.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-3 max-w-4xl font-medium">
              {stripMarkdown(featuredBlog.content)}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-zinc-850/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center font-bold text-xs text-indigo-300">
                {getAvatarInitials(featuredBlog.author)}
              </div>
              <span className="text-xs font-bold text-zinc-200">{featuredBlog.author}</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-zinc-400 font-semibold">
              <span className="flex items-center gap-1">
                <Eye size={13} /> {featuredBlog.reads} reads
              </span>
              <span className="flex items-center gap-1">
                <Heart size={13} className="text-rose-500" /> {featuredBlog.likes}
              </span>
              <span className="flex items-center gap-1 text-indigo-400 font-bold group-hover:translate-x-1 transition-transform">
                Read Article →
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Search & Tag Filter Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by topic, keyword, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold rounded-2xl bg-zinc-900/50 border border-zinc-800 text-zinc-100 pl-11 pr-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs font-bold"
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
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer border ${
                  selectedTag === null
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                    : 'bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                All Topics
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer border ${
                    tag === selectedTag
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                      : 'bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:text-zinc-200'
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-6 border border-zinc-800 bg-zinc-900/20 space-y-4 animate-pulse h-72"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-3">
          <p className="text-xs font-semibold text-rose-400">{error}</p>
          <button
            onClick={fetchBlogs}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-zinc-800 hover:border-zinc-700 text-zinc-300"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-zinc-850 bg-zinc-900/10 space-y-3">
          <BookOpen size={32} className="mx-auto text-zinc-600" />
          <h3 className="text-base font-bold text-zinc-300">No blog posts match your search</h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Try adjusting your search terms or clearing the topic filter.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => {
            const isBookmarked = bookmarkedBlogIds.includes(blog._id)

            return (
              <div
                key={blog._id}
                onClick={() => handleOpenBlog(blog._id)}
                className="glass-card rounded-3xl p-5 sm:p-6 border border-zinc-850 bg-zinc-900/20 hover:bg-zinc-900/50 hover:border-indigo-500/30 cursor-pointer flex flex-col justify-between h-80 transition-all duration-200 group relative"
              >
                <div className="space-y-3">
                  
                  {/* Top Meta: Tags & Bookmarks */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {blog.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 font-semibold">
                        {getReadTime(blog.content)}
                      </span>
                      <button
                        onClick={(e) => toggleBookmarkBlog(blog._id, e)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isBookmarked ? 'text-rose-400' : 'text-zinc-600 hover:text-zinc-300'
                        }`}
                      >
                        <Bookmark size={14} className={isBookmarked ? 'fill-rose-400' : ''} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                    {blog.title}
                  </h3>

                  {/* Preview Content */}
                  <p className="text-xs text-zinc-400 font-medium line-clamp-4 leading-relaxed">
                    {stripMarkdown(blog.content)}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between border-t border-zinc-850/80 pt-3.5 mt-4 text-xs text-zinc-500">
                  <div className="flex items-center gap-2 truncate max-w-[140px]">
                    <div className="w-5 h-5 rounded-full bg-indigo-600/30 flex items-center justify-center text-[9px] font-bold text-indigo-300 flex-shrink-0">
                      {getAvatarInitials(blog.author)}
                    </div>
                    <span className="font-semibold text-zinc-300 truncate">{blog.author}</span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 font-medium text-[11px]">
                    <span className="flex items-center gap-1 hover:text-zinc-300">
                      <Eye size={12} /> {blog.reads}
                    </span>
                    <button
                      onClick={(e) => handleLikeBlog(e, blog._id)}
                      className="flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Heart size={12} className="hover:scale-110" /> {blog.likes}
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
