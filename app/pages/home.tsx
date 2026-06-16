'use client'
import React, { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, Check, X, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'

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

  const getCompletionStatusForDate = (date: Date) => {
    const today = new Date()
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const compareToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    if (compareDate > compareToday) {
      return 'future'
    }

    const dateString = formatDateString(date)
    const scheduleDoc = allSchedules.find(s => s.date === dateString)
    const completedCount = scheduleDoc?.completedTimes?.length || 0

    if (completedCount >= 3) {
      return 'green'
    } else if (completedCount === 2) {
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

  // Format date helper: YYYY-MM-DD
  const formatDateString = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Load schedule whenever selectedDate changes
  useEffect(() => {
    const fetchDateSchedule = async () => {
      setLoadingSchedule(true)
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
          const { completedTimes } = await res.json() as { completedTimes: string[] }
          const initialized = templateSchedule.map(item => ({
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
    const item = schedule[index]
    const dateString = formatDateString(selectedDate)

    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: dateString,
          time: item.time,
          completed: completed
        })
      })

      if (res.ok) {
        setSchedule((prev) =>
          prev.map((sItem, idx) =>
            idx === index ? { ...sItem, completed } : sItem
          )
        )
        fetchAllSchedules()
      } else {
        alert('Failed to update task completion in database')
      }
    } catch (err) {
      console.error('Error toggling schedule completion:', err)
      alert('Network error: Database connection offline')
    }
  }

  // Calendar grid construction
  const renderCalendarCells = () => {
    const cells = []
    const today = new Date()

    // Add empty spacer cells for prefix days
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="h-8 md:h-10" />)
    }

      // Add actual days of month
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
          colorClass = 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-400 shadow-md shadow-emerald-500/20 border border-emerald-500/20'
        } else if (status === 'yellow') {
          colorClass = 'bg-amber-500 text-black font-bold ring-2 ring-amber-400 shadow-md shadow-amber-500/20 border border-amber-500/20'
        } else if (status === 'red') {
          colorClass = 'bg-rose-600 text-white font-bold ring-2 ring-rose-400 shadow-md shadow-rose-500/20 border border-rose-500/20'
        } else {
          colorClass = 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20 border border-indigo-500/20'
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
          className={`h-8 w-8 md:h-10 md:w-10 text-xs font-semibold rounded-xl flex items-center justify-center transition-all cursor-pointer ${colorClass}`}
        >
          {day}
        </button>
      )
    }

    return cells
  }

  const completedCount = schedule.filter(item => item.completed).length
  const totalCount = schedule.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="p-6 text-zinc-100 min-h-screen animate-fade-in space-y-6">
      {/* Overview Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-900">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Timetable Logs</span>
          <h1 className="text-3xl font-black tracking-tight mt-0.5">Scheduler & History</h1>
          <p className="text-xs text-zinc-400 mt-1">Select dates on the calendar to track and update task checklist logs.</p>
        </div>

        {/* Completion Gauge */}
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4 w-full md:w-64">
          <div className="relative h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-full bg-zinc-800 border border-zinc-700">
            <span className="text-[10px] font-bold text-indigo-400">{progressPercent}%</span>
            <svg className="absolute -inset-0 h-full w-full rotate-270" viewBox="0 0 36 36">
              <path
                className="text-zinc-800"
                strokeWidth="2.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-500 transition-all duration-500"
                strokeWidth="2.5"
                strokeDasharray={`${progressPercent}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-200">Date Progress</h4>
            <p className="text-[10px] text-zinc-500 mt-0.5">{completedCount} of {totalCount} completed</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Calendar Module */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-5 border border-zinc-800 bg-zinc-900/10 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5 text-indigo-400" />
              Calendar
            </h3>
            
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <ChevronLeft size={16} />
              </button>
              <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Month Indicator */}
          <div className="text-center">
            <span className="text-xs font-bold text-zinc-200 tracking-wide">
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
          </div>

          {/* Calendar Table Grid */}
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>
            
            <div className="grid grid-cols-7 gap-1 justify-items-center">
              {renderCalendarCells()}
            </div>
          </div>

          {/* Selected Date Summary */}
          <div className="pt-3 border-t border-zinc-850 text-center">
            <p className="text-[10px] font-semibold text-zinc-500">
              Selected: <span className="text-indigo-400">{formatDateString(selectedDate)}</span> ({daysOfWeek[selectedDate.getDay()]})
            </p>
          </div>
        </div>

        {/* Right Side: Schedule Slot checklist */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
            Tasks Checklist ({daysOfWeek[selectedDate.getDay()]})
          </h3>

          {loadingSchedule ? (
            <div className="glass-card rounded-2xl p-10 text-center text-zinc-500 text-xs font-semibold flex items-center justify-center gap-2">
              <div className="h-4 w-4 rounded-full border border-zinc-800 border-t-zinc-500 animate-spin" />
              Syncing Schedule...
            </div>
          ) : schedule.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center flex flex-col items-center justify-center">
              <AlertCircle className="h-7 w-7 text-zinc-700 mb-2.5" />
              <p className="text-zinc-500 text-xs font-semibold">No slots allocated for {daysOfWeek[selectedDate.getDay()]}.</p>
            </div>
          ) : (
            schedule.map((item, index) => (
              <div
                key={index}
                className={`glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 transition-all duration-200 ${
                  item.completed
                    ? 'border-l-emerald-500 bg-emerald-950/5'
                    : 'border-l-indigo-500 bg-zinc-900/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-850 text-center min-w-[95px] flex-shrink-0">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider">
                      {item.partsofday}
                    </span>
                    <span className="text-xs font-semibold text-zinc-350 mt-1 block flex items-center justify-center gap-1.5">
                      <Clock className="h-3 w-3 text-zinc-500" />
                      {item.time}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-md font-bold text-zinc-200 mt-0.5">{item.subject}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
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
                      onClick={() => toggleComplete(index, true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-600/10 border border-emerald-500/20 cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Complete
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleComplete(index, false)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-750 text-zinc-350 transition-all border border-zinc-750 cursor-pointer"
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
