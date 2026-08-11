'use client'

import React, { useState, useEffect } from 'react'
import Leftbar from '../components/subs/leftbar'
import Rightbar from '../components/subs/rightbar'

interface ProfileData {
  name: string
  role: string
  email: string
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Dharmendra Pandit',
    role: 'Software Engineer',
    email: 'dharmendra193728@gmail.com'
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/profile')
        if (res.ok) {
          const data = await res.json()
          setProfile({
            name: data.name || 'Dharmendra Pandit',
            role: data.role || 'Software Engineer',
            email: data.email || 'dharmendra193728@gmail.com'
          })
        }
      } catch (err) {
        console.error('Error loading profile in Profile page:', err)
      }
    }

    loadProfile()
  }, [])

  return (
    <div className="p-6 text-zinc-100 min-h-screen max-w-7xl mx-auto space-y-6 animate-fade-in relative">
      
      {/* Top Banner Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-zinc-800/80 bg-gradient-to-r from-indigo-950/40 via-zinc-900/60 to-zinc-900/40 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl z-10">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 inline-block">
            Developer Analytics &amp; Profile
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">
            {profile.name}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-normal">
            {profile.role} • Comprehensive skill metrics, competitive programming performance, and preparation progress logs.
          </p>
        </div>
      </div>

      {/* Main Profile Grid */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: User Profile Info Card */}
        <div className="lg:col-span-1">
          <Leftbar />
        </div>

        {/* Right Column: Coding Metrics & Performance Trend Graph */}
        <div className="lg:col-span-2">
          <Rightbar />
        </div>
      </div>

    </div>
  )
}

export default Profile
