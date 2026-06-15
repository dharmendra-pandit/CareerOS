'use client'
import React from 'react'
import Leftbar from '../components/subs/leftbar'
import Rightbar from '../components/subs/rightbar'

const Profile = () => {
  return (
    <div className="p-6 text-zinc-100 min-h-screen animate-fade-in">
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Account</span>
        <h1 className="text-3xl font-black tracking-tight mt-0.5">Developer Profile</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start mt-4">
        {/* Left Side: Profile info card */}
        <div className="lg:col-span-1">
          <Leftbar />
        </div>

        {/* Right Side: Coding metrics widgets */}
        <div className="lg:col-span-2">
          <Rightbar />
        </div>
      </div>
    </div>
  )
}

export default Profile
