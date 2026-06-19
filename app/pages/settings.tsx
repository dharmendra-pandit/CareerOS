'use client'
import React, { useState, useEffect } from 'react'
import { Sliders, Bell, Eye, ShieldAlert, Check, User, Save, Plus, Trash2 } from 'lucide-react'

interface ProfileData {
  name: string
  role: string
  email: string
  prepInternship: boolean
  prepPlacement: boolean
  prepGovt: boolean
  notifyDaily: boolean
  notifyWeekly: boolean
  notifyAlerts: boolean
  theme: string
}

interface ScheduleItem {
  time: string
  subject: string
  partsofday: string
  completed: boolean
  color: string
}

type Timetable = Record<string, ScheduleItem[]>



const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const Settings = () => {
  // Profile settings
  const [userName, setUserName] = useState('Dharmendra Pandit')
  const [userRole, setUserRole] = useState('Software Engineer')
  const [userEmail, setUserEmail] = useState('dharmendra193728@gmail.com')

  // Toggle preferences
  const [prepInternship, setPrepInternship] = useState(true)
  const [prepPlacement, setPrepPlacement] = useState(true)
  const [prepGovt, setPrepGovt] = useState(false)

  const [notifyDaily, setNotifyDaily] = useState(true)
  const [notifyWeekly, setNotifyWeekly] = useState(true)
  const [notifyAlerts, setNotifyAlerts] = useState(false)

  const [theme, setTheme] = useState('Dark')

  // Timetable templates
  const [timetableTemplates, setTimetableTemplates] = useState<Timetable>({})
  const [activeDayTab, setActiveDayTab] = useState('Monday')



  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // Fetch profile
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile')
        if (res.ok) {
          const data = (await res.json()) as ProfileData
          setUserName(data.name || 'Dharmendra Pandit')
          setUserRole(data.role || 'Software Engineer')
          setUserEmail(data.email || 'dharmendra193728@gmail.com')
          setPrepInternship(data.prepInternship ?? true)
          setPrepPlacement(data.prepPlacement ?? true)
          setPrepGovt(data.prepGovt ?? false)
          setNotifyDaily(data.notifyDaily ?? true)
          setNotifyWeekly(data.notifyWeekly ?? true)
          setNotifyAlerts(data.notifyAlerts ?? false)
          setTheme(data.theme || 'Dark')
        }
      } catch (err) {
        console.error('Error fetching settings profile:', err)
      }
    }

    // Fetch custom timetable templates
    const fetchTimetable = async () => {
      try {
        const res = await fetch('/api/timetable')
        if (res.ok) {
          const data = await res.json() as { templates: Timetable }
          setTimetableTemplates(data.templates || {})
        }
      } catch (err) {
        console.error('Error fetching timetable templates:', err)
      }
    }

    fetchProfile()
    fetchTimetable()
  }, [])

  const handleSave = async () => {
    try {
      // 1. Save profile details
      const profileRes = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userName,
          role: userRole,
          email: userEmail,
          prepInternship,
          prepPlacement,
          prepGovt,
          notifyDaily,
          notifyWeekly,
          notifyAlerts,
          theme,
        }),
      })

      // 2. Save timetable templates
      const timetableRes = await fetch('/api/timetable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templates: timetableTemplates }),
      })

      if (profileRes.ok && timetableRes.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)

        // Dispatch storage event to alert dashboard and other widgets
        window.dispatchEvent(new Event('storage'))
      } else {
        alert('Failed to save settings data to MongoDB')
      }
    } catch (err) {
      console.error('Error saving configurations:', err)
      alert('Network error: Database connection offline')
    }
  }

  // Edit Timetable actions
  const handleSlotChange = (day: string, index: number, field: keyof ScheduleItem, value: string) => {
    setTimetableTemplates(prev => {
      const daySlots = [...(prev[day] || [])]
      daySlots[index] = {
        ...daySlots[index],
        [field]: value
      }
      return {
        ...prev,
        [day]: daySlots
      }
    })
  }

  const handleDeleteSlot = (day: string, index: number) => {
    setTimetableTemplates(prev => {
      const daySlots = (prev[day] || []).filter((_, idx) => idx !== index)
      return {
        ...prev,
        [day]: daySlots
      }
    })
  }

  const handleAddSlot = (day: string) => {
    const newSlot: ScheduleItem = {
      time: '09:00 - 10:00',
      subject: 'New Study Task',
      partsofday: 'Morning',
      completed: false,
      color: '#6366f1'
    }

    setTimetableTemplates(prev => ({
      ...prev,
      [day]: [...(prev[day] || []), newSlot]
    }))
  }

  const handleResetProgress = async () => {
    if (confirm('Are you sure you want to reset all test scores and practice completion history in the database?')) {
      try {
        const response = await fetch('/api/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type: 'reset' }),
        })

        if (response.ok) {
          alert('Progress metrics reset completed.')
          window.dispatchEvent(new Event('storage'))
        }
      } catch (err) {
        console.error('Error resetting progress:', err)
        alert('Network error')
      }
    }
  }

  // Format YYYY-MM-DD to readable (e.g., June 15, 2026)
  const formatReadableDate = (dateStr: string) => {
    if (!dateStr || typeof dateStr !== 'string') return 'Unknown Date'
    const parts = dateStr.split('-')
    if (parts.length !== 3) return dateStr
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }



  if (!isMounted) {
    return <div className="min-h-screen bg-zinc-950" />
  }

  return (
    <div className="p-6 text-zinc-100 min-h-screen max-w-4xl mx-auto animate-fade-in space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-900">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Control Center</span>
          <h1 className="text-3xl font-black tracking-tight mt-0.5">Settings</h1>
          <p className="text-xs text-zinc-400 mt-1">Configure profile details, alert targets, custom weekly timetables, and logs history.</p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5 transition-all duration-200">
            <Check className="h-4 w-4" />
            Preferences updated
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Left Form: Personal details and preferences */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Profile Details Card */}
          <div className="glass-card rounded-2xl p-6 border border-zinc-800 bg-zinc-900/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <User size={16} />
              </div>
              <h2 className="text-sm font-bold text-zinc-200">Personal Profile</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl bg-zinc-950/60 border border-zinc-800 text-zinc-200 p-3.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1.5">Title / Role</label>
                  <input
                    type="text"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="w-full text-xs font-semibold rounded-xl bg-zinc-950/60 border border-zinc-800 text-zinc-200 p-3.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full text-xs font-semibold rounded-xl bg-zinc-950/60 border border-zinc-800 text-zinc-200 p-3.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Timetable Slot Editor Dashboard */}
          <div className="glass-card rounded-2xl p-6 border border-zinc-800 bg-zinc-900/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sliders size={16} />
              </div>
              <h2 className="text-sm font-bold text-zinc-200">Weekly Timetable Manager</h2>
            </div>

            {/* Timetable Tab Bar */}
            <div className="flex gap-1 overflow-x-auto pb-1 border-b border-zinc-850">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDayTab(day)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase flex-shrink-0 transition-all cursor-pointer ${
                    activeDayTab === day
                      ? 'bg-zinc-850 text-indigo-400 border border-zinc-800'
                      : 'text-zinc-500 hover:text-zinc-350'
                  }`}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>

            {/* Active Day Slots List */}
            <div className="space-y-3 pt-2">
              {!(timetableTemplates[activeDayTab]) || timetableTemplates[activeDayTab].length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-zinc-550 font-semibold">No timetable tasks configured for {activeDayTab}.</p>
                </div>
              ) : (
                timetableTemplates[activeDayTab].map((slot, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-850 group relative">
                    <input
                      type="text"
                      value={slot.time}
                      onChange={(e) => handleSlotChange(activeDayTab, index, 'time', e.target.value)}
                      placeholder="08:00 - 12:00"
                      className="text-[11px] font-mono font-bold rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-300 p-2 sm:w-1/4 focus:border-indigo-500 focus:ring-0"
                    />

                    <input
                      type="text"
                      value={slot.subject}
                      onChange={(e) => handleSlotChange(activeDayTab, index, 'subject', e.target.value)}
                      placeholder="Subject Name"
                      className="text-xs font-semibold rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-200 p-2 flex-grow focus:border-indigo-500 focus:ring-0"
                    />

                    <select
                      value={slot.partsofday}
                      onChange={(e) => handleSlotChange(activeDayTab, index, 'partsofday', e.target.value)}
                      className="text-xs font-semibold rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-350 p-2 sm:w-1/4 focus:border-indigo-500 focus:ring-0"
                    >
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Evening">Evening</option>
                      <option value="Night">Night</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(activeDayTab, index)}
                      className="p-2 bg-zinc-900 border border-zinc-850 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 rounded-lg transition-all self-end sm:self-center cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}

              <button
                type="button"
                onClick={() => handleAddSlot(activeDayTab)}
                className="w-full py-2.5 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/20 hover:bg-zinc-900 text-xs font-bold text-zinc-450 hover:text-zinc-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-1"
              >
                <Plus size={13} /> Add Study Slot
              </button>
            </div>
          </div>
        </div>

        {/* Right Form: Preferences and History Logs */}
        <div className="space-y-6">
          {/* Visual Theme Selector */}
          <div className="glass-card rounded-2xl p-6 border border-zinc-800 bg-zinc-900/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Eye size={16} />
              </div>
              <h2 className="text-sm font-bold text-zinc-200">Theme Preference</h2>
            </div>

            <div className="space-y-1">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl bg-zinc-950/60 border border-zinc-800 text-zinc-300 p-3.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all cursor-pointer"
                aria-label="Visual Theme"
              >
                <option value="System">System Match</option>
                <option value="Light">Light Classic</option>
                <option value="Dark">Developer Dark</option>
              </select>
            </div>
          </div>



          {/* Reset Metrics */}
          <div className="glass-card rounded-2xl p-6 border border-zinc-800 bg-zinc-900/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-450 border border-rose-500/20">
                <ShieldAlert size={16} />
              </div>
              <h2 className="text-sm font-bold text-zinc-200">Data Management</h2>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => alert('Progress data exported to CareerOS_Backup.json')}
                className="w-full border border-zinc-800 bg-zinc-950/20 hover:bg-zinc-800/80 px-4 py-3 rounded-xl text-xs font-bold text-zinc-300 transition-all text-center cursor-pointer"
              >
                Export Progress
              </button>

              <button
                onClick={handleResetProgress}
                className="w-full border border-rose-950/60 bg-rose-500/5 hover:bg-rose-500/10 hover:border-rose-900/50 px-4 py-3 rounded-xl text-xs font-bold text-rose-455 transition-all text-center cursor-pointer"
              >
                Reset Progress Stats
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button Footer bar */}
      <div className="pt-4 border-t border-zinc-900 flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/15 border border-indigo-500/20 cursor-pointer"
        >
          <Save size={14} />
          Save Changes
        </button>
      </div>
    </div>
  )
}

export default Settings
