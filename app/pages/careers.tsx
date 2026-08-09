'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Search,
  Building2,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Globe,
  Filter,
  CheckCircle2,
  Briefcase,
  Layers,
  Sparkles,
  Grid,
  List,
  ChevronRight,
  Info,
  Copy,
  Check,
  TrendingUp,
  Share2
} from 'lucide-react'

interface Company {
  id: number
  name: string
  category: string
  sector: string
  careers_url: string
}

interface CareersData {
  title: string
  last_verified: string
  note: string
  companies: Company[]
}

type StatusType = 'all' | 'saved' | 'target' | 'applied' | 'interviewing'

export default function Careers() {
  const [data, setData] = useState<CareersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSector, setSelectedSector] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<StatusType>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // User Interactive States (localStorage backed)
  const [savedIds, setSavedIds] = useState<number[]>([])
  const [jobStatuses, setJobStatuses] = useState<Record<number, string>>({})
  
  // Modal detail drawer state
  const [activeCompany, setActiveCompany] = useState<Company | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  // Fetch careers.json via API or fallback to static public file
  useEffect(() => {
    async function loadCareers() {
      try {
        setLoading(true)
        const res = await fetch('/api/careers')
        if (!res.ok) throw new Error('API failed, trying fallback static file')
        const jsonData = await res.json()
        setData(jsonData)
      } catch (err) {
        console.warn('API error, fetching public JSON fallback...', err)
        try {
          const resFallback = await fetch('/careers.json')
          if (!resFallback.ok) throw new Error('Failed to load careers data')
          const jsonData = await resFallback.json()
          setData(jsonData)
        } catch (e: any) {
          setError('Failed to load companies careers list.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadCareers()

    // Read saved bookmarks and statuses from localStorage
    try {
      const storedBookmarks = localStorage.getItem('careeros_saved_jobs')
      if (storedBookmarks) setSavedIds(JSON.parse(storedBookmarks))

      const storedStatuses = localStorage.getItem('careeros_job_statuses')
      if (storedStatuses) setJobStatuses(JSON.parse(storedStatuses))
    } catch (e) {
      console.error('Failed to parse saved job data from localStorage', e)
    }
  }, [])

  // Save to localStorage when state changes
  const toggleBookmark = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      localStorage.setItem('careeros_saved_jobs', JSON.stringify(next))
      return next
    })
  }

  const updateStatus = (id: number, status: string, e?: React.ChangeEvent<HTMLSelectElement>) => {
    if (e) e.stopPropagation()
    setJobStatuses((prev) => {
      const next = { ...prev, [id]: status }
      if (!status) delete next[id]
      localStorage.setItem('careeros_job_statuses', JSON.stringify(next))
      return next
    })
  }

  const handleCopyLink = (company: Company, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(company.careers_url)
    setCopiedId(company.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Extract unique categories and sectors
  const categories = useMemo(() => {
    if (!data) return []
    return Array.from(new Set(data.companies.map((c) => c.category)))
  }, [data])

  const sectors = useMemo(() => {
    if (!data) return []
    return Array.from(new Set(data.companies.map((c) => c.sector)))
  }, [data])

  // Filtering logic
  const filteredCompanies = useMemo(() => {
    if (!data) return []
    return data.companies.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.sector.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory
      const matchesSector = selectedSector === 'all' || c.sector === selectedSector

      let matchesStatus = true
      if (statusFilter === 'saved') {
        matchesStatus = savedIds.includes(c.id)
      } else if (statusFilter !== 'all') {
        matchesStatus = jobStatuses[c.id] === statusFilter
      }

      return matchesSearch && matchesCategory && matchesSector && matchesStatus
    })
  }, [data, searchQuery, selectedCategory, selectedSector, statusFilter, savedIds, jobStatuses])

  // Count stats
  const stats = useMemo(() => {
    if (!data) return { total: 0, saved: 0, applied: 0, target: 0 }
    const saved = savedIds.length
    const applied = Object.values(jobStatuses).filter((s) => s === 'applied').length
    const target = Object.values(jobStatuses).filter((s) => s === 'target').length
    return { total: data.companies.length, saved, applied, target }
  }, [data, savedIds, jobStatuses])

  // Category Color Map
  const getCategoryColor = (cat: string) => {
    if (cat.includes('IT Services')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    if (cat.includes('Global MNC')) return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    if (cat.includes('Startup') || cat.includes('Unicorn')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    if (cat.includes('Conglomerate')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    if (cat.includes('Bank')) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    return 'bg-zinc-800 text-zinc-300 border-zinc-700'
  }

  // Get Avatar Initials
  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 text-zinc-100 animate-fade-in">
        <div className="h-28 bg-zinc-900/40 rounded-3xl animate-pulse border border-zinc-800/80" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 bg-zinc-900/30 rounded-2xl animate-pulse border border-zinc-850" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4 text-zinc-100">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold">
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold transition-all"
        >
          Reload Page
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 text-zinc-100 min-h-screen max-w-7xl mx-auto space-y-7 animate-fade-in">
      
      {/* Top Hero Section */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-zinc-900/90 via-indigo-950/40 to-zinc-900/90 border border-zinc-800/80 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center gap-1.5">
                <Sparkles size={12} /> Live Careers Directory 2026
              </span>
              {data?.last_verified && (
                <span className="text-[10px] font-semibold text-zinc-500">
                  Verified {data.last_verified}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-100">
              Top Enterprise &amp; Tech Careers Portals
            </h1>
            
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
              Direct access to official hiring portals of 51+ top companies in India — Indian IT Services, Global MNCs, Financial Giants &amp; Unicorn Startups.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950/50 p-3.5 rounded-2xl border border-zinc-850/80 backdrop-blur-md">
            <div className="text-center px-3 py-1.5">
              <span className="block text-xl font-black text-indigo-400">{stats.total}</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Portals</span>
            </div>
            <div className="text-center px-3 py-1.5 border-l border-zinc-850">
              <span className="block text-xl font-black text-rose-400">{stats.saved}</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Saved</span>
            </div>
            <div className="text-center px-3 py-1.5 border-l border-zinc-850">
              <span className="block text-xl font-black text-emerald-400">{stats.target}</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Targets</span>
            </div>
            <div className="text-center px-3 py-1.5 border-l border-zinc-850">
              <span className="block text-xl font-black text-cyan-400">{stats.applied}</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Applied</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search companies, sectors, or categories..."
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

          {/* Sector & Status Filter Selects */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusType)}
              className="text-xs font-semibold rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-200 px-3 py-2.5 focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="all">All Items</option>
              <option value="saved">⭐ Saved / Bookmarked</option>
              <option value="target">🎯 Target Companies</option>
              <option value="applied">✅ Applied</option>
              <option value="interviewing">💬 Interviewing</option>
            </select>

            {/* Sector Selector */}
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="text-xs font-semibold rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-200 px-3 py-2.5 focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="all">All Sectors ({sectors.length})</option>
              {sectors.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-zinc-900/60 border border-zinc-800 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-zinc-800 text-indigo-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Grid view"
              >
                <Grid size={15} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-zinc-800 text-indigo-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Table view"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                : 'bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
            }`}
          >
            All Categories ({data?.companies.length || 0})
          </button>
          {categories.map((cat) => {
            const count = data?.companies.filter((c) => c.category === cat).length || 0
            const isActive = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isActive ? 'all' : cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                    : 'bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {cat} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Companies Content View */}
      {filteredCompanies.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-zinc-850 bg-zinc-900/10 space-y-3">
          <Building2 size={32} className="mx-auto text-zinc-600" />
          <h3 className="text-base font-bold text-zinc-300">No companies found matching your filters</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Try adjusting your search terms, sector dropdown, or selected category pill.
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
              setSelectedSector('all')
              setStatusFilter('all')
            }}
            className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-850 hover:bg-zinc-800 text-indigo-400 border border-zinc-800 cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCompanies.map((company) => {
            const isBookmarked = savedIds.includes(company.id)
            const currentStatus = jobStatuses[company.id] || ''

            return (
              <div
                key={company.id}
                onClick={() => setActiveCompany(company)}
                className="glass-card rounded-2xl p-5 border border-zinc-850 bg-zinc-900/20 hover:bg-zinc-900/50 hover:border-indigo-500/30 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group relative"
              >
                <div className="space-y-3">
                  {/* Top Bar: Initials Badge & Actions */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-300 text-sm shadow-inner">
                        {getInitials(company.name)}
                      </div>
                      <div className="space-y-0.5">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${getCategoryColor(company.category)}`}>
                          {company.category}
                        </span>
                      </div>
                    </div>

                    {/* Bookmark Toggle */}
                    <button
                      onClick={(e) => toggleBookmark(company.id, e)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isBookmarked
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-zinc-950/40 text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:border-zinc-700'
                      }`}
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Company'}
                    >
                      <Bookmark size={15} className={isBookmarked ? 'fill-rose-500' : ''} />
                    </button>
                  </div>

                  {/* Company Name & Sector */}
                  <div>
                    <h3 className="text-base font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {company.name}
                    </h3>
                    <p className="text-xs text-zinc-400 font-medium flex items-center gap-1.5 mt-1">
                      <Briefcase size={12} className="text-zinc-500 flex-shrink-0" />
                      <span className="truncate">{company.sector}</span>
                    </p>
                  </div>
                </div>

                {/* Status Selector & Direct Action Link */}
                <div className="pt-3 border-t border-zinc-850/80 flex items-center justify-between gap-2">
                  <select
                    value={currentStatus}
                    onChange={(e) => updateStatus(company.id, e.target.value, e)}
                    className={`text-[11px] font-bold rounded-lg px-2.5 py-1.5 border outline-none cursor-pointer transition-all ${
                      currentStatus === 'applied'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : currentStatus === 'target'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : currentStatus === 'interviewing'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                        : 'bg-zinc-950/50 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                    }`}
                  >
                    <option value="">Set Status</option>
                    <option value="target">🎯 Target</option>
                    <option value="applied">✅ Applied</option>
                    <option value="interviewing">💬 Interviewing</option>
                  </select>

                  <a
                    href={company.careers_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                  >
                    <span>Careers</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-x-auto border border-zinc-850 rounded-2xl bg-zinc-900/20 shadow-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-850 text-zinc-400 font-bold uppercase tracking-wider text-[10px] bg-zinc-950/60">
                <th className="p-3.5 pl-4 w-12">#</th>
                <th className="p-3.5">Company</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Sector</th>
                <th className="p-3.5">Tracker</th>
                <th className="p-3.5 text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850/60 font-medium">
              {filteredCompanies.map((company, idx) => {
                const isBookmarked = savedIds.includes(company.id)
                const currentStatus = jobStatuses[company.id] || ''

                return (
                  <tr
                    key={company.id}
                    onClick={() => setActiveCompany(company)}
                    className="hover:bg-zinc-900/50 text-zinc-200 transition-colors cursor-pointer"
                  >
                    <td className="p-3.5 pl-4 text-zinc-500 font-bold">{idx + 1}</td>
                    <td className="p-3.5 font-bold text-zinc-100 flex items-center gap-2.5">
                      <button
                        onClick={(e) => toggleBookmark(company.id, e)}
                        className={`text-zinc-600 hover:text-rose-400 transition-colors ${
                          isBookmarked ? 'text-rose-400' : ''
                        }`}
                      >
                        <Bookmark size={13} className={isBookmarked ? 'fill-rose-400' : ''} />
                      </button>
                      <span>{company.name}</span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${getCategoryColor(company.category)}`}>
                        {company.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-zinc-400">{company.sector}</td>
                    <td className="p-3.5">
                      <select
                        value={currentStatus}
                        onChange={(e) => updateStatus(company.id, e.target.value, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] font-bold rounded-lg px-2 py-1 bg-zinc-950 border border-zinc-800 text-zinc-300 outline-none"
                      >
                        <option value="">None</option>
                        <option value="target">🎯 Target</option>
                        <option value="applied">✅ Applied</option>
                        <option value="interviewing">💬 Interviewing</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-right pr-4">
                      <a
                        href={company.careers_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all"
                      >
                        <span>Apply</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Company Detail Drawer / Modal */}
      {activeCompany && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-zinc-800 bg-zinc-950 max-w-lg w-full space-y-6 shadow-2xl relative">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-zinc-900 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-300 text-lg shadow-inner">
                  {getInitials(activeCompany.name)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-100">{activeCompany.name}</h2>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${getCategoryColor(activeCompany.category)}`}>
                    {activeCompany.category}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveCompany(null)}
                className="text-zinc-500 hover:text-zinc-200 text-lg font-bold p-1 rounded-lg hover:bg-zinc-900 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Info Grid */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-850">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Industry Sector</span>
                  <span className="font-semibold text-zinc-200 mt-0.5 block">{activeCompany.sector}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Company ID</span>
                  <span className="font-semibold text-zinc-200 mt-0.5 block">#{activeCompany.id}</span>
                </div>
              </div>

              {/* Direct Link box */}
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1.5">Official Careers URL</span>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[11px] truncate">
                  <Globe size={13} className="text-indigo-400 flex-shrink-0" />
                  <span className="truncate flex-1">{activeCompany.careers_url}</span>
                  <button
                    onClick={(e) => handleCopyLink(activeCompany, e)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors flex-shrink-0"
                    title="Copy URL"
                  >
                    {copiedId === activeCompany.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              {/* Application Guidance Tip */}
              <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                  <Sparkles size={13} /> Application Tip
                </div>
                <p className="text-zinc-400 leading-relaxed font-medium text-[11px]">
                  Before applying, ensure your resume highlights keywords matching {activeCompany.sector} requirements. Look for alumni referrals on LinkedIn for faster response times.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-zinc-900">
              <button
                onClick={() => toggleBookmark(activeCompany.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer text-xs border ${
                  savedIds.includes(activeCompany.id)
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-850'
                }`}
              >
                <Bookmark size={14} className={savedIds.includes(activeCompany.id) ? 'fill-rose-500' : ''} />
                <span>{savedIds.includes(activeCompany.id) ? 'Saved in Library' : 'Save Company'}</span>
              </button>

              <a
                href={activeCompany.careers_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 text-xs cursor-pointer"
              >
                <span>Launch Careers Portal</span>
                <ExternalLink size={14} />
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
