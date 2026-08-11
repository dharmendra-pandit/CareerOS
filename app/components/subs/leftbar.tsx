'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

interface ProfileData {
  name: string
  role: string
  email: string
  prepInternship?: boolean
  prepPlacement?: boolean
  prepGovt?: boolean
}

const Leftbar = () => {
  const [userName, setUserName] = useState('Dharmendra Pandit')
  const [userRole, setUserRole] = useState('Software Engineer')
  const [userEmail, setUserEmail] = useState('dharmendra193728@gmail.com')
  const [tracks, setTracks] = useState<string[]>([])

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/profile')
        if (res.ok) {
          const data = (await res.json()) as ProfileData
          setUserName(data.name || 'Dharmendra Pandit')
          setUserRole(data.role || 'Software Engineer')
          setUserEmail(data.email || 'dharmendra193728@gmail.com')

          const activeTracks: string[] = []
          if (data.prepPlacement) activeTracks.push('Full-Time Placement')
          if (data.prepInternship) activeTracks.push('Internship Screening')
          if (data.prepGovt) activeTracks.push('Government Track')
          setTracks(activeTracks)
        }
      } catch (err) {
        console.error('Error fetching profile in Leftbar:', err)
      }
    }

    loadProfile()
    window.addEventListener('storage', loadProfile)
    return () => window.removeEventListener('storage', loadProfile)
  }, [])

  return (
    <div className="glass-card rounded-3xl p-6 border border-zinc-800/80 bg-zinc-900/40 animate-fade-in space-y-6">
      {/* Profile Image & Basic Info */}
      <div className="flex flex-col items-center">
        <div className="relative h-40 w-40 overflow-hidden rounded-3xl border-2 border-indigo-500/30 shadow-2xl bg-zinc-900">
          <Image
            src="/me-1.jpeg"
            alt={userName}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            priority
          />
        </div>

        <h2 className="text-xl font-black tracking-tight text-zinc-100 mt-4 text-center">
          {userName}
        </h2>
        <p className="text-xs text-indigo-400 font-bold tracking-wider uppercase mt-1">
          {userRole}
        </p>
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
          Fullstack &amp; Algorithms Engineer
        </span>
      </div>

      {/* Mini Bio */}
      <div className="rounded-2xl bg-zinc-950/60 p-4 border border-zinc-800/80">
        <p className="text-xs text-zinc-400 leading-relaxed font-normal">
          Building scalable Web &amp; AI applications, algorithm design, and preparing for senior engineering technical screening.
        </p>
      </div>

      {/* Preparation Tracks */}
      {tracks.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
            Active Target Tracks
          </span>
          <div className="flex flex-wrap gap-1.5">
            {tracks.map((track) => (
              <span
                key={track}
                className="px-3 py-1 rounded-xl text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
              >
                {track}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Contact Details */}
      <div className="space-y-3 pt-2 border-t border-zinc-850">
        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
          Contact Details
        </span>
        <div className="space-y-2 text-xs font-medium text-zinc-300">
          <div className="flex justify-between py-1 border-b border-zinc-850">
            <span className="text-zinc-500 font-normal">Email:</span>
            <span className="truncate max-w-[180px] font-bold text-zinc-200">{userEmail}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-zinc-850">
            <span className="text-zinc-500 font-normal">Phone:</span>
            <span className="font-bold text-zinc-200">+91 62042 98947</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-zinc-500 font-normal">Location:</span>
            <span className="font-bold text-zinc-200">Bihar, India</span>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-2 pt-2 border-t border-zinc-850">
        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
          Professional Profiles
        </span>
        <div className="flex flex-col gap-2">
          <a
            href="https://www.linkedin.com/in/dharmendra-pandit-1b0b4a1b6/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-2.5 text-xs font-bold text-zinc-200 hover:border-indigo-500/40 hover:text-indigo-300 transition-all cursor-pointer"
          >
            <span>LinkedIn</span>
            <span className="text-[10px] text-zinc-500 font-mono">↗</span>
          </a>

          <a
            href="https://github.com/dharmendra193728"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-2.5 text-xs font-bold text-zinc-200 hover:border-indigo-500/40 hover:text-indigo-300 transition-all cursor-pointer"
          >
            <span>GitHub</span>
            <span className="text-[10px] text-zinc-500 font-mono">↗</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default Leftbar
