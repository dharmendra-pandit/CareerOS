'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react'

interface Question {
  id: number
  question: string
  options: string[]
  correctOption: number
  explanation: string
}

const roadmaps = [
  {
    title: 'AI & ML',
    topics: [
      'Python', 'Maths', 'NumPy', 'Pandas', 'Visualization', 
      'ML', 'Scikit-Learn', 'SQL', 'Deep Learning', 'NLP', 
      'GenAI', 'Computer Vision', 'MLOps'
    ]
  },
  {
    title: 'DevOps',
    topics: [
      'Linux', 'Networking', 'Git/GitHub', 'Docker', 'CI/CD', 
      'AWS', 'Nginx', 'Databases', 'Kubernetes', 'Terraform', 
      'Monitoring', 'Security'
    ]
  },
  {
    title: 'Basic DSA',
    topics: [
      'Time & Space Complexity', 'Arrays & 2D Arrays', 'Strings', 
      'Python Collections (List, Set, Dict, deque, Counter, heapq)', 
      'Sorting Algorithms', 'Recursion', 'Backtracking', 
      'Divide & Conquer', 'OOP', 'Linked Lists', 'Stacks & Queues', 
      'Binary Trees', 'Binary Search Trees (BST)'
    ]
  },
  {
    title: 'Advanced DSA',
    topics: [
      'Heaps (Priority Queue)', 'HashMaps & HashSets', 'Greedy Algorithms', 
      'Graphs', 'Dynamic Programming', 'Tries', 'Segment Trees'
    ]
  },
  {
    title: 'Core MERN',
    topics: [
      'HTML', 'CSS', 'JavaScript', 'React.js', 'Node.js', 
      'Express.js', 'MongoDB', 'Mongoose', 'REST APIs', 
      'Authentication', 'Deployment'
    ]
  },
  {
    title: 'Advanced MERN',
    topics: [
      'React Query', 'Redux Toolkit', 'Next.js', 'WebSockets', 
      'Docker', 'AWS', 'CI/CD', 'Microservices', 'System Design'
    ]
  },
  {
    title: 'General',
    topics: [
      'Aptitude', 'English/Verbal Ability', 'Logical Reasoning'
    ]
  }
]

