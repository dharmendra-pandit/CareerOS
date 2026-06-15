'use client'
import React from 'react'
import useSWR from 'swr'
import { Code2, ArrowUpRight } from 'lucide-react'

type Difficulty = 'Easy' | 'Medium' | 'Hard'

interface SubmissionItem {
  difficulty: Difficulty
  count: number
}

interface LeetcodeData {
  totalSolved: number
  totalSubmissions: SubmissionItem[]
}

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json() as Promise<LeetcodeData>)

const Leetcode = () => {
  const { data, error } = useSWR('/api/leetcode', fetcher)

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
        Syncing LeetCode...
      </div>
    )
  }

  const easy =
    data.totalSubmissions.find(
      (item: SubmissionItem) => item.difficulty === 'Easy',
    )?.count || 0

  const medium =
    data.totalSubmissions.find(
      (item: SubmissionItem) => item.difficulty === 'Medium',
    )?.count || 0

  const hard =
    data.totalSubmissions.find(
      (item: SubmissionItem) => item.difficulty === 'Hard',
    )?.count || 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
          <Code2 className="h-3.5 w-3.5 text-orange-400" />
          LeetCode
        </span>
        <a 
          href="https://leetcode.com/dpbth" 
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
        <p className="text-3xl font-black text-zinc-100 tracking-tight mt-0.5">{data.totalSolved}</p>
      </div>

      {/* Difficulty Breakdown */}
      <div className="space-y-2 pt-2 border-t border-zinc-850">
        <div>
          <div className="flex justify-between text-[10px] font-semibold text-zinc-400 mb-1">
            <span>Easy</span>
            <span className="text-emerald-400 font-bold">{easy}</span>
          </div>
          <div className="h-1 w-full bg-zinc-850 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (easy / 300) * 100)}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] font-semibold text-zinc-400 mb-1">
            <span>Medium</span>
            <span className="text-amber-400 font-bold">{medium}</span>
          </div>
          <div className="h-1 w-full bg-zinc-850 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (medium / 400) * 100)}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] font-semibold text-zinc-400 mb-1">
            <span>Hard</span>
            <span className="text-rose-400 font-bold">{hard}</span>
          </div>
          <div className="h-1 w-full bg-zinc-850 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, (hard / 100) * 100)}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leetcode
