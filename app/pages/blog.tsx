'use client'
import React, { useState, useEffect } from 'react'
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
  Sparkles
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

const Blog = () => {
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
      setError('Error loading blog posts. Please ensure MongoDB is connected.')
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
  }, [])

  // Handle opening a blog details view
  const handleOpenBlog = async (id: string) => {
    try {
      setActiveBlogId(id)
      setLoadingActive(true)
      
      // Increment reads and fetch blog details
      const res = await fetch(`/api/blogs/${id}`)
      if (!res.ok) throw new Error('Failed to retrieve blog details')
      const blogData = await res.json()
      
      setActiveBlog(blogData)
      
      // Update read count in local list immediately
      setBlogs(prev => 
        prev.map(b => b._id === id ? { ...b, reads: b.reads + 1 } : b)
      )
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
    e.stopPropagation() // Don't trigger card click
    try {
      const res = await fetch(`/api/blogs/${id}/like`, {
        method: 'POST'
      })
      if (!res.ok) throw new Error('Failed to like post')
      const data = await res.json()
      
      // Update locally
      if (activeBlog && activeBlog._id === id) {
        setActiveBlog(prev => prev ? { ...prev, likes: data.likes } : null)
      }
      setBlogs(prev => 
        prev.map(b => b._id === id ? { ...b, likes: data.likes } : b)
      )
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

      // Update active blog comments
      setActiveBlog(prev => prev ? { ...prev, comments: data.comments } : null)
      
      // Update local list comment counts
      setBlogs(prev => 
        prev.map(b => b._id === activeBlog._id ? { ...b, comments: data.comments } : b)
      )
      
      setNewCommentText('')
    } catch (err) {
      console.error(err)
      alert('Failed to submit comment.')
    }
  }

  // Dynamic tags list
  const allTags = Array.from(new Set(blogs.flatMap(blog => blog.tags || [])))

  // Filter logic
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchQuery.toLowerCase())
      
    const matchesTag = !selectedTag || blog.tags.includes(selectedTag)
    
    return matchesSearch && matchesTag
  })

  // Format YYYY-MM-DD/ISO to readable date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (activeBlogId) {
    return (
      <div className="p-6 text-zinc-100 min-h-screen max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
          <button 
            onClick={() => {
              setActiveBlogId(null)
              setActiveBlog(null)
            }}
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60 px-4 py-2.5 rounded-xl border border-zinc-800 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Articles
          </button>
          
          {activeBlog && (
            <button
              onClick={(e) => handleLikeBlog(e, activeBlog._id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-500/10 border border-rose-500/20 text-rose-450 hover:bg-rose-500/20 transition-all cursor-pointer"
            >
              <Heart size={14} className="fill-rose-500/30 text-rose-500" />
              <span>Like ({activeBlog.likes})</span>
            </button>
          )}
        </div>

        {/* Content Area */}
        {loadingActive ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-500/25 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">Loading Article...</p>
          </div>
        ) : activeBlog ? (
          <div className="space-y-6 max-w-3xl mx-auto">
            
            {/* Meta details */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {activeBlog.tags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-zinc-100 tracking-tight leading-tight">
                {activeBlog.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 py-3 border-y border-zinc-900 gap-4">
                <div className="flex items-center gap-5">
                  <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                    <User size={13} className="text-indigo-400" /> {activeBlog.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-zinc-500" /> {formatDate(activeBlog.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 bg-zinc-900/30 border border-zinc-800 px-2.5 py-1 rounded-lg">
                    <Eye size={13} className="text-zinc-500" /> {activeBlog.reads} reads
                  </span>
                  <span className="flex items-center gap-1.5 bg-zinc-900/30 border border-zinc-800 px-2.5 py-1 rounded-lg">
                    <Heart size={13} className="text-rose-500" /> {activeBlog.likes} likes
                  </span>
                </div>
              </div>
            </div>

            {/* Article body */}
            <article className="text-base text-zinc-300 leading-relaxed whitespace-pre-wrap font-medium py-4">
              {activeBlog.content}
            </article>

            {/* Comments Section */}
            <div className="pt-8 border-t border-zinc-900 space-y-6">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-indigo-400" />
                <h3 className="text-sm font-bold text-zinc-200">
                  Discussions ({activeBlog.comments.length})
                </h3>
              </div>

              {/* Add comment Form */}
              <form onSubmit={handlePostComment} className="glass-card p-4 rounded-2xl border border-zinc-800 bg-zinc-950/20 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      className="w-full text-xs font-semibold rounded-xl bg-zinc-950 border border-zinc-850 text-zinc-200 p-2.5 focus:border-indigo-500 focus:ring-0"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block mb-1">Write Comment</label>
                  <textarea
                    required
                    rows={3}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Share your thoughts on this article..."
                    className="w-full text-xs font-semibold rounded-xl bg-zinc-950 border border-zinc-850 text-zinc-200 p-3 focus:border-indigo-500 focus:ring-0 resize-none text-zinc-200"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                  >
                    <Send size={12} /> Post Comment
                  </button>
                </div>
              </form>

              {/* Comments list */}
              <div className="space-y-3">
                {activeBlog.comments.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic py-4 text-center">No comments yet. Be the first to start a conversation!</p>
                ) : (
                  activeBlog.comments.map((comment) => (
                    <div key={comment.id} className="p-3.5 rounded-xl border border-zinc-850 bg-zinc-950/20 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-indigo-400">{comment.author}</span>
                        <span className="text-[10px] text-zinc-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-medium">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>

            </div>

          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="p-6 text-zinc-100 min-h-screen max-w-6xl mx-auto space-y-6 animate-fade-in">
      
      {/* Main Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-900">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Insights & Articles
          </span>
          <h1 className="text-3xl font-black tracking-tight mt-0.5">CareerOS Blog</h1>
          <p className="text-xs text-zinc-400 mt-1">Read guides, success stories, and domain knowledge shared by our community.</p>
        </div>
      </div>

      {/* Search & Tag Filter controls */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by title, keywords or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold rounded-xl bg-zinc-900/30 border border-zinc-800 text-zinc-200 pl-11 pr-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all outline-none"
          />
        </div>

        {/* Dynamic Tags pill list */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 max-w-full md:max-w-lg">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer border ${
                selectedTag === null
                  ? 'bg-zinc-800 border-zinc-700 text-indigo-400 shadow-inner'
                  : 'text-zinc-500 border-transparent hover:text-zinc-350'
              }`}
            >
              All Topics
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer border ${
                  tag === selectedTag
                    ? 'bg-zinc-800 border-zinc-700 text-indigo-400 shadow-inner'
                    : 'text-zinc-500 border-transparent hover:text-zinc-350'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Blog Cards Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6 border border-zinc-800/80 bg-zinc-900/10 space-y-4 animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
              <div className="space-y-2">
                <div className="h-6 bg-zinc-800 rounded"></div>
                <div className="h-4 bg-zinc-800 rounded w-5/6"></div>
              </div>
              <div className="h-16 bg-zinc-850 rounded"></div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
                <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 glass-card rounded-2xl border border-zinc-800/80 bg-zinc-900/10">
          <p className="text-sm font-semibold text-rose-400">{error}</p>
          <button 
            onClick={fetchBlogs}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl border border-zinc-800 bg-zinc-900/10 space-y-3">
          <p className="text-sm font-semibold text-zinc-400">No blog posts found matching your search.</p>
          <p className="text-[10px] text-zinc-550 max-w-xs mx-auto">Create a new blog post in Settings to populate the dashboard chronicles.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredBlogs.map((blog) => (
            <div
              key={blog._id}
              onClick={() => handleOpenBlog(blog._id)}
              className="glass-card rounded-2xl p-5 border border-zinc-850 bg-zinc-900/5 hover:bg-zinc-900/20 hover:border-indigo-500/30 cursor-pointer flex flex-col justify-between h-72 transition-all group"
            >
              <div className="space-y-3">
                {/* Meta details */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {blog.tags.slice(0, 2).map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase bg-indigo-500/10 border border-indigo-500/10 text-indigo-400"
                      >
                        {tag}
                      </span>
                    ))}
                    {blog.tags.length > 2 && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold text-zinc-500 uppercase bg-zinc-800">
                        +{blog.tags.length - 2}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-zinc-500 font-bold">{formatDate(blog.createdAt)}</span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-zinc-200 group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                  {blog.title}
                </h3>

                {/* Preview text */}
                <p className="text-xs text-zinc-400 font-medium line-clamp-4 leading-relaxed">
                  {blog.content}
                </p>
              </div>

              {/* Stats Footer bar */}
              <div className="flex items-center justify-between border-t border-zinc-850/80 pt-3.5 mt-4 text-[10px] text-zinc-500">
                <span className="font-semibold text-zinc-400 flex items-center gap-1.5 truncate max-w-[120px]">
                  <User size={11} className="text-zinc-500 group-hover:text-indigo-400" /> {blog.author}
                </span>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="flex items-center gap-1 hover:text-zinc-350">
                    <Eye size={11} /> {blog.reads}
                  </span>
                  <button 
                    onClick={(e) => handleLikeBlog(e, blog._id)}
                    className="flex items-center gap-1 hover:text-rose-455 transition-colors cursor-pointer"
                  >
                    <Heart size={11} className="hover:scale-110" /> {blog.likes}
                  </button>
                  <span className="flex items-center gap-1 hover:text-zinc-350">
                    <MessageSquare size={11} /> {blog.comments?.length || 0}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  )
}

export default Blog
