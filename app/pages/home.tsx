'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  AlertCircle
} from 'lucide-react'

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

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const Home = () => {
  // Date states
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  // Schedule states
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [loadingSchedule, setLoadingSchedule] = useState(false)
  const [allSchedules, setAllSchedules] = useState<{ date: string; completedTimes: string[] }[]>([])
  const [errorMessage, setErrorMessage] = useState('')

  // Format date helper: YYYY-MM-DD
  const formatDateString = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const fetchAllSchedules = async () => {
    try {
      const res = await fetch('/api/schedule?all=true')
      if (res.ok) {
        const data = await res.json()
        setAllSchedules(data.schedules || [])
      }
    } catch (err) {
      console.error('Error fetching all schedules:', err)
    }
  }

  useEffect(() => {
    fetchAllSchedules()
  }, [])

  // Calculate Streak & Highest Streak
  const streakMetrics = useMemo(() => {
    if (!allSchedules || allSchedules.length === 0) {
      return { currentStreak: 0, highestStreak: 0, totalDaysLogged: 0 }
    }

    // Filter documents with a valid YYYY-MM-DD date string & at least 1 completed task
    const activeDates = Array.from(
      new Set(
        allSchedules
          .filter(
            (s) =>
              s &&
              typeof s.date === 'string' &&
              s.date.trim() !== '' &&
              s.completedTimes &&
              Array.isArray(s.completedTimes) &&
              s.completedTimes.length > 0
          )
          .map((s) => s.date.trim())
      )
    )
      .filter((d) => typeof d === 'string' && d.includes('-'))
      .sort()

    if (activeDates.length === 0) {
      return { currentStreak: 0, highestStreak: 0, totalDaysLogged: 0 }
    }

    let highestStreak = 0
    let tempStreak = 0
    let lastDate: Date | null = null

    activeDates.forEach((dateStr) => {
      if (!dateStr || typeof dateStr !== 'string') return
      const parts = dateStr.split('-').map(Number)
      if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) return

      const currentDate = new Date(parts[0], parts[1] - 1, parts[2])

      if (!lastDate) {
        tempStreak = 1
      } else {
        const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24))
        if (diffDays === 1) {
          tempStreak += 1
        } else {
          tempStreak = 1
        }
      }

      if (tempStreak > highestStreak) {
        highestStreak = tempStreak
      }
      lastDate = currentDate
    })

    // Calculate current streak relative to today/yesterday
    const today = new Date()
    const todayStr = formatDateString(today)
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)
    const yesterdayStr = formatDateString(yesterday)

    let currentStreak = 0
    const hasToday = activeDates.includes(todayStr)
    const hasYesterday = activeDates.includes(yesterdayStr)

    if (hasToday || hasYesterday) {
      const startCheckDate = hasToday ? today : yesterday
      let checkDate = new Date(startCheckDate)
      while (true) {
        const checkStr = formatDateString(checkDate)
        if (activeDates.includes(checkStr)) {
          currentStreak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          break
        }
      }
    }

    return {
      currentStreak,
      highestStreak,
      totalDaysLogged: activeDates.length
    }
  }, [allSchedules])

  const getCompletionStatusForDate = (date: Date) => {
    const today = new Date()
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const compareToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    if (compareDate > compareToday) {
      return 'future'
    }

    const dateString = formatDateString(date)
    const scheduleDoc = allSchedules.find((s) => s.date === dateString)
    const completedCount = scheduleDoc?.completedTimes?.length || 0

    if (completedCount >= 3) {
      return 'green'
    } else if (completedCount >= 1) {
      return 'yellow'
    } else {
      return 'red'
    }
  }

  // Calendar calculations
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month, 1).getDay()
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDayIndex = getFirstDayOfMonth(currentMonth)

  // Handle month navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // Load schedule whenever selectedDate changes
  useEffect(() => {
    const fetchDateSchedule = async () => {
      setLoadingSchedule(true)
      setErrorMessage('')
      const dateString = formatDateString(selectedDate)
      const dayName = daysOfWeek[selectedDate.getDay()]

      try {
        const templateRes = await fetch('/api/timetable')
        let templateSchedule: ScheduleItem[] = []
        if (templateRes.ok) {
          const tData = await templateRes.json()
          templateSchedule = (tData.templates as Timetable)[dayName] || []
        }

        const res = await fetch(`/api/schedule?date=${dateString}`)
        if (res.ok) {
          const { completedTimes } = (await res.json()) as { completedTimes: string[] }
          const initialized = templateSchedule.map((item) => ({
            ...item,
            completed: completedTimes.includes(item.time)
          }))
          setSchedule(initialized)
        } else {
          setSchedule(templateSchedule)
        }
      } catch (err) {
        console.error('Error fetching schedule completions:', err)
        setSchedule([])
      } finally {
        setLoadingSchedule(false)
      }
    }

    fetchDateSchedule()
  }, [selectedDate])

  const toggleComplete = async (index: number, completed: boolean) => {
    const today = new Date()
    const isTodaySelected =
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()

    if (!isTodaySelected) return

    const item = schedule[index]
    const dateString = formatDateString(selectedDate)

    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: dateString,
          time: item.time,
          completed: completed
        })
      })

      if (res.ok) {
        setSchedule((prev) =>
          prev.map((sItem, idx) => (idx === index ? { ...sItem, completed } : sItem))
        )
        fetchAllSchedules()
      } else {
        setErrorMessage('Could not save completion status.')
      }
    } catch (err) {
      console.error('Error toggling schedule completion:', err)
      setErrorMessage('Network connection error.')
    }
  }

  // Calendar grid construction
  const renderCalendarCells = () => {
    const cells = []
    const today = new Date()

    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="h-8 md:h-10" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const isSelected =
        cellDate.getDate() === selectedDate.getDate() &&
        cellDate.getMonth() === selectedDate.getMonth() &&
        cellDate.getFullYear() === selectedDate.getFullYear()

      const isToday =
        cellDate.getDate() === today.getDate() &&
        cellDate.getMonth() === today.getMonth() &&
        cellDate.getFullYear() === today.getFullYear()

      const status = getCompletionStatusForDate(cellDate)

      let colorClass = ''
      if (isSelected) {
        if (status === 'green') {
          colorClass = 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-400 shadow-md border border-emerald-500/20'
        } else if (status === 'yellow') {
          colorClass = 'bg-amber-500 text-black font-bold ring-2 ring-amber-400 shadow-md border border-amber-500/20'
        } else if (status === 'red') {
          colorClass = 'bg-rose-600 text-white font-bold ring-2 ring-rose-400 shadow-md border border-rose-500/20'
        } else {
          colorClass = 'bg-indigo-600 text-white font-bold shadow-md border border-indigo-500/20'
        }
      } else {
        if (status === 'green') {
          colorClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold hover:bg-emerald-500/20'
        } else if (status === 'yellow') {
          colorClass = 'bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold hover:bg-amber-500/20'
        } else if (status === 'red') {
          colorClass = 'bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold hover:bg-rose-500/20'
        } else {
          colorClass = isToday
            ? 'bg-zinc-800 text-indigo-400 border border-indigo-500/20 font-bold'
            : 'hover:bg-zinc-900/60 text-zinc-300'
        }
      }

      cells.push(
        <button
          key={day}
          onClick={() => setSelectedDate(cellDate)}
          className={`h-8 w-8 md:h-10 md:w-10 text-xs font-semibold rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${colorClass}`}
        >
          <span>{day}</span>
          {isToday && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-500" />
          )}
        </button>
      )
    }

    return cells
  }

  const completedCount = schedule.filter((item) => item.completed).length
  const totalCount = schedule.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const today = new Date()
  const isTodaySelected =
    selectedDate.getDate() === today.getDate() &&
    selectedDate.getMonth() === today.getMonth() &&
    selectedDate.getFullYear() === today.getFullYear()

  return (
    <div className="p-6 text-zinc-100 min-h-screen max-w-7xl mx-auto space-y-6 animate-fade-in relative">
      
      {/* Clean Dashboard Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-zinc-800/80 bg-gradient-to-r from-indigo-950/40 via-zinc-900/60 to-zinc-900/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-1.5 max-w-xl">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 inline-block">
              Productivity Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">
              Study Scheduler &amp; Streak Metrics
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-normal">
              Track daily timetable completions and view all-time study streak history.
            </p>
          </div>

          {/* Clean Metric Cards Grid (Highest Streak, Current Streak, Active Days, Today's Score) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800/80 backdrop-blur-md">
            
            {/* Highest Streak */}
            <div className="px-3 py-1.5 border-r border-zinc-850">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Highest Streak</span>
              <span className="text-lg font-black text-amber-400 mt-0.5 block">{streakMetrics.highestStreak} Days</span>
            </div>

            {/* Current Streak */}
            <div className="px-3 py-1.5 border-r border-zinc-850">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Current Streak</span>
              <span className="text-lg font-black text-indigo-400 mt-0.5 block">{streakMetrics.currentStreak} Days</span>
            </div>

            {/* Total Days Logged */}
            <div className="px-3 py-1.5 border-r border-zinc-850">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Days Logged</span>
              <span className="text-lg font-black text-emerald-400 mt-0.5 block">{streakMetrics.totalDaysLogged}</span>
            </div>

            {/* Today's Completed */}
            <div className="px-3 py-1.5">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Today Completed</span>
              <span className="text-lg font-black text-zinc-100 mt-0.5 block">{completedCount}/{totalCount} ({progressPercent}%)</span>
            </div>

          </div>

        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Calendar Module */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-5 border border-zinc-800/80 bg-zinc-900/40 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Calendar Navigator
            </h3>
            
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button onClick={nextMonth} className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="text-center">
            <span className="text-xs font-bold text-zinc-100 tracking-wide">
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>
            
            <div className="grid grid-cols-7 gap-1 justify-items-center">
              {renderCalendarCells()}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-850 text-center">
            <p className="text-[11px] font-medium text-zinc-400">
              Selected: <span className="text-indigo-400 font-bold">{formatDateString(selectedDate)}</span> ({daysOfWeek[selectedDate.getDay()]})
            </p>
          </div>
        </div>

        {/* Right Column: Schedule Task Checklist */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Tasks Checklist ({daysOfWeek[selectedDate.getDay()]})
            </h3>
            {isTodaySelected && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full">
                Today
              </span>
            )}
          </div>

          {errorMessage && (
            <div className="glass-card rounded-2xl p-4 bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 font-medium">
              {errorMessage}
            </div>
          )}

          {!isTodaySelected && (
            <div className="glass-card rounded-2xl p-4 bg-amber-500/5 border border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-400 font-medium">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>Task completion logging is active for current day. Select Today to check off items.</span>
            </div>
          )}

          {loadingSchedule ? (
            <div className="glass-card rounded-2xl p-10 text-center text-zinc-500 text-xs font-semibold flex items-center justify-center gap-2">
              <div className="h-4 w-4 rounded-full border border-zinc-800 border-t-indigo-500 animate-spin" />
              Syncing Timetable Tasks...
            </div>
          ) : schedule.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-2">
              <AlertCircle className="h-8 w-8 text-zinc-700" />
              <p className="text-zinc-400 text-xs font-bold">No tasks allocated for {daysOfWeek[selectedDate.getDay()]}.</p>
              <p className="text-zinc-500 text-[11px]">Configure study slots in Settings to populate your schedule.</p>
            </div>
          ) : (
            schedule.map((item, index) => (
              <div
                key={index}
                className={`glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 transition-all duration-300 ${
                  item.completed
                    ? 'border-l-emerald-500 bg-emerald-950/10 border-zinc-800/80'
                    : 'border-l-indigo-500 bg-zinc-900/40 border-zinc-800/80 hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-center min-w-[95px] flex-shrink-0">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider">
                      {item.partsofday}
                    </span>
                    <span className="text-xs font-bold text-zinc-300 mt-1 block">
                      {item.time}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 mt-0.5">{item.subject}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          item.completed
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}
                      >
                        {item.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!item.completed ? (
                    <button
                      disabled={!isTodaySelected}
                      onClick={() => toggleComplete(index, true)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isTodaySelected
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/20 shadow-md shadow-emerald-600/20'
                          : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed opacity-40'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Complete
                    </button>
                  ) : (
                    <button
                      disabled={!isTodaySelected}
                      onClick={() => toggleComplete(index, false)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isTodaySelected
                          ? 'bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border-zinc-750'
                          : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed opacity-40'
                      }`}
                    >
                      <X className="h-3.5 w-3.5" />
                      Undo
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}

export default Home
