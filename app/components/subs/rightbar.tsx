'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Leetcode from '../leetcode'
import Gfg from '../gfgs'
import Code360 from '../coder360'

interface ProgressData {
  practiceCount: number
  mockTestsCount: number
  history?: any[]
}

const Rightbar = () => {
  const [mockTestsCount, setMockTestsCount] = useState(0)
  const [practiceCount, setPracticeCount] = useState(0)
  const [allHistory, setAllHistory] = useState<any[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string>('all')

  const loadProgress = async () => {
    try {
      const res = await fetch('/api/progress')
      if (res.ok) {
        const data = (await res.json()) as ProgressData
        setMockTestsCount(data.mockTestsCount || 0)
        setPracticeCount(data.practiceCount || 0)
        setAllHistory(data.history || [])
      }
    } catch (err) {
      console.error('Error fetching progress in Rightbar:', err)
    }
  }

  useEffect(() => {
    loadProgress()
    window.addEventListener('storage', loadProgress)
    return () => window.removeEventListener('storage', loadProgress)
  }, [])

  // Unique topics
  const topics = useMemo(() => {
    const unique = Array.from(new Set(allHistory.map((item) => item.topic))).filter(Boolean) as string[]
    return unique.sort()
  }, [allHistory])

  // Filter history based on selected topic
  const filteredHistory = useMemo(() => {
    if (selectedTopic === 'all') return allHistory
    return allHistory.filter((item) => item.topic === selectedTopic)
  }, [allHistory, selectedTopic])

  // Slice last 8 sessions for clean graph rendering
  const historyForGraph = useMemo(() => {
    return filteredHistory.slice(-8)
  }, [filteredHistory])

  // Live topic-specific metrics
  const metrics = useMemo(() => {
    const hist = filteredHistory
    const totalSessions = hist.length
    const practiceSessions = hist.filter((h) => h.type === 'practice').length
    const examSessions = hist.filter((h) => h.type !== 'practice').length

    let avgAccuracy = 0
    let highestScorePercent = 0
    let highestScoreRaw = ''
    let trendStr = 'Stable'

    if (totalSessions > 0) {
      const accuracies = hist.map((h) => (h.score / h.total) * 100)
      avgAccuracy = Math.round(accuracies.reduce((sum, val) => sum + val, 0) / totalSessions)

      const scorePercents = hist.map((h) => ({
        percent: (h.score / h.total) * 100,
        raw: `${h.score}/${h.total}`
      }))
      const best = scorePercents.reduce((max, curr) => (curr.percent > max.percent ? curr : max), scorePercents[0])
      highestScorePercent = Math.round(best.percent)
      highestScoreRaw = best.raw

      if (totalSessions >= 2) {
        const recentCount = Math.min(3, totalSessions)
        const recentAccuracies = accuracies.slice(-recentCount)
        const recentAvg = recentAccuracies.reduce((sum, val) => sum + val, 0) / recentCount

        if (recentAvg > avgAccuracy + 3) {
          trendStr = 'Improving'
        } else if (recentAvg < avgAccuracy - 3) {
          trendStr = 'Declining'
        } else {
          trendStr = 'Stable'
        }
      } else {
        trendStr = 'Initial'
      }
    }

    return {
      totalSessions,
      practiceSessions,
      examSessions,
      avgAccuracy,
      highestScorePercent,
      highestScoreRaw,
      trendStr
    }
  }, [filteredHistory])

  const getPoints = (histData: any[], width: number, height: number) => {
    const N = histData.length
    if (N === 0) return []
    const paddingLeft = 40
    const paddingRight = 40
    const paddingTop = 25
    const paddingBottom = 30

    return histData.map((item, i) => {
      const percentage = Math.round((item.score / item.total) * 100)
      const x = N > 1 ? paddingLeft + (i * (width - paddingLeft - paddingRight)) / (N - 1) : width / 2
      const y = height - paddingBottom - (percentage / 100) * (height - paddingTop - paddingBottom)
      return { x, y, percentage }
    })
  }

  const getLinePath = (histData: any[], width: number, height: number) => {
    const pts = getPoints(histData, width, height)
    if (pts.length === 0) return ''
    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i].x} ${pts[i].y}`
    }
    return d
  }

  const getAreaPath = (histData: any[], width: number, height: number) => {
    const pts = getPoints(histData, width, height)
    if (pts.length === 0) return ''
    const linePath = getLinePath(histData, width, height)
    return `${linePath} L ${pts[pts.length - 1].x} ${height - 30} L ${pts[0].x} ${height - 30} Z`
  }

  return (
    <div className="space-y-6">
      {/* Competitive Programming Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Competitive Programming Profiles
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl p-5 border border-zinc-800/80 bg-zinc-900/40">
            <Leetcode />
          </div>
          <div className="glass-card rounded-2xl p-5 border border-zinc-800/80 bg-zinc-900/40">
            <Gfg />
          </div>
          <div className="glass-card rounded-2xl p-5 border border-zinc-800/80 bg-zinc-900/40">
            <Code360 />
          </div>
        </div>
      </div>

      {/* Platform Analytics & Performance Graph Container */}
      <div className="glass-card rounded-3xl p-6 border border-zinc-800/80 bg-zinc-900/40 space-y-6">
        
        {/* Header Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Accuracy &amp; Performance Trend Graph
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5 font-normal">
              Chronological score analytics and topic coverage tracking.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="bg-zinc-950/80 border border-zinc-800 text-zinc-200 text-[11px] font-bold px-3.5 py-2 rounded-xl focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="all">All Coverage Topics</option>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px]">
                Practice: {selectedTopic === 'all' ? practiceCount : metrics.practiceSessions}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
                Exams: {selectedTopic === 'all' ? mockTestsCount : metrics.examSessions}
              </span>
            </div>
          </div>
        </div>

        {/* Live Metrics Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-3.5">
            <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider">Avg Accuracy</span>
            <span className="text-lg font-black text-indigo-400 mt-0.5 block">{metrics.avgAccuracy}%</span>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-3.5">
            <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider">Best Score</span>
            <span className="text-lg font-black text-emerald-400 mt-0.5 block">{metrics.highestScoreRaw || '0/20'}</span>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-3.5">
            <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider">Performance Trend</span>
            <span className="text-sm font-bold text-zinc-200 mt-0.5 block">{metrics.trendStr}</span>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-3.5">
            <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider">Total Sessions</span>
            <span className="text-lg font-black text-amber-400 mt-0.5 block">{metrics.totalSessions}</span>
          </div>
        </div>

        {/* High-Precision SVG Performance Trend Graph */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            <span>Accuracy Trend Curve (0% - 100%)</span>
            <span>Last {historyForGraph.length} Sessions</span>
          </div>

          <div className="h-[170px] w-full relative">
            {historyForGraph.length > 0 ? (
              <svg className="w-full h-full" viewBox="0 0 500 140" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Grid lines */}
                <line x1="0" y1="10" x2="500" y2="10" stroke="#27272a" strokeWidth="0.5" strokeDasharray="3" />
                <line x1="0" y1="55" x2="500" y2="55" stroke="#27272a" strokeWidth="0.5" strokeDasharray="3" />
                <line x1="0" y1="105" x2="500" y2="105" stroke="#27272a" strokeWidth="0.5" strokeDasharray="3" />

                {/* Draw Area */}
                <path d={getAreaPath(historyForGraph, 500, 140)} fill="url(#chart-gradient)" />

                {/* Draw Line */}
                <path d={getLinePath(historyForGraph, 500, 140)} fill="none" stroke="#6366f1" strokeWidth="2" />

                {/* Draw Circles & Text Labels */}
                {getPoints(historyForGraph, 500, 140).map((pt, idx) => {
                  const h = historyForGraph[idx]
                  const label = selectedTopic === 'all'
                    ? (h.topic.length > 10 ? h.topic.substring(0, 8) + '..' : h.topic)
                    : new Date(h.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  return (
                    <g key={idx}>
                      <circle cx={pt.x} cy={pt.y} r="4" fill="#6366f1" stroke="#09090b" strokeWidth="2" />
                      <text x={pt.x} y={pt.y - 8} fill="#e4e4e7" fontSize="9" fontWeight="bold" textAnchor="middle">
                        {pt.percentage}%
                      </text>
                      <text x={pt.x} y={132} fill="#a1a1aa" fontSize="8" fontWeight="bold" textAnchor="middle" className="uppercase tracking-wider">
                        {label}
                      </text>
                    </g>
                  )
                })}
              </svg>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-xs text-zinc-500 font-bold border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40 space-y-1">
                <span>No Session Activity Data Logged</span>
                <span className="text-[10px] text-zinc-600 font-normal text-center px-4">
                  Complete practice topics or mock exams to render accuracy performance trends.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* History Log List */}
        <div className="space-y-3">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
            Session Log History {selectedTopic !== 'all' && `(${selectedTopic})`}
          </span>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {filteredHistory.length > 0 ? (
              filteredHistory.slice().reverse().map((item, idx) => {
                const percentage = Math.round((item.score / item.total) * 100)
                const dateStr = new Date(item.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-850 hover:border-zinc-800 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider">
                          {item.type === 'practice' ? 'Practice' : 'Exam'}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                          • {item.difficulty}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-zinc-100 mt-0.5 truncate">{item.topic}</h5>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs font-black ${percentage >= 70 ? 'text-emerald-400' : percentage >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {item.score} / {item.total}
                      </span>
                      <span className="text-[9px] font-medium text-zinc-500 block mt-0.5">{dateStr}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-6 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40">
                <p className="text-xs text-zinc-500 font-medium">No activity logs recorded yet</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Rightbar
