'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Search,
  Building2,
  ExternalLink,
  Bookmark,
  Globe,
  Filter,
  CheckCircle2,
  Briefcase,
  Grid,
  List,
  ChevronRight,
  Copy,
  Check,
  Building,
  Target,
  MessageSquare,
  BookmarkCheck,
  X
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

  // Get Initials for logo placeholder
  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 text-zinc-100 animate-fade-in">
        <div className="h-28 bg-zinc-900 rounded-2xl animate-pulse border border-zinc-800" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-zinc-900 rounded-2xl animate-pulse border border-zinc-800" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4 text-zinc-100">
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold">
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-all cursor-pointer"
        >
          Reload Page
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 text-zinc-100 min-h-screen max-w-7xl mx-auto space-y-6 animate-fade-in">
      
      {/* Top Corporate Hero Header */}
      <div className="rounded-2xl p-6 sm:p-8 bg-zinc-900 border border-zinc-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center gap-1.5">
                <Building2 size={12} /> Corporate Directory
              </span>
              {data?.last_verified && (
                <span className="text-[10px] font-semibold text-zinc-500">
                  Verified {data.last_verified}
                </span>
              )}
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
              Enterprise Careers &amp; Hiring Portals
            </h1>
            
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
              Direct access to official hiring portals for 51 top companies across IT Services, Global MNCs, Financial Institutions, and Tech Startups.
            </p>
          </div>

          {/* Clean Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <div className="text-center px-3 py-1">
              <span className="block text-lg font-bold text-zinc-100">{stats.total}</span>
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Portals</span>
            </div>
            <div className="text-center px-3 py-1 border-l border-zinc-850">
              <span className="block text-lg font-bold text-zinc-200">{stats.saved}</span>
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Saved</span>
            </div>
            <div className="text-center px-3 py-1 border-l border-zinc-850">
              <span className="block text-lg font-bold text-zinc-200">{stats.target}</span>
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Targets</span>
            </div>
            <div className="text-center px-3 py-1 border-l border-zinc-850">
              <span className="block text-lg font-bold text-zinc-200">{stats.applied}</span>
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Applied</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by company name, sector, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 pl-10 pr-4 py-2.5 focus:border-zinc-500 transition-all outline-none"
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

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusType)}
              className="text-xs font-medium rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 focus:border-zinc-600 outline-none cursor-pointer"
            >
              <option value="all">All Tracking Statuses</option>
              <option value="saved">Saved / Bookmarked</option>
              <option value="target">Target Companies</option>
              <option value="applied">Applied</option>
              <option value="interviewing">Interviewing</option>
            </select>

            {/* Sector Selector */}
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="text-xs font-medium rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 focus:border-zinc-600 outline-none cursor-pointer"
            >
              <option value="all">All Sectors ({sectors.length})</option>
              {sectors.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-zinc-900 border border-zinc-800 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Grid View"
              >
                <Grid size={14} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Table View"
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
              selectedCategory === 'all'
                ? 'bg-zinc-100 text-zinc-950 border-white'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-950 border-white'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {cat} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content View */}
      {filteredCompanies.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3">
          <Building2 size={32} className="mx-auto text-zinc-600" />
          <h3 className="text-sm font-semibold text-zinc-300">No companies found matching filters</h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Try adjusting your search query, sector dropdown, or category selection.
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
              setSelectedSector('all')
              setStatusFilter('all')
            }}
            className="mt-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => {
            const isBookmarked = savedIds.includes(company.id)
            const currentStatus = jobStatuses[company.id] || ''

            return (
              <div
                key={company.id}
                onClick={() => setActiveCompany(company)}
                className="rounded-2xl p-5 border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group relative"
              >
                <div className="space-y-3">
                  {/* Top Row: Initials & Bookmark */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-200 text-xs">
                        {getInitials(company.name)}
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-zinc-800 border border-zinc-700 text-zinc-300">
                        {company.category}
                      </span>
                    </div>

                    <button
                      onClick={(e) => toggleBookmark(company.id, e)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isBookmarked
                          ? 'bg-zinc-100 text-zinc-950 border-white'
                          : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                      }`}
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Company'}
                    >
                      <Bookmark size={14} className={isBookmarked ? 'fill-zinc-950' : ''} />
                    </button>
                  </div>

                  {/* Company Name & Sector */}
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors line-clamp-1">
                      {company.name}
                    </h3>
                    <p className="text-xs text-zinc-400 font-normal flex items-center gap-1.5 mt-1">
                      <Briefcase size={12} className="text-zinc-500 flex-shrink-0" />
                      <span className="truncate">{company.sector}</span>
                    </p>
                  </div>
                </div>

                {/* Status Selector & Careers Portal Link */}
                <div className="pt-3 border-t border-zinc-850 flex items-center justify-between gap-2">
                  <select
                    value={currentStatus}
                    onChange={(e) => updateStatus(company.id, e.target.value, e)}
                    className="text-[11px] font-medium rounded-lg px-2 py-1 bg-zinc-950 border border-zinc-800 text-zinc-300 outline-none cursor-pointer"
                  >
                    <option value="">Status</option>
                    <option value="target">Target</option>
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                  </select>

                  <a
                    href={company.careers_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 transition-colors cursor-pointer"
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
        <div className="overflow-x-auto border border-zinc-800 rounded-2xl bg-zinc-900">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px] bg-zinc-950">
                <th className="p-3 pl-4 w-12">#</th>
                <th className="p-3">Company</th>
                <th className="p-3">Category</th>
                <th className="p-3">Sector</th>
                <th className="p-3">Tracker</th>
                <th className="p-3 text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 font-normal">
              {filteredCompanies.map((company, idx) => {
                const isBookmarked = savedIds.includes(company.id)
                const currentStatus = jobStatuses[company.id] || ''

                return (
                  <tr
                    key={company.id}
                    onClick={() => setActiveCompany(company)}
                    className="hover:bg-zinc-850/60 text-zinc-200 transition-colors cursor-pointer"
                  >
                    <td className="p-3 pl-4 text-zinc-500 font-mono text-[11px]">{idx + 1}</td>
                    <td className="p-3 font-semibold text-zinc-100 flex items-center gap-2.5">
                      <button
                        onClick={(e) => toggleBookmark(company.id, e)}
                        className={`text-zinc-600 hover:text-zinc-200 transition-colors ${
                          isBookmarked ? 'text-zinc-100' : ''
                        }`}
                      >
                        <Bookmark size={13} className={isBookmarked ? 'fill-zinc-100' : ''} />
                      </button>
                      <span>{company.name}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-zinc-800 border border-zinc-700 text-zinc-300">
                        {company.category}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-400">{company.sector}</td>
                    <td className="p-3">
                      <select
                        value={currentStatus}
                        onChange={(e) => updateStatus(company.id, e.target.value, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] font-medium rounded-md px-2 py-1 bg-zinc-950 border border-zinc-800 text-zinc-300 outline-none"
                      >
                        <option value="">None</option>
                        <option value="target">Target</option>
                        <option value="applied">Applied</option>
                        <option value="interviewing">Interviewing</option>
                      </select>
                    </td>
                    <td className="p-3 text-right pr-4">
                      <a
                        href={company.careers_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 transition-all"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="rounded-2xl p-6 sm:p-7 border border-zinc-800 bg-zinc-950 max-w-lg w-full space-y-5 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-zinc-850 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-zinc-100 text-sm">
                  {getInitials(activeCompany.name)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-100">{activeCompany.name}</h2>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {activeCompany.category}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveCompany(null)}
                className="text-zinc-500 hover:text-zinc-200 text-sm p-1 rounded-md hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Info */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-850">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Industry Sector</span>
                  <span className="font-medium text-zinc-200 mt-0.5 block">{activeCompany.sector}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Company ID</span>
                  <span className="font-medium text-zinc-200 mt-0.5 block">#{activeCompany.id}</span>
                </div>
              </div>

              {/* Direct Careers Link */}
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-semibold block mb-1">Careers Portal URL</span>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[11px] truncate">
                  <Globe size={13} className="text-zinc-400 flex-shrink-0" />
                  <span className="truncate flex-1">{activeCompany.careers_url}</span>
                  <button
                    onClick={(e) => handleCopyLink(activeCompany, e)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors flex-shrink-0 cursor-pointer"
                    title="Copy URL"
                  >
                    {copiedId === activeCompany.id ? <Check size={13} className="text-zinc-100" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-850">
              <button
                onClick={() => toggleBookmark(activeCompany.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  savedIds.includes(activeCompany.id)
                    ? 'bg-zinc-100 text-zinc-950 border-white'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-850'
                }`}
              >
                <Bookmark size={14} className={savedIds.includes(activeCompany.id) ? 'fill-zinc-950' : ''} />
                <span>{savedIds.includes(activeCompany.id) ? 'Saved' : 'Save Company'}</span>
              </button>

              <a
                href={activeCompany.careers_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 transition-colors cursor-pointer"
              >
                <span>Launch Careers Site</span>
                <ExternalLink size={13} />
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
