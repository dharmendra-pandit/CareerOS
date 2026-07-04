'use client'
import React, { useState, useEffect } from 'react'
import { 
  Code2, 
  Database, 
  Cpu, 
  Brain, 
  Cloud, 
  Calculator, 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Sliders,
  ChevronRight,
  ChevronLeft,
  Clock,
  Zap,
  Award,
  TrendingUp,
  BookOpen,
  HelpCircle,
  Check
} from 'lucide-react'

interface Question {
  id: number
  question: string
  options: string[]
  correctOption: number
  explanation: string
}

interface GenerationResponse {
  questions: Question[]
  isAI: boolean
  error?: boolean
}

const roadmaps = [
  {
    title: 'AI & ML',
    icon: <Brain size={20} />,
    topics: [
      'Python', 'Maths', 'NumPy', 'Pandas', 'Visualization', 
      'ML', 'Scikit-Learn', 'SQL', 'Deep Learning', 'NLP', 
      'GenAI', 'Computer Vision', 'MLOps'
    ]
  },
  {
    title: 'DevOps',
    icon: <Cloud size={20} />,
    topics: [
      'Linux', 'Networking', 'Git/GitHub', 'Docker', 'CI/CD', 
      'AWS', 'Nginx', 'Databases', 'Kubernetes', 'Terraform', 
      'Monitoring', 'Security'
    ]
  },
  {
    title: 'Basic DSA',
    icon: <Code2 size={20} />,
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
    icon: <Cpu size={20} />,
    topics: [
      'Heaps (Priority Queue)', 'HashMaps & HashSets', 'Greedy Algorithms', 
      'Graphs', 'Dynamic Programming', 'Tries', 'Segment Trees'
    ]
  },
  {
    title: 'Core MERN',
    icon: <Database size={20} />,
    topics: [
      'HTML', 'CSS', 'JavaScript', 'React.js', 'Node.js', 
      'Express.js', 'MongoDB', 'Mongoose', 'REST APIs', 
      'Authentication', 'Deployment'
    ]
  },
  {
    title: 'Advanced MERN',
    icon: <Sliders size={20} />,
    topics: [
      'React Query', 'Redux Toolkit', 'Next.js', 'WebSockets', 
      'Docker', 'AWS', 'CI/CD', 'Microservices', 'System Design'
    ]
  },
  {
    title: 'General',
    icon: <Calculator size={20} />,
    topics: [
      'Aptitude', 'English/Verbal Ability', 'Logical Reasoning'
    ]
  }
]

