'use client'

import React, { useState, useEffect } from 'react'
import MarkdownRenderer from '../components/MarkdownRenderer'
import {
  Save,
  Plus,
  Trash2,
  FileText,
  Pencil,
  X,
  Download
} from 'lucide-react'

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

type SectionTab = 'profile' | 'timetable' | 'preferences' | 'data' | 'blogs'

const Settings = () => {
  // Navigation Section State
  const [activeSection, setActiveSection] = useState<SectionTab>('profile')

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

  // Blog management states
  const [blogsList, setBlogsList] = useState<any[]>([])
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false)
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null)
  const [blogTitle, setBlogTitle] = useState('')
  const [blogContent, setBlogContent] = useState('')
  const [blogAuthor, setBlogAuthor] = useState('')
  const [blogTags, setBlogTags] = useState('')
  const [isSavingBlog, setIsSavingBlog] = useState(false)
  const [activeEditorTab, setActiveEditorTab] = useState<'write' | 'preview'>('write')

  const [saveSuccess, setSaveSuccess] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
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
          const data = (await res.json()) as { templates: Timetable }
          setTimetableTemplates(data.templates || {})
        }
      } catch (err) {
        console.error('Error fetching timetable templates:', err)
      }
    }

    const fetchBlogs = async () => {
      try {
        const res = await fetch('/api/blogs')
        if (res.ok) {
          const data = await res.json()
          setBlogsList(data)
        }
      } catch (err) {
        console.error('Error fetching blogs in Settings:', err)
      }
    }

    fetchProfile()
    fetchTimetable()
    fetchBlogs()
  }, [])

  const handleSave = async () => {
    try {
      // 1. Save profile details
      const profileRes = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
          theme
        })
      })

      // 2. Save timetable template edits
      const timetableRes = await fetch('/api/timetable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templates: timetableTemplates
        })
      })

      if (profileRes.ok && timetableRes.ok) {
        setSaveSuccess(true)
        setFeedbackMessage('Settings saved successfully.')
        setTimeout(() => {
          setSaveSuccess(false)
          setFeedbackMessage('')
        }, 3000)
      } else {
        setFeedbackMessage('Failed to save settings to server.')
      }
    } catch (err) {
      console.error('Error saving settings:', err)
      setFeedbackMessage('Network connection error while saving.')
    }
  }

  // Timetable Slot Handlers
  const handleSlotChange = (day: string, index: number, field: keyof ScheduleItem, value: string) => {
    setTimetableTemplates((prev) => {
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

  const handleAddSlot = (day: string) => {
    setTimetableTemplates((prev) => {
      const daySlots = [...(prev[day] || [])]
      daySlots.push({
        time: '18:00 - 19:30',
        subject: 'New Task Subject',
        partsofday: 'Evening',
        completed: false,
        color: 'blue'
      })
      return {
        ...prev,
        [day]: daySlots
      }
    })
  }

  const handleDeleteSlot = (day: string, index: number) => {
    setTimetableTemplates((prev) => {
      const daySlots = [...(prev[day] || [])]
      daySlots.splice(index, 1)
      return {
        ...prev,
        [day]: daySlots
      }
    })
  }

  // Export JSON backup
  const handleExportData = () => {
    const backupData = {
      profile: { userName, userRole, userEmail, prepInternship, prepPlacement, prepGovt, theme },
      timetable: timetableTemplates,
      exportedAt: new Date().toISOString()
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `CareerOS_Backup_${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    setFeedbackMessage('Backup JSON downloaded successfully.')
    setTimeout(() => setFeedbackMessage(''), 3000)
  }

  // Blog Publishing Handlers
  const handleOpenNewBlogModal = () => {
    setEditingBlogId(null)
    setBlogTitle('')
    setBlogContent('')
    setBlogAuthor(userName || 'Dharmendra Pandit')
    setBlogTags('Guide, Career')
    setIsBlogModalOpen(true)
  }

  const handleOpenEditBlogModal = (blog: any) => {
    setEditingBlogId(blog._id)
    setBlogTitle(blog.title || '')
    setBlogContent(blog.content || '')
    setBlogAuthor(blog.author || userName)
    setBlogTags(blog.tags ? blog.tags.join(', ') : '')
    setIsBlogModalOpen(true)
  }

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!blogTitle.trim() || !blogContent.trim()) return

    setIsSavingBlog(true)
    const tagsArray = blogTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const payload = {
      title: blogTitle,
      content: blogContent,
      author: blogAuthor || userName,
      tags: tagsArray
    }

    try {
      const url = editingBlogId ? `/api/blogs/${editingBlogId}` : '/api/blogs'
      const method = editingBlogId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setIsBlogModalOpen(false)
        const updatedRes = await fetch('/api/blogs')
        if (updatedRes.ok) {
          const list = await updatedRes.json()
          setBlogsList(list)
        }
      } else {
        setFeedbackMessage('Failed to save blog post.')
      }
    } catch (err) {
      console.error('Error saving blog:', err)
      setFeedbackMessage('Error saving blog post.')
    } finally {
      setIsSavingBlog(false)
    }
  }

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this publication?')) return

    try {
      const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setBlogsList((prev) => prev.filter((b) => b._id !== id))
      }
    } catch (err) {
      console.error('Error deleting blog:', err)
    }
  }

  if (!isMounted) {
    return <div className="p-6 text-zinc-100 max-w-7xl mx-auto space-y-6" />
  }

  return (
    <div className="p-6 text-zinc-100 min-h-screen max-w-7xl mx-auto space-y-6 animate-fade-in relative">
      
      {/* Top Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-zinc-800/80 bg-gradient-to-r from-indigo-950/40 via-zinc-900/60 to-zinc-900/40 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 inline-block">
            Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">
            Account &amp; System Preferences
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-normal">
            Manage your personal profile, custom weekly timetables, study preferences, and published articles.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          {feedbackMessage && (
            <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-3 py-2 rounded-xl border border-indigo-500/20">
              {feedbackMessage}
            </span>
          )}

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 cursor-pointer border border-indigo-500/30"
          >
            <Save size={14} />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>

      {/* Main Settings Navigation & Content Layout */}
      <div className="grid lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Column: Section Tab Menu */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-3 border border-zinc-800/80 bg-zinc-900/40 space-y-1.5">
          <button
            onClick={() => setActiveSection('profile')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeSection === 'profile'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
            }`}
          >
            Personal Profile
          </button>

          <button
            onClick={() => setActiveSection('timetable')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeSection === 'timetable'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
            }`}
          >
            Weekly Timetable
          </button>

          <button
            onClick={() => setActiveSection('preferences')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeSection === 'preferences'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
            }`}
          >
            Preferences &amp; Alerts
          </button>

          <button
            onClick={() => setActiveSection('data')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeSection === 'data'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
            }`}
          >
            Data &amp; Backup
          </button>

          <button
            onClick={() => setActiveSection('blogs')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeSection === 'blogs'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
            }`}
          >
            Publications Manager
          </button>
        </div>

        {/* Right Column: Active Tab Content Panel */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* SECTION 1: PERSONAL PROFILE */}
          {activeSection === 'profile' && (
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-zinc-800/80 bg-zinc-900/40 space-y-6">
              <div className="border-b border-zinc-850 pb-4">
                <h2 className="text-base font-bold text-zinc-100">Personal Information</h2>
                <p className="text-xs text-zinc-400 font-normal">Update your display name, professional role, and contact email.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full text-xs font-semibold rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 p-3.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block mb-1.5">
                      Professional Role / Designation
                    </label>
                    <input
                      type="text"
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value)}
                      className="w-full text-xs font-semibold rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 p-3.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full text-xs font-semibold rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 p-3.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: WEEKLY TIMETABLE MANAGER */}
          {activeSection === 'timetable' && (
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-zinc-800/80 bg-zinc-900/40 space-y-6">
              <div className="border-b border-zinc-850 pb-4">
                <h2 className="text-base font-bold text-zinc-100">Weekly Timetable Configurator</h2>
                <p className="text-xs text-zinc-400 font-normal">Define time slots and study topics allocated for each day of the week.</p>
              </div>

              {/* Day Selection Tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-zinc-850">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setActiveDayTab(day)}
                    className={`px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeDayTab === day
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-zinc-950/60 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>

              {/* Active Day Timetable Slot List */}
              <div className="space-y-3 pt-2">
                {!timetableTemplates[activeDayTab] || timetableTemplates[activeDayTab].length === 0 ? (
                  <div className="text-center py-8 p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800">
                    <p className="text-xs text-zinc-400 font-medium">No study slots configured for {activeDayTab}.</p>
                  </div>
                ) : (
                  timetableTemplates[activeDayTab].map((slot, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 group relative">
                      <input
                        type="text"
                        value={slot.time}
                        onChange={(e) => handleSlotChange(activeDayTab, index, 'time', e.target.value)}
                        placeholder="08:00 - 12:00"
                        className="text-xs font-mono font-bold rounded-xl bg-zinc-900 border border-zinc-800 text-indigo-300 p-2.5 sm:w-1/4 focus:border-indigo-500 outline-none"
                      />

                      <input
                        type="text"
                        value={slot.subject}
                        onChange={(e) => handleSlotChange(activeDayTab, index, 'subject', e.target.value)}
                        placeholder="Subject Name"
                        className="text-xs font-bold rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 p-2.5 flex-grow focus:border-indigo-500 outline-none"
                      />

                      <select
                        value={slot.partsofday}
                        onChange={(e) => handleSlotChange(activeDayTab, index, 'partsofday', e.target.value)}
                        className="text-xs font-bold rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 p-2.5 sm:w-1/4 focus:border-indigo-500 outline-none cursor-pointer"
                      >
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Evening">Evening</option>
                        <option value="Night">Night</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleDeleteSlot(activeDayTab, index)}
                        className="p-2.5 bg-zinc-900 border border-zinc-800 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 rounded-xl transition-all cursor-pointer self-end sm:self-center"
                        title="Delete Slot"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}

                <button
                  type="button"
                  onClick={() => handleAddSlot(activeDayTab)}
                  className="w-full py-3 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 hover:bg-zinc-850 text-xs font-bold text-indigo-400 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                >
                  <Plus size={14} />
                  <span>Add Study Slot ({activeDayTab})</span>
                </button>
              </div>
            </div>
          )}

          {/* SECTION 3: PREFERENCES & ALERTS */}
          {activeSection === 'preferences' && (
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-zinc-800/80 bg-zinc-900/40 space-y-6">
              <div className="border-b border-zinc-850 pb-4">
                <h2 className="text-base font-bold text-zinc-100">Preferences &amp; Notification Targets</h2>
                <p className="text-xs text-zinc-400 font-normal">Configure preparation tracks, system theme, and alert notifications.</p>
              </div>

              {/* Theme Preference Selector */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Visual Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full text-xs font-bold rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-200 p-3.5 focus:border-indigo-500 outline-none cursor-pointer"
                >
                  <option value="Dark">Developer Dark (Default)</option>
                  <option value="System">System Match</option>
                  <option value="Light">Light Classic</option>
                </select>
              </div>

              {/* Preparation Goals Toggle Switches */}
              <div className="space-y-4 pt-2 border-t border-zinc-850">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Target Preparation Tracks</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800">
                    <div>
                      <span className="block text-xs font-bold text-zinc-200">Internship Preparation</span>
                      <span className="text-[11px] text-zinc-400 font-normal">Receive updates tailored for internship openings.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={prepInternship}
                      onChange={(e) => setPrepInternship(e.target.checked)}
                      className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800">
                    <div>
                      <span className="block text-xs font-bold text-zinc-200">Full-Time Placement</span>
                      <span className="text-[11px] text-zinc-400 font-normal">Include software engineering placement tracks.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={prepPlacement}
                      onChange={(e) => setPrepPlacement(e.target.checked)}
                      className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800">
                    <div>
                      <span className="block text-xs font-bold text-zinc-200">Government Exam Track</span>
                      <span className="text-[11px] text-zinc-400 font-normal">Include public sector technical notifications.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={prepGovt}
                      onChange={(e) => setPrepGovt(e.target.checked)}
                      className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: DATA & BACKUP */}
          {activeSection === 'data' && (
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-zinc-800/80 bg-zinc-900/40 space-y-6">
              <div className="border-b border-zinc-850 pb-4">
                <h2 className="text-base font-bold text-zinc-100">Data Management &amp; Backups</h2>
                <p className="text-xs text-zinc-400 font-normal">Export your configuration data or download local schedule backups.</p>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100">Export Complete Configuration</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Download a JSON backup containing profile and timetable settings.</p>
                  </div>

                  <button
                    onClick={handleExportData}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 cursor-pointer border border-indigo-500/30 flex-shrink-0"
                  >
                    <Download size={14} />
                    <span>Download JSON Backup</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: PUBLICATIONS & BLOGS MANAGER */}
          {activeSection === 'blogs' && (
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-zinc-800/80 bg-zinc-900/40 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
                <div>
                  <h2 className="text-base font-bold text-zinc-100">Publications &amp; Articles Manager</h2>
                  <p className="text-xs text-zinc-400 font-normal">Create, edit, or publish engineering articles to the Blog section.</p>
                </div>

                <button
                  onClick={handleOpenNewBlogModal}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 cursor-pointer border border-indigo-500/30"
                >
                  <Plus size={14} />
                  <span>Publish New Article</span>
                </button>
              </div>

              {/* Published Articles List */}
              <div className="space-y-3">
                {blogsList.length === 0 ? (
                  <div className="text-center py-10 p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800">
                    <FileText size={32} className="mx-auto text-zinc-600 mb-2" />
                    <p className="text-xs text-zinc-400 font-medium">No published articles found.</p>
                  </div>
                ) : (
                  blogsList.map((blog) => (
                    <div
                      key={blog._id}
                      className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-4"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-zinc-100">{blog.title}</h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5">Author: {blog.author} • {blog.reads || 0} reads • {blog.likes || 0} likes</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditBlogModal(blog)}
                          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-indigo-400 transition-colors cursor-pointer"
                          title="Edit Article"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(blog._id)}
                          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Article"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ARTICLE EDITOR MODAL */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-zinc-800/90 bg-zinc-950/95 max-w-3xl w-full space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
              <h3 className="text-base font-bold text-zinc-100">
                {editingBlogId ? 'Edit Article' : 'New Publication'}
              </h3>
              <button
                onClick={() => setIsBlogModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems Architecture & Rate Limiting"
                  className="w-full text-xs font-bold rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 p-3 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Author Name</label>
                  <input
                    type="text"
                    required
                    value={blogAuthor}
                    onChange={(e) => setBlogAuthor(e.target.value)}
                    className="w-full text-xs font-semibold rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 p-3 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Topic Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={blogTags}
                    onChange={(e) => setBlogTags(e.target.value)}
                    placeholder="React, Architecture, System Design"
                    className="w-full text-xs font-semibold rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 p-3 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Editor / Preview Tab Toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Content (Markdown Supported)</span>
                  <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setActiveEditorTab('write')}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                        activeEditorTab === 'write' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveEditorTab('preview')}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                        activeEditorTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Live Preview
                    </button>
                  </div>
                </div>

                {activeEditorTab === 'write' ? (
                  <textarea
                    rows={12}
                    required
                    value={blogContent}
                    onChange={(e) => setBlogContent(e.target.value)}
                    placeholder="# Article Heading&#10;&#10;Write your markdown content here..."
                    className="w-full text-xs font-mono rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 p-4 focus:border-indigo-500 outline-none resize-none leading-relaxed"
                  />
                ) : (
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 max-h-72 overflow-y-auto prose prose-invert max-w-none text-xs">
                    <MarkdownRenderer content={blogContent || '_Nothing to preview yet._'} />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setIsBlogModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingBlog}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {isSavingBlog ? 'Saving...' : editingBlogId ? 'Update Article' : 'Publish Article'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}

export default Settings
