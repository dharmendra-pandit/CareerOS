'use client'
import React, { useState, useEffect } from 'react'
import Leetcode from '../leetcode'
import Gfg from '../gfgs'
import Code360 from '../coder360'
import { Award, BookOpen } from 'lucide-react'

interface ProgressData {
  practiceCount: number
  mockTestsCount: number
}

const Rightbar = () => {
  const [mockTestsCount, setMockTestsCount] = useState(0)
  const [practiceCount, setPracticeCount] = useState(0)

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await fetch('/api/progress')
        if (res.ok) {
          const data = (await res.json()) as ProgressData
          setMockTestsCount(data.mockTestsCount || 0)
          setPracticeCount(data.practiceCount || 0)
        }
      } catch (err) {
        console.error('Error fetching progress in Rightbar:', err)
      }
    }

    loadProgress()
    // Listen for storage events to update values reactively when saved
    window.addEventListener('storage', loadProgress)
    return () => window.removeEventListener('storage', loadProgress)
  }, [])

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

      {/* Internal CareerOS Progress */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Platform Activities</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="glass-card rounded-2xl p-5 border border-zinc-800/80 bg-zinc-900/10 flex items-center gap-4 animate-fade-in">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Award size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-200">Company Mock Exams</h4>
              <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">
                {mockTestsCount === 0 ? 'No simulated tests attempted' : `${mockTestsCount} simulated test${mockTestsCount > 1 ? 's' : ''} attempted`}
              </p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-zinc-800/80 bg-zinc-900/10 flex items-center gap-4 animate-fade-in">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BookOpen size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-200">Topic-wise Practice</h4>
              <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">
                {practiceCount === 0 ? 'No practice topics completed' : `${practiceCount} practice session${practiceCount > 1 ? 's' : ''} finished`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Rightbar
