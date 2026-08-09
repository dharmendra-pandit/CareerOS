'use client'

import React, { useState, useEffect } from 'react'
import { Bell, Briefcase, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface JobAlertsBannerProps {
  onNavigateToCareers?: () => void
}

const ALERTS = [
  {
    id: 1,
    tag: 'CAREERS DIRECTORY',
    title: '51 Corporate & Tech Careers Portals Active',
    detail: 'Direct official application portals for TCS, Infosys, Google, Microsoft & Swiggy.',
    linkText: 'View Careers'
  },
  {
    id: 2,
    tag: 'GLOBAL MNCS',
    title: 'Global Tech Giants Active Hiring Portals',
    detail: 'Verified links for Amazon India, Deloitte, Accenture, IBM & Goldman Sachs.',
    linkText: 'View Openings'
  },
  {
    id: 3,
    tag: 'UNICORN STARTUPS',
    title: 'Unicorns & High-Growth Tech Startups Hiring',
    detail: 'Explore direct career portals at Swiggy, Razorpay, Zomato, CRED & Zerodha.',
    linkText: 'Explore Startups'
  }
]

export default function JobAlertsBanner({ onNavigateToCareers }: JobAlertsBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  // Auto slide alerts every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ALERTS.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  if (dismissed) return null

  const currentAlert = ALERTS[currentIndex]

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === 0 ? ALERTS.length - 1 : prev - 1))
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % ALERTS.length)
  }

  return (
    <div className="w-full bg-zinc-900 border-b border-zinc-800 text-zinc-200 px-4 py-2.5 transition-all select-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Left Side: Icon, Badge, Text */}
        <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
          <div className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 flex-shrink-0">
            <Bell size={13} />
          </div>

          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-zinc-800 border border-zinc-700 text-zinc-200 flex-shrink-0">
            {currentAlert.tag}
          </span>

          <div className="min-w-0 flex-1 flex items-center gap-2 overflow-hidden">
            <span className="font-semibold text-zinc-100 truncate">
              {currentAlert.title}
            </span>
            <span className="hidden lg:inline text-zinc-400 truncate text-[11px]">
              — {currentAlert.detail}
            </span>
          </div>
        </div>

        {/* Right Side: Prev/Next, CTA, Close */}
        <div className="flex items-center gap-2.5 flex-shrink-0 self-end sm:self-center">
          {/* Slider Controls */}
          <div className="flex items-center gap-1 bg-zinc-950/60 rounded-md border border-zinc-800 p-0.5">
            <button
              onClick={handlePrev}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Previous Alert"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="text-[10px] font-bold text-zinc-400 px-1 font-mono">
              {currentIndex + 1}/{ALERTS.length}
            </span>
            <button
              onClick={handleNext}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Next Alert"
            >
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Action Button */}
          {onNavigateToCareers && (
            <button
              onClick={onNavigateToCareers}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold bg-zinc-100 hover:bg-white text-zinc-950 transition-colors cursor-pointer shadow-sm"
            >
              <Briefcase size={12} />
              <span>{currentAlert.linkText}</span>
            </button>
          )}

          {/* Dismiss button */}
          <button
            onClick={() => setDismissed(true)}
            className="text-zinc-500 hover:text-zinc-200 p-1 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>

      </div>
    </div>
  )
}
