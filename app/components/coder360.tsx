'use client'
import React from 'react'
import useSWR from 'swr'
import { Terminal, ArrowUpRight } from 'lucide-react'

type DifficultyItem = { level: string; count: number }
type Code360Data = {
  total_count: number
  difficulty_data: DifficultyItem[]
}

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json() as Promise<Code360Data>)

const Code360 = () => {
  const { data, error } = useSWR<Code360Data>('/api/coder360', fetcher)

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
        Syncing Code360...
      </div>
    )
  }

  const stats = Object.fromEntries(
    data.difficulty_data.map((item: DifficultyItem) => [
      item.level,
      item.count,
    ]),
  ) as Record<string, number>

  const easy = stats.Easy || 0
  const moderate = stats.Moderate || 0
  const hard = stats.Hard || 0
  const ninja = stats.Ninja || 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
          <Terminal className="h-3.5 w-3.5 text-cyan-400" />
          Code360
        </span>
        <a 
          href="https://www.naukri.com/code360/profile/panditbth" 
          target="_blank" 
          rel="noreferrer"
          className="text-zinc-650 hover:text-zinc-400"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Hero Stats */}
      <div>
        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Total Solved</span>
        <p className="text-3xl font-black text-zinc-100 tracking-tight mt-0.5">{data.total_count || 0}</p>
      </div>

      {/* Difficulty Breakdown */}
      <div className="space-y-2 pt-2 border-t border-zinc-850">
        <div>
          <div className="flex justify-between text-[10px] font-semibold text-zinc-400 mb-1">
            <span>Easy / Mod</span>
            <span className="text-emerald-400 font-bold">{easy + moderate}</span>
          </div>
          <div className="h-1 w-full bg-zinc-850 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, ((easy + moderate) / 300) * 100)}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] font-semibold text-zinc-400 mb-1">
            <span>Hard</span>
            <span className="text-amber-400 font-bold">{hard}</span>
          </div>
          <div className="h-1 w-full bg-zinc-850 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (hard / 100) * 100)}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] font-semibold text-zinc-400 mb-1">
            <span>Ninja</span>
            <span className="text-purple-400 font-bold">{ninja}</span>
          </div>
          <div className="h-1 w-full bg-zinc-850 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, (ninja / 20) * 100)}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Code360
