'use client'

import React from 'react'
import Home from '../pages/home'
import Profile from '../pages/profile'
import Settings from '../pages/settings'
import Test from '../pages/test'
import Practice from '../pages/practice'
import Blog from '../pages/blog'
import Careers from '../pages/careers'

interface MainBarProps {
  selectedPage: string
  setSelectedPage?: (page: any) => void
}

const MainBar: React.FC<MainBarProps> = ({ selectedPage, setSelectedPage }) => {
  return (
    <div className="w-full flex flex-col min-h-full">
      {/* Page Content View Container */}
      <div className="flex-1 p-2 sm:p-4 space-y-4 text-zinc-100">
        {selectedPage === 'home' && <Home />}
        {selectedPage === 'careers' && <Careers />}
        {selectedPage === 'profile' && <Profile />}
        {selectedPage === 'settings' && <Settings />}
        {selectedPage === 'tests' && <Test />}
        {selectedPage === 'practices' && <Practice />}
        {selectedPage === 'blog' && <Blog />}
      </div>
    </div>
  )
}

export default MainBar
