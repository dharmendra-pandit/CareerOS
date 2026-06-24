'use client'
import React, { useState, useEffect } from 'react'
import Leetcode from '../leetcode'
import Gfg from '../gfgs'
import Code360 from '../coder360'
import { ChevronRight, ChevronDown, Award, TrendingUp, TrendingDown, Minus, BookOpen } from 'lucide-react'

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
    // Listen for storage events to update values reactively when saved
    window.addEventListener('storage', loadProgress)
    return () => window.removeEventListener('storage', loadProgress)
  }, [])

  // Extract unique topics from all history in alphabetical order
  const topics = React.useMemo(() => {
    const unique = Array.from(new Set(allHistory.map(item => item.topic))).filter(Boolean) as string[]
    return unique.sort()
  }, [allHistory])

  // Filter history based on selected topic
  const filteredHistory = React.useMemo(() => {
    if (selectedTopic === 'all') return allHistory
    return allHistory.filter(item => item.topic === selectedTopic)
  }, [allHistory, selectedTopic])

  // Slice last 7 sessions for clean graph rendering
  const historyForGraph = React.useMemo(() => {
    return filteredHistory.slice(-7)
  }, [filteredHistory])

  // Compute live topic-specific metrics
  const metrics = React.useMemo(() => {
    const hist = filteredHistory
    const totalSessions = hist.length
    const practiceSessions = hist.filter(h => h.type === 'practice').length
    const examSessions = hist.filter(h => h.type !== 'practice').length
    
    let avgAccuracy = 0
    let highestScorePercent = 0
    let highestScoreRaw = ''
    let trend: 'improving' | 'declining' | 'stable' | 'insufficient' = 'insufficient'

    if (totalSessions > 0) {
      const accuracies = hist.map(h => (h.score / h.total) * 100)
      avgAccuracy = Math.round(accuracies.reduce((sum, val) => sum + val, 0) / totalSessions)
      
      const scorePercents = hist.map(h => ({
        percent: (h.score / h.total) * 100,
        raw: `${h.score}/${h.total}`
      }))
      const best = scorePercents.reduce((max, curr) => curr.percent > max.percent ? curr : max, scorePercents[0])
      highestScorePercent = Math.round(best.percent)
      highestScoreRaw = best.raw

      if (totalSessions >= 2) {
        const recentCount = Math.min(3, totalSessions)
        const recentAccuracies = accuracies.slice(-recentCount)
        const recentAvg = recentAccuracies.reduce((sum, val) => sum + val, 0) / recentCount
        
        if (recentAvg > avgAccuracy + 3) {
          trend = 'improving'
        } else if (recentAvg < avgAccuracy - 3) {
          trend = 'declining'
        } else {
          trend = 'stable'
        }
      } else {
        trend = 'insufficient'
      }
    }

    return {
      totalSessions,
      practiceSessions,
      examSessions,
      avgAccuracy,
      highestScorePercent,
      highestScoreRaw,
      trend
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
      const x = N > 1 
        ? paddingLeft + i * (width - paddingLeft - paddingRight) / (N - 1)
        : width / 2
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
      {/* Platform Solving Stats */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Competitive Programming</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl p-5 border border-zinc-800/80 bg-zinc-900/10">
            <Leetcode />
          </div>
          <div className="glass-card rounded-2xl p-5 border border-zinc-800/80 bg-zinc-900/10">
            <Gfg />
          </div>
          <div className="glass-card rounded-2xl p-5 border border-zinc-800/80 bg-zinc-900/10">
            <Code360 />
          </div>
        </div>
      </div>

      {/* Internal CareerOS Progress & Platform Activities */}
      <div className="glass-card rounded-3xl p-6 border border-zinc-800/80 bg-zinc-900/10 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Platform Activities</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5 font-medium">Historical performance and quiz score analytics</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Custom Dropdown Selector */}
            <div className="relative">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="appearance-none bg-zinc-950/65 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-[11px] font-bold px-4 py-2 pr-9 rounded-xl focus:outline-none focus:border-indigo-500 transition-all cursor-pointer shadow-sm shadow-zinc-950/50"
              >
                <option value="all">All Topics</option>
                {topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
                <ChevronDown size={12} />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <div className="flex items-center gap-1.5 bg-indigo-500/5 px-3 py-1.5 rounded-xl border border-indigo-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span className="text-zinc-400 text-[11px]">
                  Practice: <span className="text-zinc-200 font-bold">{selectedTopic === 'all' ? practiceCount : metrics.practiceSessions}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-zinc-400 text-[11px]">
                  Exams: <span className="text-zinc-200 font-bold">{selectedTopic === 'all' ? mockTestsCount : metrics.examSessions}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Topic Statistics Summary */}
        {allHistory.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in">
            {/* Average Accuracy Card */}
            <div className="bg-zinc-950/35 border border-zinc-850/65 rounded-xl p-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 flex-shrink-0">
                <Award size={16} />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider">Avg Accuracy</span>
                <span className="text-sm font-black text-zinc-200">{metrics.avgAccuracy}%</span>
              </div>
            </div>

            {/* Best Score Card */}
            <div className="bg-zinc-950/35 border border-zinc-850/65 rounded-xl p-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 flex-shrink-0">
                <BookOpen size={16} />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider">Best Score</span>
                <span className="text-sm font-black text-zinc-200">{metrics.highestScoreRaw || '0/20'}</span>
              </div>
            </div>

            {/* Trend Card */}
            <div className="bg-zinc-950/35 border border-zinc-850/65 rounded-xl p-3 flex items-center gap-3">
              <div className={`p-2 rounded-lg flex-shrink-0 ${
                metrics.trend === 'improving' 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : metrics.trend === 'declining' 
                  ? 'bg-rose-500/10 text-rose-400' 
                  : 'bg-zinc-800 text-zinc-400'
              }`}>
                {metrics.trend === 'improving' && <TrendingUp size={16} />}
                {metrics.trend === 'declining' && <TrendingDown size={16} />}
                {(metrics.trend === 'stable' || metrics.trend === 'insufficient') && <Minus size={16} />}
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider">Trend</span>
                <span className="text-xs font-extrabold capitalize text-zinc-200 block truncate">
                  {metrics.trend === 'insufficient' ? 'No Trend Yet' : metrics.trend}
                </span>
              </div>
            </div>

            {/* Target Topic */}
            <div className="bg-zinc-950/35 border border-zinc-850/65 rounded-xl p-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 flex-shrink-0">
                <span className="text-xs font-black">#</span>
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider">Filtered Topic</span>
                <span className="text-xs font-extrabold text-zinc-200 truncate block">
                  {selectedTopic === 'all' ? 'All Coverage' : selectedTopic}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Score Trend Graph */}
        <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
            <span>Score Trend (Success Accuracy %)</span>
            <span>Last {historyForGraph.length} Sessions</span>
          </div>

          <div className="h-[150px] w-full relative">
            {historyForGraph.length > 0 ? (
              <svg className="w-full h-full" viewBox="0 0 500 130" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Grid lines */}
                <line x1="0" y1="10" x2="500" y2="10" stroke="#27272a" strokeWidth="0.5" strokeDasharray="3" />
                <line x1="0" y1="50" x2="500" y2="50" stroke="#27272a" strokeWidth="0.5" strokeDasharray="3" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#27272a" strokeWidth="0.5" strokeDasharray="3" />

                {/* Draw Area */}
                <path d={getAreaPath(historyForGraph, 500, 130)} fill="url(#chart-gradient)" />

                {/* Draw Line */}
                <path d={getLinePath(historyForGraph, 500, 130)} fill="none" stroke="#6366f1" strokeWidth="1.5" />

                {/* Draw Circles and Text/Labels */}
                {getPoints(historyForGraph, 500, 130).map((pt, idx) => {
                  const h = historyForGraph[idx];
                  const label = selectedTopic === 'all'
                    ? (h.topic.length > 10 ? h.topic.substring(0, 8) + '..' : h.topic)
                    : new Date(h.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <g key={idx}>
                      <circle cx={pt.x} cy={pt.y} r="3.5" fill="#6366f1" stroke="#09090b" strokeWidth="1.5" />
                      <text x={pt.x} y={pt.y - 8} fill="#a1a1aa" fontSize="8" fontWeight="bold" textAnchor="middle">
                        {pt.percentage}%
                      </text>
                      <text x={pt.x} y={122} fill="#71717a" fontSize="8" fontWeight="bold" textAnchor="middle" className="uppercase tracking-wider">
                        {label}
                      </text>
                    </g>
                  )
                })}
              </svg>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-xs text-zinc-500 font-semibold border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
                <span>No activity data recorded yet</span>
                <span className="text-[10px] text-zinc-600 mt-1 font-medium font-sans text-center px-4 leading-normal">Complete practice topics or mock exams to start tracking your performance</span>
              </div>
            )}
          </div>
        </div>

        {/* History Log List */}
        <div className="space-y-3">
          <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-sans">
            Chronological Log History {selectedTopic !== 'all' && `(${selectedTopic})`}
          </h4>
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
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/30 border border-zinc-850 hover:border-zinc-800 transition-colors animate-fade-in"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] uppercase font-extrabold text-zinc-500 tracking-wider">
                          {item.type === 'practice' ? 'Practice' : 'Exam'}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                        <span className="text-[9px] uppercase font-extrabold text-zinc-500 tracking-wider">
                          {item.difficulty}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-zinc-200 mt-0.5 truncate">{item.topic}</h5>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs font-black ${percentage >= 70 ? 'text-emerald-400' : percentage >= 50 ? 'text-indigo-400' : 'text-rose-400'}`}>
                        {item.score} / {item.total}
                      </span>
                      <span className="text-[9px] font-bold text-zinc-500 block mt-0.5">{dateStr}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-6 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
                <p className="text-[11px] text-zinc-600 font-semibold">No activity logs available for this topic yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Rightbar
