'use client'
import React from 'react'
import Image from 'next/image'
import { 
  LayoutDashboard, 
  User, 
  BookOpen, 
  Award, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

type Page = 'home' | 'profile' | 'practices' | 'tests' | 'settings'

interface SideBarProps {
  selectedPage?: string
  setSelectedPage: (page: Page) => void
  onLogout?: () => void
  isCollapsed?: boolean
  setIsCollapsed?: (collapsed: boolean) => void
}

const SideBar: React.FC<SideBarProps> = ({ 
  selectedPage = 'home', 
  setSelectedPage, 
  onLogout,
  isCollapsed = false,
  setIsCollapsed
}) => {
  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'practices', label: 'Practices', icon: BookOpen },
    { id: 'tests', label: 'Tests', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const

  return (
    <div className={`h-full flex flex-col justify-between text-zinc-300 select-none transition-all duration-300 relative ${
      isCollapsed ? 'py-6 px-3' : 'p-6'
    }`}>
      {/* Collapse/Expand Toggle Button sitting on the border */}
      <button
        onClick={() => setIsCollapsed?.(!isCollapsed)}
        className="absolute top-7 -right-3 h-6 w-6 rounded-full bg-zinc-950 border border-zinc-800 hover:border-indigo-500/50 text-zinc-400 hover:text-indigo-400 hover:shadow-[0_0_10px_rgba(99,102,241,0.35)] transition-all duration-300 flex items-center justify-center z-50 cursor-pointer group shadow-lg shadow-black/40"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight size={12} className="transition-transform group-hover:scale-110" />
        ) : (
          <ChevronLeft size={12} className="transition-transform group-hover:scale-110" />
        )}
      </button>

      <div>
        {/* Brand Header */}
        <div className={`mb-8 flex items-center transition-all duration-300 ${
          isCollapsed ? 'justify-center' : 'px-2.5'
        }`}>
          <div className="flex items-center gap-3">
            <div className="relative h-7 w-7 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900 flex-shrink-0">
              <Image
                src="/careeros.png"
                alt="CareerOS Logo"
                fill
                className="object-cover"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col animate-fade-in">
                <h2 className="text-lg font-black text-zinc-100 tracking-wide leading-none">CareerOS</h2>
                <span className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase mt-1">Beta v1.4</span>
              </div>
            )}
          </div>
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
                className={`w-full flex items-center rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isCollapsed ? 'justify-center p-3' : 'gap-3.5 px-4 py-3'
                } ${
                  isActive
                    ? 'bg-zinc-800/60 text-zinc-100 border border-zinc-700/50 shadow-inner shadow-black/10'
                    : 'hover:bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 border border-transparent'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`h-4.5 w-4.5 transition-transform duration-200 flex-shrink-0 ${
                  isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'
                }`} />
                
                {!isCollapsed && (
                  <span className="animate-fade-in truncate">{item.label}</span>
                )}

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
          className={`w-full flex items-center rounded-xl text-sm font-medium text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all duration-200 border border-transparent cursor-pointer ${
            isCollapsed ? 'justify-center p-3' : 'gap-3.5 px-4 py-2.5'
          }`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4.5 w-4.5 flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Logout</span>}
        </button>

        {!isCollapsed && (
          <div className="px-4 text-center animate-fade-in">
            <p className="text-[10px] text-zinc-600 font-medium">© 2026 CareerOS</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SideBar
