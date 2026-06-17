'use client'
import React, { useState, useEffect } from 'react'
import Leetcode from '../leetcode'
import Gfg from '../gfgs'
import Code360 from '../coder360'
import { ChevronRight } from 'lucide-react'

interface ProgressData {
  practiceCount: number
  mockTestsCount: number
  history?: any[]
}

const Rightbar = () => {
  const [mockTestsCount, setMockTestsCount] = useState(0)
  const [practiceCount, setPracticeCount] = useState(0)
  const [history, setHistory] = useState<any[]>([])

  const loadProgress = async () => {
    try {
      const res = await fetch('/api/progress')
      if (res.ok) {
        const data = (await res.json()) as ProgressData
        setMockTestsCount(data.mockTestsCount || 0)
        setPracticeCount(data.practiceCount || 0)
        
        // Show last 7 elements for clean graph rendering
        if (data.history && data.history.length > 0) {
          setHistory(data.history.slice(-7))
        } else {
          setHistory([])
        }
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

  const getPoints = (histData: any[], width: number, height: number) => {
    const N = histData.length
    if (N === 0) return []
    const paddingLeft = 40
    const paddingRight = 40
    const paddingTop = 25
    const paddingBottom = 20

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
    return `${linePath} L ${pts[pts.length - 1].x} ${height - 20} L ${pts[0].x} ${height - 20} Z`
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Platform Activities</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5 font-medium">Historical performance and quiz score analytics</p>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 bg-indigo-500/5 px-3 py-1.5 rounded-xl border border-indigo-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span className="text-zinc-400">Practice: <span className="text-zinc-200 font-bold">{practiceCount}</span></span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-zinc-400">Exams: <span className="text-zinc-200 font-bold">{mockTestsCount}</span></span>
            </div>
          </div>
        </div>

        {/* Score Trend Graph */}
        <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
            <span>Score Trend (Success Accuracy %)</span>
            <span>Last {history.length} Sessions</span>
          </div>

          <div className="h-[140px] w-full relative">
            {history.length > 0 ? (
              <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Grid lines */}
                <line x1="0" y1="10" x2="500" y2="10" stroke="#27272a" strokeWidth="0.5" strokeDasharray="3" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="#27272a" strokeWidth="0.5" strokeDasharray="3" />
                <line x1="0" y1="110" x2="500" y2="110" stroke="#27272a" strokeWidth="0.5" strokeDasharray="3" />

                {/* Draw Area */}
                <path d={getAreaPath(history, 500, 120)} fill="url(#chart-gradient)" />

                {/* Draw Line */}
                <path d={getLinePath(history, 500, 120)} fill="none" stroke="#6366f1" strokeWidth="1.5" />

                {/* Draw Circles and Text */}
                {getPoints(history, 500, 120).map((pt, idx) => (
                  <g key={idx}>
                    <circle cx={pt.x} cy={pt.y} r="3" fill="#6366f1" stroke="#09090b" strokeWidth="1" />
                    <text x={pt.x} y={pt.y - 8} fill="#a1a1aa" fontSize="8" fontWeight="bold" textAnchor="middle">
                      {pt.percentage}%
                    </text>
                  </g>
                ))}
              </svg>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-xs text-zinc-500 font-semibold border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
                <span>No activity data recorded yet</span>
                <span className="text-[10px] text-zinc-600 mt-1 font-medium font-sans text-center px-4 leading-normal">Complete practice topics or mock exams to start tracking your performance</span>
              </div>
            )}
          </div>

          {/* Graph labels */}
          {history.length > 0 && (
            <div className="flex justify-between items-center mt-2 px-1 text-[9px] font-bold text-zinc-500 uppercase tracking-wide">
              {history.map((h, idx) => (
                <span key={idx} className="truncate max-w-[65px] text-center" title={h.topic}>
                  {h.topic}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* History Log List */}
        <div className="space-y-3">
          <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Chronological Log History</h4>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {history.length > 0 ? (
              history.slice().reverse().map((item, idx) => {
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
                        <span className="w-1 h-1 rounded-full bg-zinc-700" />
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
                <p className="text-[11px] text-zinc-600 font-semibold">No activity logs available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Rightbar
