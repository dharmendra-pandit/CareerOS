'use client'
import React, { useState, useEffect } from 'react'
import MainBar from './components/mainbar'
import SideBar from './components/sidebar'


const Page = () => {
  const [selectedPage, setSelectedPage] = useState('home')
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('career_os_auth_session') === 'true'
  })
  const isMounted = React.useSyncExternalStore(
    () => () => { },
    () => true,
    () => false
  )

  // Auth gate flow states
  const [step, setStep] = useState<'code' | 'pass'>('code')
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState({ code: 0, pass: 0 })
  const [isLocked, setIsLocked] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked) return
    setError('')

    try {
      const payload = step === 'code'
        ? { step, code: inputValue }
        : { step, password: inputValue }

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Authentication request failed')

      const data = await res.json() as { success: boolean; error?: string }

      if (data.success) {
        if (step === 'code') {
          setStep('pass')
          setInputValue('')
        } else {
          localStorage.setItem('career_os_auth_session', 'true')
          setIsAuthenticated(true)
          setInputValue('')
        }
      } else {
        const nextAttempts = attempts[step] + 1
        setAttempts(prev => ({ ...prev, [step]: nextAttempts }))

        if (nextAttempts >= 3) {
          setIsLocked(true)
          setInputValue('')
        } else {
          const remaining = 3 - nextAttempts
          setError(`Incorrect. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`)
          setInputValue('')
        }
      }
    } catch (err) {
      console.error('Authentication error:', err)
      setError('Auth server connection failure')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('career_os_auth_session')
    setIsAuthenticated(false)
    setStep('code')
    setInputValue('')
    setError('')
    setAttempts({ code: 0, pass: 0 })
    setIsLocked(false)
  }

  if (!isMounted) {
    return <div className="h-screen w-full bg-zinc-950" />
  }

  // Permanent lockout screen
  if (!isAuthenticated && isLocked) {
    return (
      <div className="h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 animate-fade-in">
        <div className="glass-card rounded-3xl p-10 border border-rose-500/20 max-w-sm w-full space-y-6 shadow-2xl shadow-rose-500/5 bg-zinc-900/40 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-black text-zinc-100 tracking-tight">Access Locked</h2>
            <p className="text-[11px] text-zinc-400 mt-2.5 leading-relaxed font-medium max-w-xs mx-auto">
              You have exceeded the maximum of 3 attempts. This session has been permanently locked for security.
            </p>
            <div className="mt-4 flex gap-1.5 justify-center">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/60" />
              ))}
            </div>
            <p className="text-[10px] text-zinc-600 mt-4 font-semibold uppercase tracking-widest">
              Contact the administrator to regain access
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    const currentAttempts = attempts[step]

    return (
      <div className="h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 animate-fade-in">
        <form
          onSubmit={handleVerify}
          className="glass-card rounded-3xl p-8 border border-zinc-800/80 max-w-sm w-full space-y-6 shadow-2xl shadow-indigo-500/5 bg-zinc-900/40"
        >
          <div className="text-center">
            <h2 className="text-lg font-bold tracking-tight text-zinc-100">CareerOS Access Gate</h2>
            <p className="text-[11px] text-zinc-400 mt-1.5 font-medium leading-relaxed">
              {step === 'code'
                ? 'Enter the 6-digit entry code'
                : 'Entry code verified. Enter access passcode'
              }
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              maxLength={6}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ''))}
              placeholder={step === 'code' ? '000000' : '******'}
              className="w-full text-center text-xl tracking-[0.4em] font-black rounded-xl bg-zinc-950/60 border border-zinc-800 text-zinc-100 p-3.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-700 placeholder:tracking-normal placeholder:font-medium"
              autoFocus
            />

            {/* Attempt dot indicators */}
            <div className="flex items-center justify-center gap-2">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i < currentAttempts
                    ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                    : 'bg-zinc-800 border border-zinc-700'
                    }`}
                />
              ))}
              {currentAttempts > 0 && (
                <span className="text-[10px] text-zinc-500 font-semibold ml-1.5">
                  {3 - currentAttempts} left
                </span>
              )}
            </div>

            {error && (
              <p className="text-center text-xs font-semibold text-rose-400 animate-fade-in">{error}</p>
            )}

            <button
              type="submit"
              disabled={inputValue.length < 6}
              className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all border ${inputValue.length === 6
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/20 shadow-md shadow-indigo-600/10 cursor-pointer'
                : 'bg-zinc-900 text-zinc-650 border-zinc-800/80 cursor-not-allowed'
                }`}
            >
              Verify &amp; Proceed
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="flex w-full h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Sidebar container with fixed width and separator */}
      <aside className="w-64 md:w-72 h-full flex-shrink-0 border-r border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md">
        <SideBar
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
          onLogout={handleLogout}
        />
      </aside>

      {/* Main content area with scroll container */}
      <main className="flex-1 h-full overflow-y-auto bg-zinc-950/90">
        <div className="max-w-7xl mx-auto h-full">
          <MainBar selectedPage={selectedPage} />
        </div>
      </main>
    </div>
  )
}

export default Page
