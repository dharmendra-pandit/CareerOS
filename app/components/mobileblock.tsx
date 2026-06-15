'use client'
import { useState, useEffect } from 'react'

const MIN_WIDTH = 1024 // px — minimum desktop width required

export default function MobileBlock({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MIN_WIDTH)
    check()
    setMounted(true)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Avoid hydration flash — render children server-side, gate after mount
  if (!mounted) return <>{children}</>

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[9999] bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-8 text-center">
        {/* Animated grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-xs w-full space-y-7">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Text */}
          <div className="space-y-3">
            <h1 className="text-xl font-black tracking-tight text-zinc-100">
              Desktop Only
            </h1>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
              CareerOS is optimized for desktop and laptop screens. Please open this application on a device with a screen width of at least 1024px.
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-800/80" />

          {/* Current screen width info */}
          <ScreenWidthBadge />
        </div>
      </div>
    )
  }

  return <>{children}</>
}

function ScreenWidthBadge() {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const update = () => setWidth(window.innerWidth)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <div className="flex items-center justify-center gap-2">
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          Current width: {width}px
        </div>
        <span className="text-[10px] text-zinc-700 font-semibold">Requires 1024px minimum</span>
      </div>
    </div>
  )
}