const Practice = () => {
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`
  }

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [showDifficultyScreen, setShowDifficultyScreen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])

  // CBT Exam State Management
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({}) // qId -> optionIndex
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({}) // qId -> boolean
  const [visitedQuestions, setVisitedQuestions] = useState<Record<number, boolean>>({}) // qId -> boolean
  const [isFinished, setIsFinished] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // User Stats
  const [stats, setStats] = useState({ practiceCount: 0, avgAccuracy: 0, history: [] as any[] })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch('/api/progress')
        if (res.ok) {
          const data = await res.json()
          const history = data.history || []
          const practices = history.filter((h: any) => h.type === 'practice')
          const avgAcc = practices.length > 0
            ? Math.round((practices.reduce((acc: number, cur: any) => acc + (cur.score / (cur.total || 20)), 0) / practices.length) * 100)
            : 0
          setStats({
            practiceCount: data.practiceCount || 0,
            avgAccuracy: avgAcc,
            history: practices.reverse()
          })
        }
      } catch (err) {
        console.error('Error loading progress stats:', err)
      }
    }
    loadStats()
  }, [])

  // Timer Effect
  useEffect(() => {
    if (questions.length > 0 && !isFinished && !loading) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current)
            handleFinishQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [questions, isFinished, loading])

  // Track Visited Question
  useEffect(() => {
    if (questions.length > 0 && questions[currentQuestionIdx]) {
      const qId = questions[currentQuestionIdx].id
      setVisitedQuestions((prev) => ({ ...prev, [qId]: true }))
    }
  }, [currentQuestionIdx, questions])

  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic)
    setShowDifficultyScreen(true)
  }

  const handleSelectDifficulty = async (difficulty: string) => {
    setSelectedDifficulty(difficulty)
    setLoading(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'practice',
          topic: selectedTopic,
          difficulty: difficulty.toLowerCase(),
          timestamp: Date.now()
        })
      })

      const data = await res.json()
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions)
      } else {
        setQuestions([])
      }
    } catch (err) {
      console.error('Error fetching questions:', err)
    } finally {
      setLoading(false)
      setCurrentQuestionIdx(0)
      setSelectedAnswers({})
      setMarkedForReview({})
      setVisitedQuestions({})
      setIsFinished(false)
      setShowSubmitModal(false)
      setTimeLeft(900)
    }
  }

  const handleOptionSelect = (qId: number, optionIdx: number) => {
    if (isFinished) return
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx
    }))
  }

  const handleClearResponse = () => {
    if (questions[currentQuestionIdx]) {
      const qId = questions[currentQuestionIdx].id
      setSelectedAnswers((prev) => {
        const next = { ...prev }
        delete next[qId]
        return next
      })
    }
  }

  const handleMarkForReview = () => {
    if (questions[currentQuestionIdx]) {
      const qId = questions[currentQuestionIdx].id
      setMarkedForReview((prev) => ({
        ...prev,
        [qId]: !prev[qId]
      }))
      if (currentQuestionIdx < questions.length - 1) {
        setCurrentQuestionIdx((prev) => prev + 1)
      }
    }
  }

  const handleSaveAndNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1)
    }
  }

  const handleFinishQuiz = async () => {
    setIsFinished(true)
    setShowSubmitModal(false)
    if (timerRef.current) clearInterval(timerRef.current)

    let score = 0
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctOption) {
        score += 1
      }
    })

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          score,
          total: questions.length,
          difficulty: selectedDifficulty,
          type: 'practice'
        })
      })

      const res = await fetch('/api/progress')
      if (res.ok) {
        const data = await res.json()
        const history = data.history || []
        const practices = history.filter((h: any) => h.type === 'practice')
        const avgAcc = practices.length > 0
          ? Math.round((practices.reduce((acc: number, cur: any) => acc + (cur.score / (cur.total || 20)), 0) / practices.length) * 100)
          : 0
        setStats({
          practiceCount: data.practiceCount || 0,
          avgAccuracy: avgAcc,
          history: practices.reverse()
        })
      }
    } catch (err) {
      console.error('Error saving progress:', err)
    }
  }

  const handleReset = () => {
    setSelectedTopic(null)
    setSelectedDifficulty(null)
    setShowDifficultyScreen(false)
    setQuestions([])
    setIsFinished(false)
    setShowSubmitModal(false)
    setSelectedAnswers({})
    setMarkedForReview({})
    setVisitedQuestions({})
    setCurrentQuestionIdx(0)
  }

  if (loading) {
    return (
      <div className="p-6 text-zinc-100 min-h-screen max-w-7xl mx-auto flex flex-col items-center justify-center space-y-4 animate-fade-in font-mono">
        <div className="w-10 h-10 border-2 border-zinc-800 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          INITIALIZING COMPUTER-BASED ASSESSMENT SYSTEM...
        </p>
      </div>
    )
  }

  // Active Formal Examination CBT Screen
  if (questions.length > 0) {
    const currentQ = questions[currentQuestionIdx]
    const answeredCount = Object.keys(selectedAnswers).length
    const reviewCount = Object.values(markedForReview).filter(Boolean).length
    const notVisitedCount = questions.length - Object.keys(visitedQuestions).length
    const notAnsweredCount = questions.length - answeredCount

    let calculatedScore = 0
    if (isFinished) {
      questions.forEach((q) => {
        if (selectedAnswers[q.id] === q.correctOption) {
          calculatedScore += 1
        }
      })
    }

    return (
      <div className="p-4 sm:p-6 text-zinc-100 min-h-screen max-w-7xl mx-auto space-y-4 animate-fade-in font-sans">
        
        {/* Formal Examination Paper Header */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase bg-indigo-950 text-indigo-300 border border-indigo-800">
                OFFICIAL CBT PAPER
              </span>
              <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase">
                CODE: EXAM-2026-{selectedTopic?.toUpperCase()}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-zinc-100">
              NATIONAL TECHNICAL ASSESSMENT • {selectedTopic} ({selectedDifficulty})
            </h1>
          </div>

          {/* Clock Timer */}
          <div className="flex items-center gap-4 self-end md:self-auto">
            <div className="text-right bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl font-mono">
              <span className="text-[9px] uppercase font-bold text-zinc-500 block tracking-wider">TIME REMAINING</span>
              <span className="text-base sm:text-lg font-black text-emerald-400 tracking-wider">
                {formatTime(timeLeft)}
              </span>
            </div>

            {!isFinished && (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold font-mono uppercase bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                SUBMIT TEST
              </button>
            )}
          </div>
        </div>

        {/* Finished Result Screen */}
        {isFinished ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-xl">
            <div className="space-y-2 border-b border-zinc-850 pb-6">
              <span className="text-[10px] font-bold font-mono uppercase px-3 py-1 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                EXAMINATION EVALUATION COMPLETE
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-100 uppercase tracking-tight">
                FINAL SCORE: {calculatedScore} / {questions.length}
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                OVERALL PERCENTAGE ACCURACY: {Math.round((calculatedScore / questions.length) * 100)}%
              </p>
            </div>

            {/* Answer Sheet Table */}
            <div className="space-y-4 text-left">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                OFFICIAL QUESTION EVALUATION SHEET
              </h3>

              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const userAns = selectedAnswers[q.id]
                  const isCorrect = userAns === q.correctOption

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border space-y-2 text-xs font-sans ${
                        isCorrect
                          ? 'bg-emerald-950/20 border-emerald-800/60'
                          : 'bg-rose-950/20 border-rose-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-zinc-200">
                          Q{idx + 1}. {q.question}
                        </span>
                        <span
                          className={`text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded flex-shrink-0 ${
                            isCorrect ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isCorrect ? 'CORRECT' : 'INCORRECT'}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] font-mono">
                        <p className="text-zinc-400">
                          SELECTED OPTION:{' '}
                          <span className={isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {userAns !== undefined ? `${String.fromCharCode(65 + userAns)}. ${q.options[userAns]}` : 'NOT ANSWERED'}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-zinc-400">
                            CORRECT OPTION:{' '}
                            <span className="text-emerald-400 font-bold">{String.fromCharCode(65 + q.correctOption)}. {q.options[q.correctOption]}</span>
                          </p>
                        )}
                        <p className="text-zinc-400 pt-1 font-sans text-xs font-normal leading-relaxed">
                          EXPLANATION: {q.explanation}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-850">
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-xl text-xs font-bold font-mono uppercase bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                RETURN TO EXAMINATION DIRECTORY
              </button>
            </div>
          </div>
        ) : (
          /* CBT Dual-Pane Examination Layout */
          <div className="grid lg:grid-cols-4 gap-4 items-start">
            
            {/* Main Question Paper Area (3 Columns) */}
            <div className="lg:col-span-3 bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl flex flex-col justify-between min-h-[500px]">
              
              <div className="space-y-5">
                {/* Question Info Header */}
                <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                  <span className="text-xs font-bold font-mono uppercase text-indigo-400">
                    QUESTION NO. {currentQuestionIdx + 1} OF {questions.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded">
                      SINGLE CHOICE (+1.0 MARKS, 0.0 NEGATIVE)
                    </span>
                  </div>
                </div>

                {/* Formal Question Text */}
                <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
                  <p className="text-sm sm:text-base font-bold text-zinc-100 leading-relaxed">
                    {currentQ.question}
                  </p>
                </div>

                {/* Multiple Choice Radio Options */}
                <div className="space-y-3">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[currentQ.id] === optIdx
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleOptionSelect(currentQ.id, optIdx)}
                        className={`w-full text-left p-4 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer border flex items-center gap-3 ${
                          isSelected
                            ? 'bg-indigo-950/60 border-indigo-500 text-white font-bold shadow-md'
                            : 'bg-zinc-900/40 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold font-mono flex-shrink-0 ${
                            isSelected ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-zinc-700 text-zinc-500'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <span className="leading-relaxed flex-1">{opt}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Bottom Examination Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-850 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMarkForReview}
                    className={`px-4 py-2 rounded-xl font-bold uppercase transition-all cursor-pointer border ${
                      markedForReview[currentQ.id]
                        ? 'bg-purple-950 text-purple-300 border-purple-800'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-850'
                    }`}
                  >
                    {markedForReview[currentQ.id] ? 'UNMARK REVIEW' : 'MARK FOR REVIEW & NEXT'}
                  </button>

                  <button
                    onClick={handleClearResponse}
                    className="px-4 py-2 rounded-xl font-bold uppercase bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-all cursor-pointer"
                  >
                    CLEAR RESPONSE
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentQuestionIdx === 0}
                    onClick={() => setCurrentQuestionIdx((prev) => prev - 1)}
                    className={`px-4 py-2 rounded-xl font-bold uppercase transition-all cursor-pointer border ${
                      currentQuestionIdx === 0
                        ? 'bg-zinc-900 text-zinc-700 border-zinc-850 cursor-not-allowed opacity-40'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-850'
                    }`}
                  >
                    PREVIOUS
                  </button>

                  <button
                    onClick={handleSaveAndNext}
                    className="px-5 py-2 rounded-xl font-bold uppercase bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
                  >
                    SAVE &amp; NEXT
                  </button>
                </div>
              </div>

            </div>

            {/* Question Palette Sidebar (1 Column) */}
            <div className="lg:col-span-1 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-4 shadow-xl font-mono">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block tracking-wider border-b border-zinc-850 pb-2">
                QUESTION PALETTE
              </span>

              {/* Status Legend */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-600 inline-block" />
                  <span className="text-zinc-300">ANSWERED ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-600 inline-block" />
                  <span className="text-zinc-300">NOT ANSWERED ({notAnsweredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-purple-600 inline-block" />
                  <span className="text-zinc-300">REVIEW ({reviewCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-zinc-800 inline-block" />
                  <span className="text-zinc-300">NOT VISITED ({notVisitedCount})</span>
                </div>
              </div>

              {/* Number Grid Selector */}
              <div className="pt-2 border-t border-zinc-850">
                <span className="text-[9px] uppercase font-bold text-zinc-500 block mb-2">CHOOSE A QUESTION</span>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const qId = q.id
                    const isAns = selectedAnswers[qId] !== undefined
                    const isRev = markedForReview[qId]
                    const isVis = visitedQuestions[qId]
                    const isCurr = idx === currentQuestionIdx

                    let colorClass = 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    if (isAns) colorClass = 'bg-emerald-600 border-emerald-500 text-white font-bold'
                    else if (isRev) colorClass = 'bg-purple-600 border-purple-500 text-white font-bold'
                    else if (isVis) colorClass = 'bg-amber-600 border-amber-500 text-white font-bold'

                    return (
                      <button
                        key={qId}
                        onClick={() => setCurrentQuestionIdx(idx)}
                        className={`h-9 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center justify-center ${colorClass} ${
                          isCurr ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-zinc-950 scale-105' : ''
                        }`}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-850">
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold uppercase bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  SUBMIT FINAL PAPER
                </button>
              </div>

            </div>

          </div>
        )}

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl font-sans">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 tracking-wider">
                  SUBMISSION CONFIRMATION
                </span>
                <h3 className="text-lg font-bold text-zinc-100">
                  Submit Examination Paper?
                </h3>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-2 text-xs font-mono text-zinc-300">
                <div className="flex justify-between py-1 border-b border-zinc-850">
                  <span>Total Questions:</span>
                  <span className="font-bold text-zinc-100">{questions.length}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-850">
                  <span>Answered:</span>
                  <span className="font-bold text-emerald-400">{answeredCount}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-850">
                  <span>Marked for Review:</span>
                  <span className="font-bold text-purple-400">{reviewCount}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Unanswered:</span>
                  <span className="font-bold text-amber-400">{notAnsweredCount}</span>
                </div>
              </div>

              <p className="text-xs text-zinc-400">
                Are you sure you want to finish and submit your examination paper?
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-850 cursor-pointer"
                >
                  CONTINUE TEST
                </button>
                <button
                  onClick={handleFinishQuiz}
                  className="px-5 py-2 rounded-xl text-xs font-bold font-mono uppercase bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  CONFIRM SUBMIT
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    )
  }

  // Difficulty Selection Screen
  if (showDifficultyScreen && selectedTopic) {
    return (
      <div className="p-6 text-zinc-100 min-h-screen max-w-4xl mx-auto space-y-6 animate-fade-in font-sans">
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-zinc-850 pb-4">
            <button
              onClick={() => setShowDifficultyScreen(false)}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-indigo-400 tracking-wider">
                SELECTED SUBJECT: {selectedTopic}
              </span>
              <h2 className="text-lg font-bold text-zinc-100 mt-0.5">
                SELECT EXAMINATION LEVEL
              </h2>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {['Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => handleSelectDifficulty(diff)}
                className="bg-zinc-900/60 rounded-2xl p-6 border border-zinc-800 hover:border-indigo-500/50 text-left transition-all duration-200 cursor-pointer space-y-2 group"
              >
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 block">
                  {diff} LEVEL
                </span>
                <h3 className="text-base font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors">
                  {diff === 'Easy' ? 'FOUNDATIONAL' : diff === 'Medium' ? 'APPLIED ENGINE' : 'ADVANCED HARD'}
                </h3>
                <p className="text-[11px] text-zinc-400 font-normal leading-relaxed">
                  {diff === 'Easy'
                    ? '20 foundational questions to verify syntax and logic.'
                    : diff === 'Medium'
                    ? '20 real-world scenario questions and core algorithms.'
                    : '20 high-complexity optimization and architecture questions.'}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Topic Selection Main Dashboard View
  return (
    <div className="p-6 text-zinc-100 min-h-screen max-w-7xl mx-auto space-y-6 animate-fade-in relative font-sans">
      
      {/* Top Banner */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl z-10">
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-950 border border-indigo-800 text-indigo-300 inline-block">
            COMPUTER-BASED EXAMINATION ENGINE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100 uppercase">
            TECHNICAL PRACTICE DIRECTORY
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-normal">
            Select a subject domain to launch the formal computer-based examination interface.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-zinc-900/80 p-3.5 rounded-2xl border border-zinc-800 font-mono z-10">
          <div className="px-4 py-2 border-r border-zinc-850">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">PAPERS LOGGED</span>
            <span className="text-lg font-black text-indigo-400 mt-0.5 block">{stats.practiceCount}</span>
          </div>
          <div className="px-4 py-2">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">AVG ACCURACY</span>
            <span className="text-lg font-black text-emerald-400 mt-0.5 block">{stats.avgAccuracy}%</span>
          </div>
        </div>
      </div>

      {/* Roadmaps Grid */}
      <div className="space-y-6">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
          EXAMINATION SUBJECT DIRECTORY
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roadmaps.map((map, idx) => (
            <div
              key={idx}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between shadow-xl"
            >
              <div className="space-y-3">
                <div className="border-b border-zinc-850 pb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 block">
                    ROADMAP MODULE
                  </span>
                  <h3 className="text-base font-bold text-zinc-100 mt-0.5">{map.title}</h3>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {map.topics.map((t) => (
                    <button
                      key={t}
                      onClick={() => handleSelectTopic(t)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 border border-zinc-800 hover:border-indigo-500 text-zinc-300 hover:text-indigo-300 transition-all cursor-pointer"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default Practice
