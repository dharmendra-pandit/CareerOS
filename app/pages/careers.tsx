'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Search,
  ExternalLink,
  Bookmark,
  X
} from 'lucide-react'

interface JobOpening {
  job_id: string
  title: string
  role_category: string
  experience: string
  location: string
  work_type: string
  salary_range: string
  batch_eligibility: string
  skills: string[]
  description: string
  apply_url: string
}

interface Company {
  id: number
  name: string
  category: string
  sector: string
  careers_url: string
  jobs?: JobOpening[]
}

interface CareersData {
  title: string
  last_verified: string
  note: string
  companies: Company[]
}

type TabType = 'companies' | 'jobs'
type StatusType = 'all' | 'saved' | 'target' | 'applied' | 'interviewing'

export default function Careers() {
  const [data, setData] = useState<CareersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // View & Tab state
  const [activeTab, setActiveTab] = useState<TabType>('companies')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExperience, setSelectedExperience] = useState<string>('all')
  const [selectedRoleCategory, setSelectedRoleCategory] = useState<string>('all')
  const [selectedBatch, setSelectedBatch] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSector, setSelectedSector] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<StatusType>('all')

  // Interactive Saved Jobs / Companies (localStorage)
  const [savedJobIds, setSavedJobIds] = useState<string[]>([])
  const [savedCompanyIds, setSavedCompanyIds] = useState<number[]>([])
  const [jobStatuses, setJobStatuses] = useState<Record<string, string>>({})

  // Modals
  const [activeJob, setActiveJob] = useState<{ company: Company; job: JobOpening } | null>(null)

  // Fetch careers data
  useEffect(() => {
    async function loadCareers() {
      try {
        setLoading(true)
        const res = await fetch('/api/careers')
        if (!res.ok) throw new Error('API failed')
        const jsonData = await res.json()
        setData(jsonData)
      } catch (err) {
        try {
          const resFallback = await fetch('/careers.json')
          if (!resFallback.ok) throw new Error('Failed to load static file')
          const jsonData = await resFallback.json()
          setData(jsonData)
        } catch (e: any) {
          setError('Failed to load careers directory data.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadCareers()

    // Read stored bookmarks & statuses
    try {
      const storedSavedJobs = localStorage.getItem('careeros_saved_job_ids')
      if (storedSavedJobs) setSavedJobIds(JSON.parse(storedSavedJobs))

      const storedSavedCompanies = localStorage.getItem('careeros_saved_companies')
      if (storedSavedCompanies) setSavedCompanyIds(JSON.parse(storedSavedCompanies))

      const storedStatuses = localStorage.getItem('careeros_job_statuses')
      if (storedStatuses) setJobStatuses(JSON.parse(storedStatuses))
    } catch (e) {
      console.error('Failed to load bookmarks from storage', e)
    }
  }, [])

  // Storage Handlers
  const toggleBookmarkJob = (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setSavedJobIds((prev) => {
      const next = prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
      localStorage.setItem('careeros_saved_job_ids', JSON.stringify(next))
      return next
    })
  }

  const toggleBookmarkCompany = (companyId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setSavedCompanyIds((prev) => {
      const next = prev.includes(companyId) ? prev.filter((id) => id !== companyId) : [...prev, companyId]
      localStorage.setItem('careeros_saved_companies', JSON.stringify(next))
      return next
    })
  }

  const updateStatus = (key: string | number, status: string, e?: React.ChangeEvent<HTMLSelectElement>) => {
    if (e) e.stopPropagation()
    const strKey = key.toString()
    setJobStatuses((prev) => {
      const next = { ...prev, [strKey]: status }
      if (!status) delete next[strKey]
      localStorage.setItem('careeros_job_statuses', JSON.stringify(next))
      return next
    })
  }

  const getStatusForCompany = (companyId: number) => {
    return jobStatuses[companyId.toString()] || jobStatuses[companyId] || ''
  }

  // Extract all unique categories and sectors
  const categories = useMemo(() => {
    if (!data?.companies) return []
    const set = new Set(data.companies.map((c) => c.category))
    return Array.from(set).sort()
  }, [data])

  const sectors = useMemo(() => {
    if (!data?.companies) return []
    const set = new Set(data.companies.map((c) => c.sector))
    return Array.from(set).sort()
  }, [data])

  const experienceLevels = useMemo(() => {
    if (!data?.companies) return []
    const set = new Set<string>()
    data.companies.forEach((c) => c.jobs?.forEach((j) => set.add(j.experience)))
    return Array.from(set).sort()
  }, [data])

  const roleCategories = useMemo(() => {
    if (!data?.companies) return []
    const set = new Set<string>()
    data.companies.forEach((c) => c.jobs?.forEach((j) => set.add(j.role_category)))
    return Array.from(set).sort()
  }, [data])

  const batches = useMemo(() => {
    if (!data?.companies) return []
    const set = new Set<string>()
    data.companies.forEach((c) => c.jobs?.forEach((j) => set.add(j.batch_eligibility)))
    return Array.from(set).sort()
  }, [data])

  // Flattened jobs list for Direct Jobs View
  const allJobsWithCompany = useMemo(() => {
    if (!data?.companies) return []
    const list: { company: Company; job: JobOpening }[] = []
    data.companies.forEach((company) => {
      company.jobs?.forEach((job) => {
        list.push({ company, job })
      })
    })
    return list
  }, [data])

  // Filtered Companies List
  const filteredCompanies = useMemo(() => {
    if (!data?.companies) return []
    return data.companies.filter((company) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !q ||
        company.name.toLowerCase().includes(q) ||
        company.category.toLowerCase().includes(q) ||
        company.sector.toLowerCase().includes(q)

      const matchesCat = selectedCategory === 'all' || company.category === selectedCategory
      const matchesSec = selectedSector === 'all' || company.sector === selectedSector

      const cStatus = getStatusForCompany(company.id)
      const isSavedComp = savedCompanyIds.includes(company.id)

      let matchesStatus = true
      if (statusFilter === 'saved') matchesStatus = isSavedComp
      else if (statusFilter === 'target') matchesStatus = cStatus === 'target'
      else if (statusFilter === 'applied') matchesStatus = cStatus === 'applied'
      else if (statusFilter === 'interviewing') matchesStatus = cStatus === 'interviewing'

      return matchesQuery && matchesCat && matchesSec && matchesStatus
    })
  }, [data, searchQuery, selectedCategory, selectedSector, statusFilter, savedCompanyIds, jobStatuses])

  // Filtered Jobs List
  const filteredJobs = useMemo(() => {
    return allJobsWithCompany.filter(({ company, job }) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !q ||
        job.title.toLowerCase().includes(q) ||
        company.name.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.skills.some((s) => s.toLowerCase().includes(q))

      const matchesExp = selectedExperience === 'all' || job.experience === selectedExperience
      const matchesCat = selectedRoleCategory === 'all' || job.role_category === selectedRoleCategory
      const matchesBatch = selectedBatch === 'all' || job.batch_eligibility === selectedBatch

      const isSaved = savedJobIds.includes(job.job_id)
      const cStatus = getStatusForCompany(company.id)

      let matchesStatus = true
      if (statusFilter === 'saved') matchesStatus = isSaved
      else if (statusFilter === 'target') matchesStatus = cStatus === 'target'
      else if (statusFilter === 'applied') matchesStatus = cStatus === 'applied'
      else if (statusFilter === 'interviewing') matchesStatus = cStatus === 'interviewing'

      return matchesQuery && matchesExp && matchesCat && matchesBatch && matchesStatus
    })
  }, [allJobsWithCompany, searchQuery, selectedExperience, selectedRoleCategory, selectedBatch, statusFilter, savedJobIds, jobStatuses])

  // Overview Counter Metrics
  const metrics = useMemo(() => {
    const totalComps = data?.companies?.length || 0
    const totalOpenings = allJobsWithCompany.length
    const savedComps = savedCompanyIds.length
    const savedJobsCount = savedJobIds.length

    let targetCount = 0
    let appliedCount = 0
    let interviewingCount = 0

    Object.values(jobStatuses).forEach((status) => {
      if (status === 'target') targetCount++
      if (status === 'applied') appliedCount++
      if (status === 'interviewing') interviewingCount++
    })

    return {
      totalComps,
      totalOpenings,
      savedComps,
      savedJobsCount,
      targetCount,
      appliedCount,
      interviewingCount
    }
  }, [data, allJobsWithCompany, savedCompanyIds, savedJobIds, jobStatuses])

  const getInitials = (name: string) => {
    if (!name) return 'CO'
    const parts = name.split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="p-6 text-zinc-100 min-h-screen max-w-7xl mx-auto space-y-6">
        <div className="glass-card rounded-3xl p-8 border border-zinc-800/80 bg-zinc-900/40 animate-pulse h-48" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6 border border-zinc-800/80 bg-zinc-900/40 animate-pulse h-40" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-zinc-100 min-h-screen max-w-7xl mx-auto flex items-center justify-center">
        <div className="glass-card rounded-3xl p-8 border border-zinc-800/80 bg-zinc-900/40 text-center space-y-3 max-w-md">
          <p className="text-xs font-semibold text-zinc-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 text-zinc-100 min-h-screen max-w-7xl mx-auto space-y-6 animate-fade-in relative">
      
      {/* Top Banner & Overview Metrics */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-zinc-800/80 bg-gradient-to-r from-indigo-950/40 via-zinc-900/60 to-zinc-900/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-1.5 max-w-xl">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 inline-block">
              Careers Portal Directory
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">
              Company Careers &amp; Application Status
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-normal">
              Direct access to official corporate hiring portals and application status tracking.
            </p>
          </div>

          {/* Clean Metric Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800/80 backdrop-blur-md">
            <div className="px-3 py-1.5 border-r border-zinc-850">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Portals</span>
              <span className="text-lg font-black text-zinc-100 mt-0.5 block">{metrics.totalComps}</span>
            </div>
            <div className="px-3 py-1.5 border-r border-zinc-850">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Target</span>
              <span className="text-lg font-black text-amber-400 mt-0.5 block">{metrics.targetCount}</span>
            </div>
            <div className="px-3 py-1.5 border-r border-zinc-850">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Applied</span>
              <span className="text-lg font-black text-indigo-400 mt-0.5 block">{metrics.appliedCount}</span>
            </div>
            <div className="px-3 py-1.5">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Interviewing</span>
              <span className="text-lg font-black text-emerald-400 mt-0.5 block">{metrics.interviewingCount}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Control Toolbar */}
      <div className="space-y-4">
        
        {/* Main Tab Switches & View Mode */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('companies')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'companies'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Company Portals ({filteredCompanies.length})
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'jobs'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Direct Openings ({filteredJobs.length})
            </button>
          </div>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800 self-end sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Table
            </button>
          </div>

        </div>

        {/* Filter Pills & Status Toolbar */}
        <div className="glass-card rounded-2xl p-4 border border-zinc-800/80 bg-zinc-900/40 space-y-3">
          
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder={activeTab === 'companies' ? "Search company name, category..." : "Search role title, company..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-medium rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 pl-10 pr-4 py-2.5 focus:border-indigo-500 outline-none transition-all"
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

            {/* Quick Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(['all', 'saved', 'target', 'applied', 'interviewing'] as StatusType[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold capitalize transition-all cursor-pointer border ${
                    statusFilter === status
                      ? 'bg-indigo-600 text-white border-indigo-500/30 shadow-md shadow-indigo-600/20'
                      : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Dropdown Select Filters */}
          {activeTab === 'companies' ? (
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-zinc-850">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs font-medium rounded-xl px-3 py-2 bg-zinc-950/80 border border-zinc-800 text-zinc-300 focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="text-xs font-medium rounded-xl px-3 py-2 bg-zinc-950/80 border border-zinc-800 text-zinc-300 focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="all">All Sectors</option>
                {sectors.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-zinc-850">
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="text-xs font-medium rounded-xl px-3 py-2 bg-zinc-950/80 border border-zinc-800 text-zinc-300 focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="all">All Experience Levels</option>
                {experienceLevels.map((exp) => (
                  <option key={exp} value={exp}>{exp}</option>
                ))}
              </select>

              <select
                value={selectedRoleCategory}
                onChange={(e) => setSelectedRoleCategory(e.target.value)}
                className="text-xs font-medium rounded-xl px-3 py-2 bg-zinc-950/80 border border-zinc-800 text-zinc-300 focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="all">All Role Categories</option>
                {roleCategories.map((rc) => (
                  <option key={rc} value={rc}>{rc}</option>
                ))}
              </select>

              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="text-xs font-medium rounded-xl px-3 py-2 bg-zinc-950/80 border border-zinc-800 text-zinc-300 focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="all">All Eligible Batches</option>
                {batches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          )}

        </div>
      </div>

      {/* CONTENT DISPLAY */}
      {activeTab === 'jobs' ? (
        /* DIRECT JOBS VIEW */
        filteredJobs.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl border border-zinc-800/80 bg-zinc-900/40 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-300">No job openings found matching criteria</h3>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedExperience('all')
                setSelectedRoleCategory('all')
                setSelectedBatch('all')
                setStatusFilter('all')
              }}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-all shadow-md shadow-indigo-600/20"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'table' ? (
          <div className="glass-card rounded-2xl border border-zinc-800/80 overflow-hidden bg-zinc-900/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950/80 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800/80">
                  <tr>
                    <th className="py-3.5 px-4">Role Title</th>
                    <th className="py-3.5 px-4">Company</th>
                    <th className="py-3.5 px-4">Experience</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Salary</th>
                    <th className="py-3.5 px-4 text-center">Bookmark</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {filteredJobs.map(({ company, job }) => {
                    const isSaved = savedJobIds.includes(job.job_id)
                    return (
                      <tr
                        key={job.job_id}
                        className="hover:bg-zinc-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-bold text-zinc-100">{job.title}</td>
                        <td className="py-3.5 px-4 font-semibold text-indigo-400">{company.name}</td>
                        <td className="py-3.5 px-4 text-zinc-400 font-medium">{job.experience}</td>
                        <td className="py-3.5 px-4 text-zinc-400 font-medium truncate max-w-[140px]">{job.location}</td>
                        <td className="py-3.5 px-4 font-semibold text-zinc-200">{job.salary_range}</td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={(e) => toggleBookmarkJob(job.job_id, e)}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              isSaved ? 'text-indigo-400 font-bold' : 'text-zinc-600 hover:text-zinc-300'
                            }`}
                          >
                            <Bookmark size={14} className={isSaved ? 'fill-indigo-400' : ''} />
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <a
                            href={job.apply_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20"
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
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map(({ company, job }) => {
              const isSaved = savedJobIds.includes(job.job_id)
              return (
                <div
                  key={job.job_id}
                  className="glass-card rounded-2xl p-5 border border-zinc-800/80 bg-zinc-900/40 hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between space-y-4 group relative"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-indigo-400 text-xs">
                          {getInitials(company.name)}
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-zinc-200 line-clamp-1">
                            {company.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-semibold">
                            {company.category}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => toggleBookmarkJob(job.job_id, e)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isSaved
                            ? 'bg-indigo-600 text-white border-indigo-500/30'
                            : 'bg-zinc-950/80 text-zinc-500 border-zinc-800 hover:text-zinc-200'
                        }`}
                        title={isSaved ? 'Remove Saved Job' : 'Save Job'}
                      >
                        <Bookmark size={13} className={isSaved ? 'fill-white' : ''} />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-zinc-800/80 border border-zinc-700/60 text-zinc-300">
                          {job.experience}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-zinc-800/80 border border-zinc-700/60 text-zinc-400">
                          {job.work_type}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                        {job.title}
                      </h3>
                    </div>

                    <div className="space-y-1 text-xs text-zinc-400">
                      <div><span className="text-zinc-500 font-semibold">Location:</span> {job.location}</div>
                      <div><span className="text-zinc-500 font-semibold">Salary:</span> <span className="font-semibold text-zinc-200">{job.salary_range}</span></div>
                      <div><span className="text-zinc-500 font-semibold">Eligibility:</span> {job.batch_eligibility}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-850 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setActiveJob({ company, job })}
                      className="text-[11px] font-semibold text-indigo-400 hover:underline cursor-pointer"
                    >
                      View Details
                    </button>

                    <a
                      href={job.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Apply</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        /* COMPANY PORTALS DIRECTORY VIEW */
        filteredCompanies.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl border border-zinc-800/80 bg-zinc-900/40 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-300">No companies found matching criteria</h3>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSelectedSector('all')
                setStatusFilter('all')
              }}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-all shadow-md shadow-indigo-600/20"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'table' ? (
          <div className="glass-card rounded-2xl border border-zinc-800/80 overflow-hidden bg-zinc-900/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950/80 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800/80">
                  <tr>
                    <th className="py-3.5 px-4">Company</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Sector</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Bookmark</th>
                    <th className="py-3.5 px-4 text-right">Careers Site</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {filteredCompanies.map((company) => {
                    const isBookmarked = savedCompanyIds.includes(company.id)
                    const currentStatus = getStatusForCompany(company.id)
                    return (
                      <tr
                        key={company.id}
                        className="hover:bg-zinc-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-bold text-zinc-100 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-indigo-400 text-[10px]">
                            {getInitials(company.name)}
                          </div>
                          <span>{company.name}</span>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400 font-medium">{company.category}</td>
                        <td className="py-3.5 px-4 text-zinc-400 font-medium">{company.sector}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={currentStatus}
                              onChange={(e) => updateStatus(company.id.toString(), e.target.value, e)}
                              className="text-[11px] font-medium rounded-lg px-2.5 py-1 bg-zinc-950/80 border border-zinc-800 text-zinc-200 focus:border-indigo-500 outline-none cursor-pointer"
                            >
                              <option value="">+ Status</option>
                              <option value="target">Target</option>
                              <option value="applied">Applied</option>
                              <option value="interviewing">Interviewing</option>
                            </select>
                            {currentStatus === 'target' && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Target</span>
                            )}
                            {currentStatus === 'applied' && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Applied</span>
                            )}
                            {currentStatus === 'interviewing' && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Interviewing</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={(e) => toggleBookmarkCompany(company.id, e)}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              isBookmarked ? 'text-indigo-400' : 'text-zinc-600 hover:text-zinc-300'
                            }`}
                          >
                            <Bookmark size={14} className={isBookmarked ? 'fill-indigo-400' : ''} />
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <a
                            href={company.careers_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20"
                          >
                            <span>Careers</span>
                            <ExternalLink size={11} />
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((company) => {
              const isBookmarked = savedCompanyIds.includes(company.id)
              const currentStatus = getStatusForCompany(company.id)

              return (
                <div
                  key={company.id}
                  className="glass-card rounded-2xl p-5 border border-zinc-800/80 bg-zinc-900/40 hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between space-y-4 group relative"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-indigo-400 text-xs">
                          {getInitials(company.name)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                            {company.name}
                          </h3>
                          <span className="text-[10px] text-zinc-400 font-medium">
                            {company.category}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => toggleBookmarkCompany(company.id, e)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isBookmarked
                            ? 'bg-indigo-600 text-white border-indigo-500/30 shadow-sm'
                            : 'bg-zinc-950/80 text-zinc-500 border-zinc-800 hover:text-zinc-200'
                        }`}
                        title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Company'}
                      >
                        <Bookmark size={14} className={isBookmarked ? 'fill-white' : ''} />
                      </button>
                    </div>

                    {/* Sector & Reactive Status Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800/80 border border-zinc-700/60 text-zinc-300">
                        {company.sector}
                      </span>

                      {currentStatus === 'target' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Target
                        </span>
                      )}

                      {currentStatus === 'applied' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          Applied
                        </span>
                      )}

                      {currentStatus === 'interviewing' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Interviewing
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Actions: Status Selector & Direct Careers Link */}
                  <div className="pt-3 border-t border-zinc-850 flex items-center justify-between gap-2">
                    <select
                      value={currentStatus}
                      onChange={(e) => updateStatus(company.id.toString(), e.target.value, e)}
                      className="text-[11px] font-medium rounded-xl px-2.5 py-1.5 bg-zinc-950/80 border border-zinc-800 text-zinc-200 hover:border-zinc-700 focus:border-indigo-500 outline-none cursor-pointer transition-all"
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
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 cursor-pointer border border-indigo-500/30"
                    >
                      <span>Careers</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* JOB OPENING DETAIL MODAL */}
      {activeJob && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-zinc-800/90 bg-zinc-950/95 max-w-xl w-full space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between gap-4 border-b border-zinc-850 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-indigo-400 text-sm">
                  {getInitials(activeJob.company.name)}
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                    {activeJob.company.name} • {activeJob.company.category}
                  </span>
                  <h2 className="text-lg font-bold text-zinc-100 leading-snug mt-0.5">
                    {activeJob.job.title}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setActiveJob(null)}
                className="text-zinc-500 hover:text-zinc-200 p-1.5 rounded-xl hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Experience</span>
                <span className="font-bold text-zinc-100 mt-0.5 block">{activeJob.job.experience}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Est. Salary</span>
                <span className="font-bold text-indigo-400 mt-0.5 block">{activeJob.job.salary_range}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Work Model</span>
                <span className="font-bold text-zinc-100 mt-0.5 block">{activeJob.job.work_type}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Location</span>
                <span className="font-semibold text-zinc-200 mt-0.5 block truncate">{activeJob.job.location}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Eligibility</span>
                <span className="font-semibold text-zinc-200 mt-0.5 block">{activeJob.job.batch_eligibility}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
                Job Overview &amp; Requirements
              </span>
              <p className="text-zinc-300 leading-relaxed font-normal bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/80">
                {activeJob.job.description}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
                Required Technical Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeJob.job.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-zinc-900/80 border border-zinc-800 text-indigo-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-zinc-850">
              <button
                onClick={() => toggleBookmarkJob(activeJob.job.job_id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  savedJobIds.includes(activeJob.job.job_id)
                    ? 'bg-indigo-600 text-white border-indigo-500/30'
                    : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-850'
                }`}
              >
                <Bookmark size={14} className={savedJobIds.includes(activeJob.job.job_id) ? 'fill-white' : ''} />
                <span>{savedJobIds.includes(activeJob.job.job_id) ? 'Saved' : 'Save Opening'}</span>
              </button>

              <a
                href={activeJob.job.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <span>Apply Direct on Official Site</span>
                <ExternalLink size={13} />
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
