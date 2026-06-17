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
  Clock
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
    colorClass: 'indigo',
    borderColor: 'hover:border-indigo-500/50',
    glowColor: 'hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]',
    iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    pillClass: 'bg-indigo-500/5 hover:bg-indigo-600 border-indigo-500/10 hover:border-indigo-400 text-indigo-200',
    topics: [
      'Python', 'Maths', 'NumPy', 'Pandas', 'Visualization', 
      'ML', 'Scikit-Learn', 'SQL', 'Deep Learning', 'NLP', 
      'GenAI', 'Computer Vision', 'MLOps', 'Projects'
    ]
  },
  {
    title: 'DevOps',
    icon: <Cloud size={20} />,
    colorClass: 'sky',
    borderColor: 'hover:border-sky-500/50',
    glowColor: 'hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]',
    iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    pillClass: 'bg-sky-500/5 hover:bg-sky-600 border-sky-500/10 hover:border-sky-400 text-sky-200',
    topics: [
      'Linux', 'Networking', 'Git/GitHub', 'Docker', 'CI/CD', 
      'AWS', 'Nginx', 'Databases', 'Kubernetes', 'Terraform', 
      'Monitoring', 'Security', 'Projects'
    ]
  },
  {
    title: 'DSA Basic',
    icon: <Code2 size={20} />,
    colorClass: 'emerald',
    borderColor: 'hover:border-emerald-500/50',
    glowColor: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pillClass: 'bg-emerald-500/5 hover:bg-emerald-600 border-emerald-500/10 hover:border-emerald-400 text-emerald-200',
    topics: [
      'Time & Space Complexity', 'Arrays & 2D Arrays', 'Strings', 
      'Python Collections (List, Set, Dict, deque, Counter, heapq)', 
      'Sorting Algorithms', 'Recursion', 'Backtracking', 
      'Divide & Conquer', 'OOP', 'Linked Lists', 'Stacks & Queues', 
      'Binary Trees', 'Binary Search Trees (BST)'
    ]
  },
  {
    title: 'DSA Adv',
    icon: <Cpu size={20} />,
    colorClass: 'amber',
    borderColor: 'hover:border-amber-500/50',
    glowColor: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    pillClass: 'bg-amber-500/5 hover:bg-amber-600 border-amber-500/10 hover:border-amber-400 text-amber-200',
    topics: [
      'Heaps (Priority Queue)', 'HashMaps & HashSets', 'Greedy Algorithms', 
      'Graphs', 'Dynamic Programming', 'Tries', 'Segment Trees'
    ]
  },
  {
    title: 'Core MERN',
    icon: <Database size={20} />,
    colorClass: 'orange',
    borderColor: 'hover:border-orange-500/50',
    glowColor: 'hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]',
    iconBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    pillClass: 'bg-orange-500/5 hover:bg-orange-600 border-orange-500/10 hover:border-orange-400 text-orange-200',
    topics: [
      'HTML', 'CSS', 'JavaScript', 'React.js', 'Node.js', 
      'Express.js', 'MongoDB', 'Mongoose', 'REST APIs', 
      'Authentication', 'Deployment', 'Projects'
    ]
  },
  {
    title: 'Adv MERN',
    icon: <Sliders size={20} />,
    colorClass: 'rose',
    borderColor: 'hover:border-rose-500/50',
    glowColor: 'hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]',
    iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    pillClass: 'bg-rose-500/5 hover:bg-rose-600 border-rose-500/10 hover:border-rose-400 text-rose-200',
    topics: [
      'React Query', 'Redux Toolkit', 'Next.js', 'WebSockets', 
      'Docker', 'AWS', 'CI/CD', 'Microservices', 'System Design'
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

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'practice' }),
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
        <div className="text-center max-w-md">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold tracking-tight">Generating Arena</h3>
          <p className="text-sm text-zinc-400 mt-2">
            Compiling exactly 20 cost-optimized questions on {selectedTopic} ({selectedDifficulty} level) using DeepSeek API...
          </p>
        </div>
      </div>
    )
  }

  // Difficulty Selection Screen
  if (showDifficultyScreen && selectedTopic) {
    const levels = [
      { id: 'easy', label: 'Easy Target', desc: 'Focuses on syntax basics and simple key terms' },
      { id: 'medium', label: 'Medium Target', desc: 'Practical implementation, algorithmic branches, and logical loops' },
      { id: 'hard', label: 'Hard Target', desc: 'Deep compiler optimization, scale patterns, and memory complexity' },
    ]

    return (
      <div className="min-h-screen text-zinc-100 p-6 max-w-2xl mx-auto flex flex-col justify-center animate-fade-in">
        <button
          onClick={resetArena}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 font-semibold mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Arena
        </button>

        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Sandbox</span>
          <h1 className="text-2xl font-black mt-0.5">Select Difficulty - {selectedTopic}</h1>
        </div>

        <div className="space-y-4">
          {levels.map(lvl => (
            <button
              key={lvl.id}
              onClick={() => handleStartPractice(lvl.id)}
              className="w-full glass-card text-left rounded-2xl p-5 border border-zinc-800 hover:border-indigo-500 bg-zinc-900/10 hover:bg-zinc-800/20 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <h3 className="font-bold text-zinc-200 text-sm group-hover:text-indigo-400 transition-colors">{lvl.label}</h3>
                <p className="text-xs text-zinc-455 mt-1 font-medium">{lvl.desc}</p>
              </div>
              <ChevronRight className="text-zinc-500 group-hover:text-indigo-400 transition-colors" size={18} />
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
        <div className="min-h-screen text-zinc-100 p-6 max-w-4xl mx-auto animate-fade-in space-y-6">
          {/* Results summary header */}
          <div className="glass-card rounded-3xl p-8 text-center border border-zinc-850 bg-zinc-900/10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Practice Completed</h2>
            <h1 className="text-3xl font-black mt-1">Assessment Performance</h1>
            <p className="text-zinc-500 text-xs mt-1">Topic: {selectedTopic} ({selectedDifficulty} Level)</p>

            <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg mx-auto">
              <div className="bg-zinc-950/60 rounded-2xl p-4 border border-zinc-850">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Solved</span>
                <p className="text-2xl font-black text-zinc-100 mt-1">{score} / {total}</p>
              </div>
              <div className="bg-zinc-950/60 rounded-2xl p-4 border border-zinc-850">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Accuracy</span>
                <p className="text-2xl font-black text-indigo-400 mt-1">{percentage}%</p>
              </div>
              <div className="bg-zinc-950/60 rounded-2xl p-4 border border-zinc-850">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Hiring Match</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">{percentage >= 70 ? 'Optimal' : 'Practice'}</p>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-3">
              <button
                onClick={() => handleStartPractice(selectedDifficulty!)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs transition-all border border-indigo-500/20 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                Practice Again
              </button>
              <button
                onClick={resetArena}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-semibold text-xs transition-all border border-zinc-700 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Arena
              </button>
            </div>
          </div>

          {/* Deep-dive Questions Review list */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">Questions Summary (20)</h3>
            {questions.map((q, idx) => {
              const uAns = selectedAnswers[q.id]
              const isCorrect = uAns === q.correctOption

              return (
                <div key={q.id} className={`glass-card rounded-2xl p-5 border ${isCorrect ? 'border-emerald-500/10 bg-emerald-950/2' : 'border-rose-500/10 bg-rose-950/2'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-bold text-sm text-zinc-200">{idx + 1}. {q.question}</h4>
                    {isCorrect ? (
                      <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        <CheckCircle className="h-3 w-3" /> Correct
                      </span>
                    ) : (
                      <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                        <XCircle className="h-3 w-3" /> Incorrect
                      </span>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 mt-4">
                    {q.options.map((opt, oIdx) => {
                      const isCorrectOpt = oIdx === q.correctOption
                      const isUserChoice = oIdx === uAns
                      let optStyle = 'bg-zinc-950/30 text-zinc-500 border border-zinc-850'
                      if (isCorrectOpt) optStyle = 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold'
                      else if (isUserChoice) optStyle = 'bg-rose-500/10 text-rose-300 border border-rose-500/20 font-semibold'

                      return (
                        <div key={oIdx} className={`px-4 py-2.5 rounded-xl text-xs font-medium ${optStyle}`}>
                          {opt}
                        </div>
                      )
                    })}
                  </div>

                  {q.explanation && (
                    <div className="mt-3.5 pt-3.5 border-t border-zinc-850 text-[11px] text-zinc-500 leading-relaxed">
                      <span className="font-bold text-zinc-400 block mb-0.5">Explanation</span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen text-zinc-100 p-6 max-w-3xl mx-auto animate-fade-in space-y-6">
        {/* Navigation Indicator & Quit trigger */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <button
            onClick={resetArena}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-350 transition-all font-semibold cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Quit Practice
          </button>
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-rose-450 font-bold bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 animate-pulse">
              <Clock className="h-3.5 w-3.5 animate-spin-slow" />
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] text-zinc-400 font-bold bg-zinc-900 border border-zinc-850 px-3 py-1.5 rounded-full uppercase tracking-wider">
              {selectedTopic} • {selectedDifficulty}
            </span>
          </div>
        </div>

        {/* 1-20 Question Navigation Roadmap Dashboard */}
        <div className="glass-card rounded-2xl p-4 border border-zinc-855 bg-zinc-900/10">
          <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block mb-2 px-1">Questions (20)</span>
          <div className="grid grid-cols-10 gap-1.5 justify-items-center">
            {questions.map((q, idx) => {
              const uChoice = selectedAnswers[q.id]
              const isCurrent = currentQuestionIdx === idx
              
              let statusStyle = 'bg-zinc-900/60 border-zinc-800 text-zinc-550'
              if (isCurrent) {
                statusStyle = 'border-indigo-500 text-indigo-400 bg-indigo-500/5 font-bold shadow-md shadow-indigo-500/5'
              } else if (uChoice !== undefined) {
                statusStyle = 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300'
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIdx(idx)}
                  className={`w-7 h-7 md:w-8 md:h-8 text-xs font-semibold rounded-lg border flex items-center justify-center transition-all cursor-pointer ${statusStyle}`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
        </div>

        {/* Question Panel */}
        <div className="glass-card rounded-3xl p-6 border border-zinc-800 bg-zinc-900/10">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Question {currentQuestionIdx + 1} of 20</span>
          <h2 className="text-sm font-bold text-zinc-100 leading-snug mt-2">{currentQuestion.question}</h2>

          <div className="space-y-2.5 mt-5">
            {currentQuestion.options.map((option, index) => {
              const isSelected = userChoice === index
              let cardStyle = 'bg-zinc-900/30 hover:bg-zinc-900/80 border-zinc-850 text-zinc-300'
              if (isSelected) {
                cardStyle = 'bg-indigo-500/5 border-indigo-500/40 text-indigo-300 font-semibold shadow-md shadow-indigo-500/5'
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelectOption(index)}
                  className={`w-full text-left px-4.5 py-3.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${cardStyle}`}
                >
                  <span>{option}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Next/Prev Navigation bars & Submit Practice button */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => currentQuestionIdx > 0 && setCurrentQuestionIdx(prev => prev - 1)}
              disabled={currentQuestionIdx === 0}
              className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                currentQuestionIdx > 0 
                  ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 cursor-pointer' 
                  : 'border-zinc-855 text-zinc-700 cursor-not-allowed'
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => currentQuestionIdx < questions.length - 1 && setCurrentQuestionIdx(prev => prev + 1)}
              disabled={currentQuestionIdx === questions.length - 1}
              className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                currentQuestionIdx < questions.length - 1 
                  ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 cursor-pointer' 
                  : 'border-zinc-855 text-zinc-700 cursor-not-allowed'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={submitPractice}
            className="px-6 py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all border border-indigo-500/20 cursor-pointer shadow-lg shadow-indigo-600/10"
          >
            Submit Practice
          </button>
        </div>
      </div>
    )
  }

  // Landing Categories Grid
  return (
    <div className="p-6 text-zinc-100 min-h-screen animate-fade-in space-y-6">
      <div className="pb-2 border-b border-zinc-900">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Sandbox</span>
        <h1 className="text-3xl font-black tracking-tight mt-0.5">Practice Arena</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Select subjects and difficulties to generate cost-optimized MCQ problem sets of 20 questions.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {roadmaps.map((roadmap) => (
          <div
            key={roadmap.title}
            className={`glass-card rounded-2xl p-6 border border-zinc-800/80 bg-zinc-900/10 flex flex-col justify-between transition-all duration-300 ${roadmap.borderColor} ${roadmap.glowColor}`}
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2.5 rounded-xl border ${roadmap.iconBg}`}>
                  {roadmap.icon}
                </div>
                <div>
                  <h2 className="text-md font-bold tracking-tight text-zinc-200">{roadmap.title}</h2>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                    {roadmap.topics.length} Steps
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-y-3.5 gap-x-2.5 pb-2">
                {roadmap.topics.map((topic, tIdx) => (
                  <React.Fragment key={topic}>
                    <button
                      onClick={() => handleSelectTopic(topic)}
                      className={`text-left px-3 py-1.5 rounded-xl border text-[11px] font-semibold hover:text-white hover:scale-102 transition-all duration-200 cursor-pointer ${roadmap.pillClass}`}
                    >
                      {topic}
                    </button>
                    {tIdx < roadmap.topics.length - 1 && (
                      <ChevronRight size={14} className="text-zinc-700 flex-shrink-0" />
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
