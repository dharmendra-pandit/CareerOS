'use client'
import React from 'react'
import useSWR from 'swr'
import { Award, ArrowUpRight } from 'lucide-react'

interface GfgData {
  codingScore: number
  problemsSolved: number
  instituteRank: number
  articlesPublished: number
  school: number
  basic: number
  easy: number
  medium: number
  hard: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json() as Promise<GfgData>)

const GFG = () => {
  const { data, error } = useSWR<GfgData>('/api/gfgs', fetcher)

  if (error) {
    return (
      <div className="text-xs text-rose-400 font-semibold p-2">
        Profile unavailable
      </div>
    )
  }
  
  if (!data) {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold p-2">
        <div className="h-3 w-3 rounded-full border border-zinc-700 border-t-zinc-400 animate-spin" />
        Syncing GeeksforGeeks...
      </div>
    )
  }

  const schoolBasic = (data.school || 0) + (data.basic || 0)
  const easy = data.easy || 0
  const medium = data.medium || 0
  const hard = data.hard || 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
          <Award className="h-3.5 w-3.5 text-emerald-400" />
          GeeksforGeeks
        </span>
        <a 
          href="https://www.geeksforgeeks.org/profile/iampanditbth/" 
          target="_blank" 
          rel="noreferrer"
          className="text-zinc-650 hover:text-zinc-400"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Hero Stats */}
      <div className="flex justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Solved</span>
          <p className="text-2xl font-black text-zinc-100 tracking-tight mt-0.5">{data.problemsSolved || 0}</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Score</span>
          <p className="text-2xl font-black text-emerald-400 tracking-tight mt-0.5">{data.codingScore || 0}</p>
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="space-y-2 pt-2 border-t border-zinc-850">
        <div>
          <div className="flex justify-between text-[10px] font-semibold text-zinc-400 mb-1">
            <span>Easy / Basic</span>
            <span className="text-emerald-400 font-bold">{schoolBasic + easy}</span>
          </div>
          <div className="h-1 w-full bg-zinc-850 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, ((schoolBasic + easy) / 300) * 100)}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] font-semibold text-zinc-400 mb-1">
            <span>Medium</span>
            <span className="text-amber-400 font-bold">{medium}</span>
          </div>
          <div className="h-1 w-full bg-zinc-850 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (medium / 200) * 100)}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] font-semibold text-zinc-400 mb-1">
            <span>Hard</span>
            <span className="text-rose-400 font-bold">{hard}</span>
          </div>
          <div className="h-1 w-full bg-zinc-850 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, (hard / 50) * 100)}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default GFG
