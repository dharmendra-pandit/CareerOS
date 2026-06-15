'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Mail, Phone, MapPin, Link2 } from 'lucide-react'

interface ProfileData {
  name: string
  role: string
  email: string
}

const Leftbar = () => {
  const [userName, setUserName] = useState('Dharmendra Pandit')
  const [userRole, setUserRole] = useState('Software Engineer')
  const [userEmail, setUserEmail] = useState('dharmendra193728@gmail.com')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/profile')
        if (res.ok) {
          const data = (await res.json()) as ProfileData
          setUserName(data.name || 'Dharmendra Pandit')
          setUserRole(data.role || 'Software Engineer')
          setUserEmail(data.email || 'dharmendra193728@gmail.com')
        }
      } catch (err) {
        console.error('Error fetching profile in Leftbar:', err)
      }
    }

    loadProfile()
    // Listen for storage events to update values reactively when saved
    window.addEventListener('storage', loadProfile)
    return () => window.removeEventListener('storage', loadProfile)
  }, [])

  return (
    <div className="glass-card rounded-2xl p-6 border border-zinc-800/80 bg-zinc-900/10 animate-fade-in">
      {/* Profile Image & Basic Info */}
      <div className="flex flex-col items-center">
        <div className="relative h-44 w-44 overflow-hidden rounded-full border-2 border-indigo-500/30 shadow-lg shadow-indigo-500/5 bg-zinc-900">
          <Image
            src="/me-1.jpeg"
            alt={userName}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            priority
          />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-zinc-100 mt-4 text-center">
          {userName}
        </h2>
        <p className="text-xs text-indigo-400 font-semibold tracking-wide uppercase mt-1">
          {userRole}
        </p>
        <span className="text-[10px] text-zinc-500 font-medium tracking-wide">
          AI/ML • DevOps • Fullstack
        </span>
      </div>

      {/* Mini bio */}
      <div className="mt-5 rounded-xl bg-zinc-900/40 p-4 border border-zinc-800/60">
        <p className="text-xs text-zinc-400 leading-relaxed font-medium">
          Passionate about building scalable applications, AI-powered products,
          and preparing for placements and internship screening.
        </p>
      </div>

      {/* Contact Details */}
      <div className="mt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Contact</h3>
        <div className="mt-3 space-y-2.5 text-xs text-zinc-400">
          <p className="flex items-center gap-2.5">
            <Mail className="h-4 w-4 text-zinc-500 flex-shrink-0" />
            <span className="truncate">{userEmail}</span>
          </p>
          <p className="flex items-center gap-2.5">
            <Phone className="h-4 w-4 text-zinc-500 flex-shrink-0" />
            <span>+91 62042 98947</span>
          </p>
          <p className="flex items-center gap-2.5">
            <MapPin className="h-4 w-4 text-zinc-500 flex-shrink-0" />
            <span>Bihar, India</span>
          </p>
        </div>
      </div>

      {/* Social Links */}
      <div className="mt-6 pt-5 border-t border-zinc-850">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Links</h3>
        <div className="flex flex-col gap-2">
          <a
            href="https://www.linkedin.com/in/dharmendra-pandit-1b0b4a1b6/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/20 px-3.5 py-2.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-all"
          >
            <span className="flex items-center gap-2">
              <Link2 className="h-3.5 w-3.5 text-zinc-400" />
              LinkedIn
            </span>
            <Link2 className="h-3 w-3 text-zinc-500" />
          </a>

          <a
            href="https://github.com/dharmendra193728"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/20 px-3.5 py-2.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-all"
          >
            <span className="flex items-center gap-2">
              <Link2 className="h-3.5 w-3.5 text-zinc-400" />
              GitHub
            </span>
            <Link2 className="h-3 w-3 text-zinc-500" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default Leftbar