const Practice = () => {
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min}:${sec < 10 ? '0' : ''}${sec}`
  }

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [showDifficultyScreen, setShowDifficultyScreen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isAI, setIsAI] = useState(false)
  
  // Navigation & Timer states
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({}) // questionId -> selectedIndex
  const [isFinished, setIsFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)

  // Overall user stats
  const [stats, setStats] = useState({ practiceCount: 0, avgAccuracy: 0, history: [] as any[] })

  // Load progress history on mount
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
  }, [selectedTopic, isFinished])

  // Timer logic for Practice Arena
  useEffect(() => {
    if (selectedTopic && questions.length > 0 && !isFinished && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            submitPractice()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [selectedTopic, questions, isFinished, timeLeft])

  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic)
    setShowDifficultyScreen(true)
  }

  const handleStartPractice = async (difficulty: string) => {
    setSelectedDifficulty(difficulty)
    setShowDifficultyScreen(false)
    setLoading(true)
    setQuestions([])
    setCurrentQuestionIdx(0)
    setSelectedAnswers({})
    setTimeLeft(900)
    setIsFinished(false)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'practice',
          topic: selectedTopic,
          difficulty,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate practice questions')
      }

      const data = (await response.json()) as GenerationResponse
      setQuestions(data.questions)
      setIsAI(data.isAI)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectOption = (optionIndex: number) => {
    const qId = questions[currentQuestionIdx].id
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIndex }))
  }

  const submitPractice = async () => {
    setIsFinished(true)
    if (timerRef.current) clearInterval(timerRef.current)

    let score = 0
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctOption) {
        score++
      }
    })
    const total = questions.length

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type: 'practice',
          topic: selectedTopic,
          difficulty: selectedDifficulty,
          score,
          total
        }),
      })
      window.dispatchEvent(new Event('storage'))
    } catch (err) {
      console.error('Error saving practice progress:', err)
    }
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctOption) {
        correct++
      }
    })
    return correct
  }

  const resetArena = () => {
    setSelectedTopic(null)
    setSelectedDifficulty(null)
    setShowDifficultyScreen(false)
    setQuestions([])
    setIsFinished(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen text-zinc-100 flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="text-center max-w-md space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
            <Brain className="absolute inset-0 m-auto h-8 w-8 text-indigo-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight">Generating Arena</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Synthesizing exactly 20 premium questions on <span className="text-indigo-400 font-semibold">{selectedTopic}</span> ({selectedDifficulty} level) using DeepSeek AI models...
            </p>
          </div>
          <div className="w-full bg-zinc-900 border border-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-2/3 rounded-full animate-infinite-scroll" />
          </div>
        </div>
      </div>
    )
  }

  // Difficulty Selection Screen
  if (showDifficultyScreen && selectedTopic) {
    const levels = [
      { id: 'easy', label: 'Easy Target', desc: 'Focuses on syntax basics and simple key terms', icon: <Zap className="text-amber-400" size={24} /> },
      { id: 'medium', label: 'Medium Target', desc: 'Practical implementation, algorithmic branches, and logical loops', icon: <Cpu className="text-indigo-400" size={24} /> },
      { id: 'hard', label: 'Hard Target', desc: 'Deep compiler optimization, scale patterns, and memory complexity', icon: <Brain className="text-rose-400" size={24} /> },
    ]

    return (
      <div className="min-h-screen text-zinc-100 p-6 max-w-2xl mx-auto flex flex-col justify-center animate-fade-in">
        <button
          onClick={resetArena}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Arena
        </button>

        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">Aptitude & Skill Quiz</span>
          <h1 className="text-2xl font-black mt-3">Select Difficulty - {selectedTopic}</h1>
          <p className="text-xs text-zinc-400 mt-1">Choose a target difficulty matching your expertise to begin.</p>
        </div>

        <div className="space-y-4">
          {levels.map(lvl => (
            <button
              key={lvl.id}
              onClick={() => handleStartPractice(lvl.id)}
              className="w-full glass-card text-left rounded-2xl p-5 border border-zinc-800/80 hover:border-indigo-500 bg-zinc-900/40 hover:bg-zinc-800/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-zinc-950/65 border border-zinc-800 group-hover:border-indigo-500/30 transition-all">
                  {lvl.icon}
                </div>
                <div>
                  <h3 className="font-bold text-zinc-200 text-sm group-hover:text-indigo-400 transition-colors">{lvl.label}</h3>
                  <p className="text-xs text-zinc-450 mt-1 font-medium leading-relaxed max-w-md">{lvl.desc}</p>
                </div>
              </div>
              <ChevronRight className="text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" size={18} />
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Quiz active/completed dashboard
  if (selectedTopic && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIdx]
    const qId = currentQuestion.id
    const hasChosen = selectedAnswers[qId] !== undefined
    const userChoice = selectedAnswers[qId]

    if (isFinished) {
      const score = calculateScore()
      const total = questions.length
      const percentage = Math.round((score / total) * 100)

      return (
        <div className="min-h-screen text-zinc-100 p-6 max-w-5xl mx-auto animate-fade-in space-y-6">
          {/* Results summary header */}
          <div className="glass-card rounded-3xl p-8 border border-zinc-800 bg-zinc-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
            
            <div className="relative z-10 text-center space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">Practice Completed</span>
              <h1 className="text-3xl font-black mt-2 bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">Assessment Performance</h1>
              <p className="text-zinc-400 text-xs mt-1">Topic: <span className="text-zinc-200 font-semibold">{selectedTopic}</span> ({selectedDifficulty} Level)</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
                <div className="bg-zinc-950/60 rounded-2xl p-5 border border-zinc-850 flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Correct Answers</span>
                  <p className="text-3xl font-black text-zinc-100 mt-2">{score} <span className="text-zinc-500 text-sm">/ {total}</span></p>
                </div>
                <div className="bg-zinc-950/60 rounded-2xl p-5 border border-zinc-850 flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Overall Accuracy</span>
                  <p className="text-3xl font-black text-indigo-400 mt-2">{percentage}%</p>
                </div>
                <div className="bg-zinc-950/60 rounded-2xl p-5 border border-zinc-850 flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Hiring Match</span>
                  <p className={`text-3xl font-black mt-2 ${percentage >= 80 ? 'text-emerald-400' : percentage >= 60 ? 'text-amber-400' : 'text-zinc-400'}`}>
                    {percentage >= 80 ? 'Optimal' : percentage >= 60 ? 'Competitive' : 'Practice'}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-center gap-3">
                <button
                  onClick={() => handleStartPractice(selectedDifficulty!)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs transition-all border border-indigo-500/20 cursor-pointer shadow-lg shadow-indigo-600/10"
                >
                  <RefreshCw className="h-4 w-4" />
                  Practice Again
                </button>
                <button
                  onClick={resetArena}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-bold text-xs transition-all border border-zinc-800 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Return to Arena
                </button>
              </div>
            </div>
          </div>

          {/* Deep-dive Questions Review list */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1 flex items-center gap-2">
              <BookOpen size={14} /> Questions Review & Explanation ({questions.length})
            </h3>
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const uAns = selectedAnswers[q.id]
                const isCorrect = uAns === q.correctOption
                const hasSkipped = uAns === undefined

                return (
                  <div key={q.id} className={`glass-card rounded-2xl p-6 border ${isCorrect ? 'border-emerald-500/20 bg-emerald-950/5' : hasSkipped ? 'border-zinc-800 bg-zinc-900/10' : 'border-rose-500/20 bg-rose-950/5'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="font-bold text-sm text-zinc-200 leading-relaxed">{idx + 1}. {q.question}</h4>
                      {isCorrect ? (
                        <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle className="h-3.5 w-3.5" /> Correct
                        </span>
                      ) : hasSkipped ? (
                        <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-full border border-zinc-700">
                          Skipped
                        </span>
                      ) : (
                        <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                          <XCircle className="h-3.5 w-3.5" /> Incorrect
                        </span>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 mt-5">
                      {q.options.map((opt, oIdx) => {
                        const isCorrectOpt = oIdx === q.correctOption
                        const isUserChoice = oIdx === uAns
                        
                        let optStyle = 'bg-zinc-950/30 text-zinc-400 border border-zinc-850'
                        if (isCorrectOpt) optStyle = 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold'
                        else if (isUserChoice) optStyle = 'bg-rose-500/10 text-rose-300 border border-rose-500/30 font-semibold'

                        const optLabel = String.fromCharCode(65 + oIdx) // A, B, C, D

                        return (
                          <div key={oIdx} className={`px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-3 transition-all ${optStyle}`}>
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isCorrectOpt ? 'bg-emerald-500/25 text-emerald-300' : isUserChoice ? 'bg-rose-500/25 text-rose-300' : 'bg-zinc-800 text-zinc-550'
                            }`}>{optLabel}</span>
                            <span>{opt}</span>
                          </div>
                        )
                      })}
                    </div>

                    {q.explanation && (
                      <div className="mt-4 pt-4 border-t border-zinc-850 text-xs text-zinc-400 leading-relaxed bg-zinc-950/20 p-4 rounded-xl">
                        <span className="font-bold text-zinc-300 flex items-center gap-1.5 mb-1.5">
                          <HelpCircle size={14} className="text-indigo-400" /> Explanation
                        </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )
    }

    // Dynamic timer coloring & alert states
    let timerBadgeColor = 'text-emerald-450 bg-emerald-500/10 border-emerald-550/20'
    if (timeLeft < 180) { // < 3 mins
      timerBadgeColor = 'text-amber-450 bg-amber-500/10 border-amber-500/20 animate-pulse'
    }
    if (timeLeft < 60) { // < 1 min
      timerBadgeColor = 'text-rose-450 bg-rose-500/15 border-rose-500/30 animate-pulse font-black'
    }

    return (
      <div className="min-h-screen text-zinc-100 p-6 max-w-7xl mx-auto animate-fade-in flex flex-col space-y-6">
        {/* Navigation Indicator & Quit trigger */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4 flex-shrink-0">
          <button
            onClick={resetArena}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-all font-bold cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Quit Practice
          </button>
          
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors duration-300 ${timerBadgeColor}`}>
              <Clock className="h-3.5 w-3.5" />
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full uppercase tracking-wider">
              {selectedTopic} • {selectedDifficulty}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: 1-20 Question Navigation & Stats */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="glass-card rounded-2xl p-5 border border-zinc-850 bg-zinc-900/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Question List</span>
                <span className="text-[10px] font-semibold text-indigo-400">
                  {Object.keys(selectedAnswers).length} / {questions.length} Answered
                </span>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const uChoice = selectedAnswers[q.id]
                  const isCurrent = currentQuestionIdx === idx
                  
                  let statusStyle = 'bg-zinc-950/40 border-zinc-850 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                  if (isCurrent) {
                    statusStyle = 'border-indigo-500 text-indigo-400 bg-indigo-500/10 font-bold shadow-md shadow-indigo-500/5'
                  } else if (uChoice !== undefined) {
                    statusStyle = 'bg-indigo-650 text-white border-indigo-600 shadow-sm shadow-indigo-650/10'
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIdx(idx)}
                      className={`w-10 h-10 text-xs font-bold rounded-xl border flex items-center justify-center transition-all cursor-pointer ${statusStyle}`}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-850 flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-md bg-indigo-600" /> Answered
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-md border border-indigo-500 bg-indigo-500/10" /> Active
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-md bg-zinc-950/40 border border-zinc-850" /> Empty
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Question Panel */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-card rounded-2xl p-6 md:p-8 border border-zinc-800 bg-zinc-900/10 min-h-[380px] flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-550 tracking-wider">Question {currentQuestionIdx + 1} of {questions.length}</span>
                <h2 className="text-base font-bold text-zinc-150 leading-relaxed mt-3">{currentQuestion.question}</h2>

                <div className="space-y-3 mt-6">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = userChoice === index
                    const optionLetter = String.fromCharCode(65 + index) // A, B, C, D

                    let cardStyle = 'bg-zinc-950/35 hover:bg-zinc-900/60 border-zinc-850 text-zinc-355 hover:text-zinc-200'
                    if (isSelected) {
                      cardStyle = 'bg-indigo-500/10 border-indigo-500 text-indigo-300 font-bold shadow-md shadow-indigo-500/5'
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleSelectOption(index)}
                        className={`w-full text-left px-5 py-4 rounded-xl text-xs font-semibold border transition-all flex items-center gap-4 group cursor-pointer ${cardStyle}`}
                      >
                        <span className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center text-[10px] font-extrabold border transition-all ${
                          isSelected ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-zinc-900 text-zinc-500 border-zinc-800 group-hover:border-zinc-700'
                        }`}>{optionLetter}</span>
                        <span className="flex-1">{option}</span>
                        {isSelected && <Check size={14} className="text-indigo-400" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Next/Prev Navigation bars & Submit Practice button */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-900">
                <div className="flex gap-2">
                  <button
                    onClick={() => currentQuestionIdx > 0 && setCurrentQuestionIdx(prev => prev - 1)}
                    disabled={currentQuestionIdx === 0}
                    className={`px-4 py-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                      currentQuestionIdx > 0 
                        ? 'bg-zinc-950/50 border-zinc-800 hover:bg-zinc-850 text-zinc-450 hover:text-zinc-205 cursor-pointer' 
                        : 'border-zinc-855 text-zinc-700 cursor-not-allowed'
                    }`}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <button
                    onClick={() => currentQuestionIdx < questions.length - 1 && setCurrentQuestionIdx(prev => prev + 1)}
                    disabled={currentQuestionIdx === questions.length - 1}
                    className={`px-4 py-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                      currentQuestionIdx < questions.length - 1 
                        ? 'bg-zinc-950/50 border-zinc-800 hover:bg-zinc-850 text-zinc-450 hover:text-zinc-205 cursor-pointer' 
                        : 'border-zinc-855 text-zinc-700 cursor-not-allowed'
                    }`}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>

                <button
                  onClick={submitPractice}
                  className="px-6 py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all border border-indigo-500/20 cursor-pointer shadow-lg shadow-indigo-650/10 hover:shadow-indigo-600/20"
                >
                  Submit Practice
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Landing Categories Grid
  return (
    <div className="p-6 text-zinc-100 min-h-screen animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">Skill Testing</span>
          <h1 className="text-3xl font-black tracking-tight mt-2.5 bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">Practice Arena</h1>
          <p className="text-zinc-450 text-xs mt-1.5 max-w-xl">
            Select standard core modules to generate cost-optimized MCQ tests of 20 questions mapping to actual assessment frameworks.
          </p>
        </div>
      </div>

      {/* Stats Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-zinc-850 bg-zinc-900/10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-zinc-550 tracking-wider">Completed Practices</span>
            <p className="text-xl font-black text-zinc-200 mt-1">{stats.practiceCount} Attempts</p>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-zinc-850 bg-zinc-900/10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-zinc-550 tracking-wider">Average Score</span>
            <p className="text-xl font-black text-emerald-400 mt-1">{stats.avgAccuracy}% Accuracy</p>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-zinc-850 bg-zinc-900/10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Cpu size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-zinc-550 tracking-wider">Performance Index</span>
            <p className="text-xl font-black text-purple-400 mt-1">
              {stats.avgAccuracy >= 85 ? 'Grandmaster' : stats.avgAccuracy >= 70 ? 'Expert' : stats.avgAccuracy >= 50 ? 'Specialist' : 'Learner'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Categories Section */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        {roadmaps.map((roadmap) => (
          <div
            key={roadmap.title}
            className="glass-card rounded-2xl p-6 border border-zinc-800/80 bg-zinc-900/5 flex flex-col justify-between hover:border-zinc-700/60 hover:shadow-lg transition-all duration-300 group"
          >
            <div>
              <div className="flex items-center gap-3.5 mb-5">
                <div className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 group-hover:border-indigo-500/40 group-hover:bg-indigo-500/20 transition-all duration-300">
                  {roadmap.icon}
                </div>
                <div>
                  <h2 className="text-md font-bold tracking-tight text-zinc-200">{roadmap.title}</h2>
                  <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest">
                    {roadmap.topics.length} Subjects
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-y-3 gap-x-2 pb-2">
                {roadmap.topics.map((topic, tIdx) => (
                  <React.Fragment key={topic}>
                    <button
                      onClick={() => handleSelectTopic(topic)}
                      className="text-left px-3.5 py-2 rounded-xl border border-zinc-850 bg-zinc-950/20 hover:bg-indigo-650 hover:border-indigo-550 hover:shadow-sm text-[11px] font-semibold text-zinc-400 hover:text-white transition-all cursor-pointer hover:-translate-y-0.5 duration-200"
                    >
                      {topic}
                    </button>
                    {tIdx < roadmap.topics.length - 1 && (
                      <ChevronRight size={12} className="text-zinc-800 flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Practice
