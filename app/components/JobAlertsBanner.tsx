'use client'

import React, { useState, useEffect } from 'react'
import { Bell, ExternalLink, X, ChevronRight, Sparkles, TrendingUp, Briefcase } from 'lucide-react'

interface JobAlertsBannerProps {
  onNavigateToCareers?: () => void
}

const ALERTS = [
  {
    id: 1,
    tag: 'NEW PORTALS',
    title: '51 Top Corporate & Tech Careers Pages Live',
    detail: 'Direct official application portals for TCS, Infosys, Google, Microsoft, Swiggy & more.',
    highlightCompany: 'Google India & Microsoft',
    linkText: 'Explore All Jobs'
  },
  {
    id: 2,
    tag: 'GLOBAL MNCS',
    title: 'Global Tech Giants Active Hiring Portals',
    detail: 'Updated careers links for Amazon India, Deloitte, Accenture, IBM & Goldman Sachs.',
    highlightCompany: 'Amazon & Deloitte',
    linkText: 'View MNC Openings'
  },
  {
    id: 3,
    tag: 'UNICORN STARTUPS',
    title: 'Indian Unicorns & High-Growth Startups Hiring',
    detail: 'Explore direct career opportunities at Swiggy, Razorpay, Zomato, CRED & Zerodha.',
    highlightCompany: 'Razorpay & CRED',
    linkText: 'Check Unicorn Jobs'
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

  return (
    <div className="w-full relative bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-zinc-900/90 border-b border-indigo-500/20 px-4 py-2.5 backdrop-blur-md transition-all shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        
        {/* Left Indicator & Content */}
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
          <div className="flex-shrink-0 relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-30"></span>
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-sm shadow-indigo-500/20">
              <Bell size={13} className="animate-bounce duration-1000" />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-hidden truncate">
            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex-shrink-0">
              {currentAlert.tag}
            </span>
            <span className="font-bold text-zinc-100 truncate">
              {currentAlert.title}
            </span>
            <span className="hidden md:inline text-zinc-400 truncate text-[11px]">
              • {currentAlert.detail}
            </span>
          </div>
        </div>

        {/* Right Controls & CTA */}
        <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-center">
          {onNavigateToCareers && (
            <button
              onClick={onNavigateToCareers}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/30 transition-all shadow-sm shadow-indigo-600/20 cursor-pointer"
            >
              <Briefcase size={12} />
              <span>{currentAlert.linkText}</span>
              <ChevronRight size={12} />
            </button>
          )}

          {/* Dots Indicator */}
          <div className="hidden sm:flex items-center gap-1">
            {ALERTS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === currentIndex ? 'w-4 bg-indigo-400' : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'
                }`}
                title={`Go to alert ${i + 1}`}
              />
            ))}
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => setDismissed(true)}
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded-md hover:bg-zinc-800/60 transition-colors cursor-pointer"
            title="Dismiss job alert banner"
          >
            <X size={14} />
          </button>
        </div>

      </div>
    </div>
  )
}
