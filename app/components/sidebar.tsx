'use client'
import React from 'react'
import { 
  LayoutDashboard, 
  User, 
  BookOpen, 
  Award, 
  Settings, 
  LogOut 
} from 'lucide-react'

type Page = 'home' | 'profile' | 'practices' | 'tests' | 'settings'

interface SideBarProps {
  selectedPage?: string
  setSelectedPage: (page: Page) => void
  onLogout?: () => void
}

const SideBar: React.FC<SideBarProps> = ({ selectedPage = 'home', setSelectedPage, onLogout }) => {
  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'practices', label: 'Practices', icon: BookOpen },
    { id: 'tests', label: 'Tests', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const

  return (
    <div className="h-full flex flex-col justify-between p-6 text-zinc-300 select-none">
      <div>
        {/* Brand Header */}
        <div className="mb-8 px-2.5">
          <h2 className="text-lg font-black text-zinc-100 tracking-wide">CareerOS</h2>
          <span className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">Beta v1.4</span>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = selectedPage === item.id || (item.id === 'practices' && selectedPage === 'practices') || (item.id === 'tests' && selectedPage === 'tests')
            return (
              <button
                key={item.id}
                onClick={() => setSelectedPage(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-zinc-800/60 text-zinc-100 border border-zinc-700/50 shadow-inner shadow-black/10'
                    : 'hover:bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 border border-transparent'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-transform duration-200 ${
                  isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'
                }`} />
                {item.label}

                {/* Left Active Glow bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Footer Area */}
      <div className="space-y-4 pt-4 border-t border-zinc-900">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all duration-200 border border-transparent"
        >
          <LogOut className="h-4.5 w-4.5" />
          Logout
        </button>

        <div className="px-4 text-center">
          <p className="text-[10px] text-zinc-600 font-medium">© 2026 CareerOS</p>
        </div>
      </div>
    </div>
  )
}

export default SideBar
