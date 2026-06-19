'use client'
import React, { useState, useEffect, useRef } from 'react'
import { 
  Clock, 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Award, 
  AlertCircle, 
  RefreshCw,
  Building,
  Cpu,
  Zap,
  Lock,
  ChevronRight,
  ThumbsUp,
  UserCheck,
  Play,
  Terminal,
  Code,
  ShieldAlert
} from 'lucide-react'

interface Question {
  id: number
  question: string
  options: string[]
  correctOption: number
  explanation: string
}

interface TestCase {
  input: string
  output: string
}

interface CodingProblem {
  title: string
  description: string
  constraints: string
  inputFormat: string
  outputFormat: string
  sampleInput: string
  sampleOutput: string
  testCases: TestCase[]
  starterTemplates: Record<string, string>
}

interface GenerationResponse {
  questions?: Question[]
  codingProblem?: CodingProblem
  isAI: boolean
  error?: boolean
}

const productCompanies = [
  'Google', 'Amazon', 'Microsoft', 'Facebook', 'Apple', 
  'Netflix', 'Uber', 'Flipkart', 'Adobe', 'LinkedIn', 
  'Atlassian', 'Salesforce'
]

const serviceCompanies = [
  'TCS', 'Infosys', 'Wipro', 'Cognizant', 'Capgemini', 
  'HCL', 'Tech Mahindra', 'Accenture', 'LTI', 'Persistent'
]

const startups = [
  'Zepto', 'Razorpay', 'Meesho', 'CRED', 'BrowserStack', 
  'Postman', 'Groww', 'Physics Wallah', 'CoinDCX', 'Unacademy'
]

const Test = () => {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)

  const getCompanyCategory = (company: string) => {
    if (productCompanies.includes(company)) return 'product'
    if (serviceCompanies.includes(company)) return 'service'
    return 'startup'
  }

  const getCompanyRounds = (company: string) => {
    const category = getCompanyCategory(company)
    if (category === 'product') {
      return [
        { id: 1, name: 'Round 1: Aptitude Assessment', type: 'Aptitude MCQ', desc: '10 mathematical, logic & analytical queries. Passing: 60%' },
        { id: 2, name: 'Round 2: English & Verbal Ability', type: 'English MCQ', desc: '10 reading comprehension, grammar & vocabulary questions. Passing: 60%' },
        { id: 3, name: 'Round 3: Technical Screening', type: 'Technical MCQ', desc: '10 core DSA concepts, complexity analysis and language queries. Passing: 60%' },
        { id: 4, name: 'Round 4: Advanced DSA Coding', type: 'Code Editor', desc: '1 real-world algorithmic challenge compiling against self-hosted compiler.' },
        { id: 5, name: 'Round 5: System Architecture', type: 'Design MCQ', desc: '10 scale-design, microservices and caching patterns queries. Passing: 60%' },
        { id: 6, name: 'Round 6: Tricky Logic & Debugging', type: 'Logic MCQ', desc: '10 dry-runs, execution tracer and memory management tasks. Passing: 60%' },
        { id: 7, name: 'Round 7: Behavioral Alignment', type: 'Scenario MCQ', desc: '10 workplace situational dilemmas and culture alignment queries. Passing: 60%' },
      ]
    }
    if (category === 'service') {
      return [
        { id: 1, name: 'Round 1: Aptitude Assessment', type: 'Aptitude MCQ', desc: '10 basic math, quantitative reasoning, and patterns problems. Passing: 60%' },
        { id: 2, name: 'Round 2: English & Communication', type: 'English MCQ', desc: '10 verbal logic, grammar correction and sentence structure tasks. Passing: 60%' },
        { id: 3, name: 'Round 3: Technical Screening', type: 'Technical MCQ', desc: '10 OOPs, database queries, and basic programming logic queries. Passing: 60%' },
        { id: 4, name: 'Round 4: Practical DSA Coding', type: 'Code Editor', desc: '1 practical programming task compiling in the visual code editor.' },
        { id: 5, name: 'Round 5: Technical & HR Fit', type: 'HR MCQ', desc: '10 project-handling, client relation, and workplace policy queries. Passing: 60%' },
      ]
    }
    // startup
    return [
      { id: 1, name: 'Round 1: Aptitude Assessment', type: 'Aptitude MCQ', desc: '10 analytical puzzles, quick math, and logical reasoning under pressure. Passing: 60%' },
      { id: 2, name: 'Round 2: Technical Screening', type: 'Technical MCQ', desc: '10 basic language variables, loops, async logic, and algorithms. Passing: 60%' },
      { id: 3, name: 'Round 3: Fast-Paced DSA Coding', type: 'Code Editor', desc: '1 intense startup application programming task in the IDE.' },
      { id: 4, name: 'Round 4: High-Scale Systems', type: 'Systems MCQ', desc: '10 API scaling, database schema design, and caching decision queries. Passing: 60%' },
    ]
  }
  
  // Roadmap Funnel state: dynamic map
  const [currentRound, setCurrentRound] = useState<number>(1)
  const [unlockedRounds, setUnlockedRounds] = useState<Record<number, boolean>>({ 1: true })
  const [completedRounds, setCompletedRounds] = useState<Record<number, boolean>>({})

  // Active generation states
  const [loading, setLoading] = useState(false)
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<Question[]>([])
  const [activeCodingProblem, setActiveCodingProblem] = useState<CodingProblem | null>(null)
  const [isAI, setIsAI] = useState(false)

  // Active round state
  const [isRoundActive, setIsRoundActive] = useState(false)
  const [roundFinished, setRoundFinished] = useState(false)
  
  // MCQ state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({}) // qId -> optionIndex
  const [timeLeft, setTimeLeft] = useState(360) // 6 minutes for MCQ, 20 minutes for coding
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Code Editor states
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'javascript' | 'cpp' | 'java'>('python')
  const [codeText, setCodeText] = useState('')
  const [consoleOutput, setConsoleOutput] = useState('')
  const [compiling, setCompiling] = useState(false)
  const [testCaseResults, setTestCaseResults] = useState<any[]>([])
  const [codingSolvedVerified, setCodingSolvedVerified] = useState(false)

  // Proctoring security states
  const [violationsCount, setViolationsCount] = useState(0)
  const [suspiciousActivities, setSuspiciousActivities] = useState<{ timestamp: string; activity: string }[]>([])
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const inactivityTimeoutRef = useRef<any>(null)

  const activeCodingProblemRef = useRef(activeCodingProblem)
  const codeTextRef = useRef(codeText)
  const selectedLanguageRef = useRef(selectedLanguage)
  const selectedCompanyRef = useRef(selectedCompany)
  const currentRoundRef = useRef(currentRound)
  const logSuspiciousActivityRef = useRef<any>(null)

  useEffect(() => {
    activeCodingProblemRef.current = activeCodingProblem
  }, [activeCodingProblem])

  useEffect(() => {
    codeTextRef.current = codeText
  }, [codeText])

  useEffect(() => {
    selectedLanguageRef.current = selectedLanguage
  }, [selectedLanguage])

  useEffect(() => {
    selectedCompanyRef.current = selectedCompany
  }, [selectedCompany])

  useEffect(() => {
    currentRoundRef.current = currentRound
  }, [currentRound])

  const handleViolationAutoSubmit = async () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error(err))
    }
    
    if (activeCodingProblemRef.current) {
      if (timerRef.current) clearInterval(timerRef.current)
      setCompiling(true)
      setConsoleOutput('Disqualified: 3 Proctoring Violations. Auto-submitting to HackerEarth evaluator...')
      
      try {
        const res = await fetch('/api/compile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            source_code: codeTextRef.current,
            language_id: getLanguageId(selectedLanguageRef.current),
            test_cases: activeCodingProblemRef.current.testCases
          })
        })

        if (!res.ok) throw new Error('Auto-submit compilation error')
        
        const data = await res.json()
        const results = data.results || []
        const allPassed = results.length > 0 && results.every((r: any) => r.passed)

        const companyRounds = getCompanyRounds(selectedCompanyRef.current!)
        const activeRoundIdx = companyRounds.findIndex(r => r.id === currentRoundRef.current)

        if (allPassed) {
          setCompletedRounds(prev => ({ ...prev, [currentRoundRef.current]: true }))
          if (activeRoundIdx < companyRounds.length - 1) {
            const nextRound = companyRounds[activeRoundIdx + 1]
            setUnlockedRounds(prev => ({ ...prev, [nextRound.id]: true }))
          }
          setCodingSolvedVerified(true)
          setIsRoundActive(false)
          setRoundFinished(true)
        } else {
          setCodingSolvedVerified(false)
          setIsRoundActive(true)
          setRoundFinished(true)
        }
      } catch (err) {
        console.error(err)
        setCodingSolvedVerified(false)
        setIsRoundActive(true)
        setRoundFinished(true)
      } finally {
        setCompiling(false)
      }
    } else {
      handleFinishMCQRound()
    }
  }

  const logSuspiciousActivity = (activity: string) => {
    const time = new Date().toLocaleTimeString()
    setSuspiciousActivities(prev => [...prev, { timestamp: time, activity }])
    
    setViolationsCount(prev => {
      const nextCount = prev + 1
      if (nextCount >= 3) {
        handleViolationAutoSubmit()
      } else {
        setWarningMessage(activity)
        setShowWarningModal(true)
      }
      return nextCount
    })
  }

  useEffect(() => {
    logSuspiciousActivityRef.current = logSuspiciousActivity
  })

  // Proctoring event listeners registration
  useEffect(() => {
    if (!isRoundActive || roundFinished) {
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current)
      return
    }

    // Force fullscreen
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen()
        }
      } catch (err) {
        console.error('Error forcing fullscreen:', err)
      }
    }
    enterFullscreen()

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        logSuspiciousActivityRef.current?.('Tab switched or minimized / Page hidden')
      }
    }

    const handleWindowBlur = () => {
      logSuspiciousActivityRef.current?.('Window lost focus / Blur event detected')
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isRoundActive && !roundFinished) {
        logSuspiciousActivityRef.current?.('Exited fullscreen mode')
      }
    }

    const handleOffline = () => {
      logSuspiciousActivityRef.current?.('Network disconnected (Offline)')
    }

    const handleOnline = () => {
      const time = new Date().toLocaleTimeString()
      setSuspiciousActivities(prev => [...prev, { timestamp: time, activity: 'Network reconnected (Online)' }])
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      logSuspiciousActivityRef.current?.('Attempted to right-click')
    }

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      logSuspiciousActivityRef.current?.('Attempted to copy text')
    }

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault()
      logSuspiciousActivityRef.current?.('Attempted to cut text')
    }

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault()
      logSuspiciousActivityRef.current?.('Attempted to paste text')
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey
      const isShift = e.shiftKey

      if (e.key === 'F12') {
        e.preventDefault()
        logSuspiciousActivityRef.current?.('Attempted F12 (DevTools)')
      } else if (isCtrlOrCmd && isShift && e.key.toLowerCase() === 'i') {
        e.preventDefault()
        logSuspiciousActivityRef.current?.('Attempted DevTools shortcut (Ctrl+Shift+I)')
      } else if (isCtrlOrCmd && isShift && e.key.toLowerCase() === 'j') {
        e.preventDefault()
        logSuspiciousActivityRef.current?.('Attempted Console shortcut (Ctrl+Shift+J)')
      } else if (isCtrlOrCmd && isShift && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        logSuspiciousActivityRef.current?.('Attempted Element Inspect shortcut (Ctrl+Shift+C)')
      } else if (isCtrlOrCmd && e.key.toLowerCase() === 'u') {
        e.preventDefault()
        logSuspiciousActivityRef.current?.('Attempted View Source (Ctrl+U)')
      } else if (isCtrlOrCmd && e.key.toLowerCase() === 's') {
        e.preventDefault()
        logSuspiciousActivityRef.current?.('Attempted Save Page (Ctrl+S)')
      }
    }

    const resetInactivityTimer = () => {
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current)
      inactivityTimeoutRef.current = setTimeout(() => {
        logSuspiciousActivityRef.current?.('User inactive for 45 seconds')
      }, 45000)
    }

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    activityEvents.forEach(evt => window.addEventListener(evt, resetInactivityTimer))
    resetInactivityTimer()

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    window.addEventListener('contextmenu', handleContextMenu)
    window.addEventListener('copy', handleCopy)
    window.addEventListener('cut', handleCut)
    window.addEventListener('paste', handlePaste)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('contextmenu', handleContextMenu)
      window.removeEventListener('copy', handleCopy)
      window.removeEventListener('cut', handleCut)
      window.removeEventListener('paste', handlePaste)
      window.removeEventListener('keydown', handleKeyDown)
      
      activityEvents.forEach(evt => window.removeEventListener(evt, resetInactivityTimer))
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current)
    }
  }, [isRoundActive, roundFinished])

  // Sync editor starter code when problem or language changes
  useEffect(() => {
    if (activeCodingProblem) {
      const template = activeCodingProblem.starterTemplates?.[selectedLanguage] || ''
      setCodeText(template)
      setConsoleOutput('')
      setTestCaseResults([])
    }
  }, [activeCodingProblem, selectedLanguage])

  // Timer logic for active rounds
  useEffect(() => {
    if (isRoundActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            if (activeCodingProblem) {
              handleAutoSubmitCoding()
            } else {
              handleFinishMCQRound()
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRoundActive, timeLeft, activeCodingProblem])

  const startInterviewRound = async (roundNumber: number) => {
    setCurrentRound(roundNumber)
    setLoading(true)
    setActiveQuizQuestions([])
    setActiveCodingProblem(null)
    setCurrentQuestionIdx(0)
    setSelectedAnswers({})
    setConsoleOutput('')
    setTestCaseResults([])
    setViolationsCount(0)
    setSuspiciousActivities([])
    
    const rounds = getCompanyRounds(selectedCompany!)
    const activeRound = rounds.find(r => r.id === roundNumber)
    const isCoding = activeRound?.type === 'Code Editor'
    
    // 20 mins for coding, 6 mins for MCQ (10 questions)
    setTimeLeft(isCoding ? 1200 : 360)
    
    setCodingSolvedVerified(false)
    setRoundFinished(false)
    setIsRoundActive(false)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'test',
          company: selectedCompany,
          round: roundNumber
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate interview round questions')
      }

      const data = (await response.json()) as GenerationResponse
      setIsAI(data.isAI)
      
      if (isCoding) {
        setActiveCodingProblem(data.codingProblem || null)
        setSelectedLanguage('python') // reset default lang
      } else {
        setActiveQuizQuestions(data.questions || [])
      }
      setIsRoundActive(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectOption = (optIdx: number) => {
    const qId = activeQuizQuestions[currentQuestionIdx].id
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }))
  }

  const handleFinishMCQRound = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRoundActive(true)
    setRoundFinished(true)
  }

  const calculateMCQScore = () => {
    let score = 0
    activeQuizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctOption) {
        score++
      }
    })
    return score
  }

  // Maps UI language names to HackerEarth v4 language codes
  const getLanguageId = (lang: string) => lang || 'python'

  // Compiler code submission & execution via proxy API (HackerEarth v4)
  const handleRunCompiler = async (isSubmit: boolean = false) => {
    if (!activeCodingProblem) return
    setCompiling(true)
    setConsoleOutput('Sending code to HackerEarth evaluator...')
    setTestCaseResults([])

    // Sample execution runs only test case 0, submit runs all
    const testCasesToRun = isSubmit 
      ? activeCodingProblem.testCases 
      : [activeCodingProblem.testCases[0]]

    try {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_code: codeText,
          language_id: getLanguageId(selectedLanguage),
          test_cases: testCasesToRun
        })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Compilation proxy error')
      }

      const data = await res.json()
      const results = data.results || []

      setTestCaseResults(results)

      let allPassed = true
      let logs = ''

      results.forEach((resItem: any, idx: number) => {
        const tcName = isSubmit ? `Test Case ${idx + 1}` : `Sample Test Case`
        if (resItem.passed) {
          logs += `✓ ${tcName}: Passed\n`
        } else {
          allPassed = false
          logs += `✗ ${tcName}: ${resItem.status?.description || 'Failed'}\n`
          if (resItem.compile_output) {
            logs += `Compilation Output:\n${resItem.compile_output}\n`
          } else if (resItem.stderr) {
            logs += `Runtime Error:\n${resItem.stderr}\n`
          } else {
            logs += `Expected:\n${testCasesToRun[idx].output.trim()}\nGot:\n${(resItem.stdout || '').trim()}\n`
          }
        }
      })

      if (allPassed) {
        logs += `\n🎉 All verified test cases passed!`
        if (isSubmit) {
          setCodingSolvedVerified(true)
        }
      } else {
        logs += `\n⚠️ Some test cases failed. Please review your logic.`
      }

      setConsoleOutput(logs)
    } catch (err: any) {
      console.error(err)
      setConsoleOutput(`Compilation Failed: ${err.message}`)
    } finally {
      setCompiling(false)
    }
  }

  const handleVerifyCoding = async () => {
    if (timerRef.current) clearInterval(timerRef.current)
    const companyRounds = getCompanyRounds(selectedCompany!)
    const activeRoundIdx = companyRounds.findIndex(r => r.id === currentRound)
    
    if (codingSolvedVerified) {
      setCompletedRounds(prev => ({ ...prev, [currentRound]: true }))
      if (activeRoundIdx < companyRounds.length - 1) {
        const nextRound = companyRounds[activeRoundIdx + 1]
        setUnlockedRounds(prev => ({ ...prev, [nextRound.id]: true }))
      }
      setIsRoundActive(false)
      setRoundFinished(true)
    } else {
      setIsRoundActive(true)
      setRoundFinished(true)
    }
  }

  const handleAutoSubmitCoding = async () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setCompiling(true)
    setConsoleOutput('Time limit reached. Auto-submitting to HackerEarth evaluator...')
    
    try {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_code: codeText,
          language_id: getLanguageId(selectedLanguage),
          test_cases: activeCodingProblem!.testCases
        })
      })

      if (!res.ok) throw new Error('Auto-submit compilation error')
      
      const data = await res.json()
      const results = data.results || []
      const allPassed = results.length > 0 && results.every((r: any) => r.passed)

      const companyRounds = getCompanyRounds(selectedCompany!)
      const activeRoundIdx = companyRounds.findIndex(r => r.id === currentRound)

      if (allPassed) {
        setCompletedRounds(prev => ({ ...prev, [currentRound]: true }))
        if (activeRoundIdx < companyRounds.length - 1) {
          const nextRound = companyRounds[activeRoundIdx + 1]
          setUnlockedRounds(prev => ({ ...prev, [nextRound.id]: true }))
        }
        setCodingSolvedVerified(true)
        setIsRoundActive(false)
        setRoundFinished(true)
      } else {
        setCodingSolvedVerified(false)
        setIsRoundActive(true)
        setRoundFinished(true)
      }
    } catch (err) {
      console.error(err)
      setCodingSolvedVerified(false)
      setIsRoundActive(true)
      setRoundFinished(true)
    } finally {
      setCompiling(false)
    }
  }

  const handleNextRoadmap = async () => {
    setIsRoundActive(false)
    setRoundFinished(false)
    
    const companyRounds = getCompanyRounds(selectedCompany!)
    const activeRoundIdx = companyRounds.findIndex(r => r.id === currentRound)
    
    if (activeRoundIdx === companyRounds.length - 1) {
      setCompletedRounds(prev => ({ ...prev, [currentRound]: true }))
      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            type: 'test',
            topic: `${selectedCompany} Full Interview`,
            difficulty: 'hard',
            score: 10,
            total: 10
          }),
        })
        window.dispatchEvent(new Event('storage'))
      } catch (err) {
        console.error('Error updating tests count in MongoDB:', err)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min}:${sec < 10 ? '0' : ''}${sec}`
  }

  const resetRoadmap = (company?: string) => {
    const target = company || selectedCompany
    if (!target) return
    const rounds = getCompanyRounds(target)
    
    const initialUnlocked: Record<number, boolean> = {}
    const initialCompleted: Record<number, boolean> = {}
    
    rounds.forEach(r => {
      initialUnlocked[r.id] = r.id === rounds[0].id
      initialCompleted[r.id] = false
    })
    
    setUnlockedRounds(initialUnlocked)
    setCompletedRounds(initialCompleted)
    setCurrentRound(rounds[0].id)
    setIsRoundActive(false)
    setRoundFinished(false)
  }

  const quitCompany = () => {
    setSelectedCompany(null)
  }

  // Loading indicator screen
  if (loading) {
    return (
      <div className="min-h-screen text-zinc-100 flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="text-center max-w-md">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold tracking-tight">Initiating Interview Round</h3>
          <p className="text-sm text-zinc-400 mt-2 font-medium">
            Loading assessment assets for Round {currentRound} of {selectedCompany}&apos;s recruitment funnel using DeepSeek API...
          </p>
        </div>
      </div>
    )
  }

  // Active coding problem round with Code Editor (Self-Hosted Judge0 CE Compiler)
  if (selectedCompany && isRoundActive && activeCodingProblem) {
    const problem = activeCodingProblem
    const lines = codeText.split('\n')

    return (
      <div className="min-h-screen text-zinc-100 p-6 max-w-7xl mx-auto animate-fade-in flex flex-col space-y-4">
        {/* Top Header Panel */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3 flex-shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Round {currentRound}: DSA Coding Assessment</span>
            <h1 className="text-xl font-black text-zinc-100 mt-0.5">{problem.title}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1.5 rounded-full border border-rose-500/20 animate-pulse">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(timeLeft)}
            </span>
            <button 
              onClick={() => setIsRoundActive(false)} 
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-all font-semibold cursor-pointer px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-850"
            >
              <ArrowLeft size={13} /> Back to Roadmap
            </button>
          </div>
        </div>

        {/* IDE Split Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-175px)] overflow-hidden flex-1">
          {/* Left Column: Problem description */}
          <div className="lg:col-span-5 h-full overflow-y-auto pr-1 space-y-4">
            <div className="glass-card rounded-xl p-5 border border-zinc-850 bg-zinc-900/10 space-y-4 text-xs font-medium">
              <div>
                <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider">Problem Statement</span>
                <p className="text-zinc-300 leading-relaxed mt-1.5 whitespace-pre-wrap">{problem.description}</p>
              </div>

              <div className="pt-3 border-t border-zinc-900">
                <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Constraints</span>
                <pre className="text-zinc-400 font-mono mt-1 bg-zinc-950/40 p-2 rounded border border-zinc-900">{problem.constraints || 'Standard complexity bounds apply.'}</pre>
              </div>

              <div className="pt-3 border-t border-zinc-900 space-y-1.5">
                <div>
                  <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Input Format</span>
                  <p className="text-[11px] text-zinc-450 leading-relaxed mt-0.5">{problem.inputFormat}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Output Format</span>
                  <p className="text-[11px] text-zinc-450 leading-relaxed mt-0.5">{problem.outputFormat}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-zinc-900">
                <div>
                  <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Sample Input</span>
                  <pre className="text-[10px] text-zinc-400 font-mono p-2.5 rounded-lg bg-zinc-950/60 mt-1 border border-zinc-900 overflow-x-auto whitespace-pre-wrap">
                    {problem.sampleInput}
                  </pre>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Sample Output</span>
                  <pre className="text-[10px] text-zinc-400 font-mono p-2.5 rounded-lg bg-zinc-950/60 mt-1 border border-zinc-900 overflow-x-auto whitespace-pre-wrap">
                    {problem.sampleOutput}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Code Editor + Console */}
          <div className="lg:col-span-7 h-full flex flex-col justify-between border border-zinc-850 bg-zinc-900/10 glass-card rounded-2xl overflow-hidden">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-850 bg-zinc-950/40 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-indigo-400" />
                <select 
                  value={selectedLanguage} 
                  onChange={(e) => setSelectedLanguage(e.target.value as any)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold rounded-lg px-2.5 py-1 focus:ring-0 focus:outline-none cursor-pointer"
                >
                  <option value="python">Python 3</option>
                  <option value="javascript">JavaScript (Node.js)</option>
                  <option value="cpp">C++ (GCC)</option>
                  <option value="java">Java (OpenJDK)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunCompiler(false)}
                  disabled={compiling || !codeText}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-[11px] font-bold text-zinc-350 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Play size={11} className="text-zinc-400" />
                  Run Sample
                </button>
                <button
                  onClick={() => handleRunCompiler(true)}
                  disabled={compiling || !codeText}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-500 text-[11px] font-bold text-white transition-all cursor-pointer shadow-md shadow-indigo-600/10 disabled:opacity-50"
                >
                  {compiling ? <Loader2 size={11} className="animate-spin" /> : <Terminal size={11} />}
                  Submit Code
                </button>
              </div>
            </div>

            {/* Code Textarea editor with line count */}
            <div className="flex-1 flex overflow-hidden bg-zinc-950/40 relative">
              <div className="w-10 bg-zinc-950/80 text-zinc-650 font-mono text-[11px] leading-relaxed text-right pr-2 py-4 select-none border-r border-zinc-900 h-full overflow-hidden flex flex-col flex-shrink-0">
                {lines.map((_, i) => (
                  <span key={i} className="h-[21px] block">{i + 1}</span>
                ))}
              </div>
              <textarea
                value={codeText}
                onChange={(e) => setCodeText(e.target.value)}
                className="flex-1 p-4 bg-transparent border-0 outline-none text-zinc-200 resize-none overflow-y-auto whitespace-pre font-mono text-[11px] leading-relaxed focus:ring-0 focus:outline-none h-full"
                placeholder="// Write your program solution here..."
                spellCheck={false}
              />
            </div>

            {/* Terminal console output */}
            <div className="h-44 border-t border-zinc-850 bg-zinc-950/80 flex flex-col flex-shrink-0">
              <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-950 border-b border-zinc-900 text-[10px] font-bold text-zinc-450 uppercase">
                <span>Console Terminal Log</span>
                <span className="text-indigo-400 font-semibold">{selectedLanguage.toUpperCase()} environment</span>
              </div>
              <div className="flex-1 p-3 overflow-y-auto font-mono text-[10px] text-zinc-350 whitespace-pre-wrap leading-relaxed">
                {consoleOutput || "Terminal ready. Compile or submit code to check outputs against standard test cases."}
              </div>
            </div>

            {/* Final validation gate */}
            <div className="px-4 py-3 border-t border-zinc-850 bg-zinc-950/20 flex items-center justify-between gap-4 flex-shrink-0">
              <span className="text-[10px] font-semibold text-zinc-450">
                {codingSolvedVerified 
                  ? "✓ Verification checks completed. You may continue to next round."
                  : "⌛ Verify solutions via compiler submissions. Needs 100% test cases passed."
                }
              </span>

              <button
                onClick={handleVerifyCoding}
                disabled={!codingSolvedVerified}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                  codingSolvedVerified
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/20 cursor-pointer shadow-md'
                    : 'bg-zinc-900 text-zinc-650 border-zinc-800/80 cursor-not-allowed'
                }`}
              >
                Continue Round
              </button>
            </div>
          </div>
        </div>

        {showWarningModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="glass-card rounded-3xl p-8 border border-rose-500/20 max-w-sm w-full space-y-6 bg-zinc-900/90 text-center shadow-2xl shadow-rose-500/10">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
                <ShieldAlert className="h-6 w-6 text-rose-400" />
              </div>
              <div>
                <h2 className="text-base font-black text-zinc-100 tracking-tight">Proctoring Warning</h2>
                <p className="text-xs text-rose-400 mt-2 font-bold uppercase tracking-wide">
                  Violation {violationsCount} of 3
                </p>
                <p className="text-[11px] text-zinc-400 mt-2.5 leading-relaxed font-medium">
                  Suspicious Activity: <span className="text-zinc-250 font-bold">{warningMessage}</span>.
                </p>
                <p className="text-[10px] text-zinc-550 mt-4 leading-normal">
                  Please focus on the exam window. You will be disqualified and your test auto-submitted after 3 violations.
                </p>
              </div>
              <button
                onClick={async () => {
                  setShowWarningModal(false)
                  try {
                    if (!document.fullscreenElement) {
                      await document.documentElement.requestFullscreen()
                    }
                  } catch (err) {
                    console.error(err)
                  }
                }}
                className="w-full py-3 rounded-xl text-xs font-bold bg-rose-650 hover:bg-rose-500 text-white transition-all cursor-pointer border border-rose-500/20"
              >
                Resume Test
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Coding failed screen (Timeout or manual submission without verification check)
  if (selectedCompany && isRoundActive && activeCodingProblem && roundFinished && !completedRounds[currentRound]) {
    return (
      <div className="min-h-screen text-zinc-100 p-6 max-w-2xl mx-auto flex flex-col justify-center animate-fade-in space-y-6">
        <div className="glass-card rounded-3xl p-8 border border-zinc-850 bg-zinc-900/10 text-center">
          <XCircle className="h-12 w-12 text-rose-455 mx-auto" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mt-4">Coding Assessment</h2>
          <h1 className="text-xl font-black mt-1">
            Round {currentRound}: Failed
          </h1>
          <p className="text-zinc-400 text-xs mt-2 font-medium">
            {violationsCount >= 3 
              ? "You were disqualified due to security proctoring violations." 
              : "You did not verify solving the DSA problem using the compiler before the timer expired."
            }
          </p>
          {violationsCount >= 3 && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-xs">
              ⚠️ Disqualified: 3 Proctoring Violations Detected
            </div>
          )}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => startInterviewRound(currentRound)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs border border-rose-500/20 transition-all cursor-pointer shadow-lg shadow-rose-600/10"
            >
              <RefreshCw size={13} />
              Retake Round {currentRound}
            </button>
          </div>
        </div>

        {/* Proctoring Security Audit Log */}
        {suspiciousActivities.length > 0 && (
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 px-1 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              Proctoring Security Audit Log
            </h3>
            <div className="glass-card rounded-2xl p-5 border border-rose-500/15 bg-rose-500/5 space-y-3">
              <p className="text-[11px] text-zinc-400 leading-normal">
                The following proctoring events were captured during this assessment round:
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {suspiciousActivities.map((act, index) => (
                  <div key={index} className="flex justify-between items-start text-xs border-b border-zinc-900/50 pb-2">
                    <span className="text-rose-400 font-medium">{act.activity}</span>
                    <span className="text-zinc-500 font-mono text-[10px] ml-4">{act.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Active MCQ round
  if (selectedCompany && isRoundActive && !activeCodingProblem && activeQuizQuestions.length > 0) {
    const currentQuestion = activeQuizQuestions[currentQuestionIdx]
    const qId = currentQuestion.id
    const userChoice = selectedAnswers[qId]

    if (roundFinished) {
      const score = calculateMCQScore()
      const total = activeQuizQuestions.length
      const percentage = Math.round((score / total) * 100)
      const isPassed = percentage >= 60 // 60% threshold to pass MCQ rounds

      const handleConfirmResults = () => {
        if (isPassed) {
          setCompletedRounds(prev => ({ ...prev, [currentRound]: true }))
          const companyRounds = getCompanyRounds(selectedCompany!)
          const activeRoundIdx = companyRounds.findIndex(r => r.id === currentRound)
          if (activeRoundIdx < companyRounds.length - 1) {
            const nextRound = companyRounds[activeRoundIdx + 1]
            setUnlockedRounds(prev => ({ ...prev, [nextRound.id]: true }))
          }
          handleNextRoadmap()
        } else {
          setRoundFinished(false)
        }
      }

      return (
        <div className="min-h-screen text-zinc-100 p-6 max-w-2xl mx-auto flex flex-col justify-center animate-fade-in space-y-6">
          <div className="glass-card rounded-3xl p-8 border border-zinc-800 bg-zinc-900/10 text-center">
            {isPassed && violationsCount < 3 ? (
              <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto" />
            ) : (
              <XCircle className="h-12 w-12 text-rose-455 mx-auto" />
            )}

            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mt-4">Round Results</h2>
            <h1 className="text-xl font-black mt-1">
              Round {currentRound}: {isPassed && violationsCount < 3 ? 'Passed' : 'Failed'}
            </h1>
            <p className="text-zinc-400 text-xs mt-2">
              {violationsCount >= 3 
                ? "You were disqualified due to security proctoring violations."
                : `Score: ${score} / ${total} (${percentage}% accuracy). Needs at least 60% to pass.`
              }
            </p>
            {violationsCount >= 3 && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-xs">
                ⚠️ Disqualified: 3 Proctoring Violations Detected
              </div>
            )}

            <div className="mt-8 flex justify-center gap-3">
              {isPassed && violationsCount < 3 ? (
                <button
                  onClick={handleConfirmResults}
                  className="px-6 py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/20 transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
                >
                  Continue to Roadmap
                </button>
              ) : (
                <button
                  onClick={() => startInterviewRound(currentRound)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs border border-rose-500/20 transition-all cursor-pointer"
                >
                  <RefreshCw size={13} />
                  Retake Round {currentRound}
                </button>
              )}
            </div>
          </div>

          {/* Proctoring Security Audit Log */}
          {suspiciousActivities.length > 0 && (
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 px-1 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Proctoring Security Audit Log
              </h3>
              <div className="glass-card rounded-2xl p-5 border border-rose-500/15 bg-rose-500/5 space-y-3">
                <p className="text-[11px] text-zinc-400 leading-normal">
                  The following proctoring events were captured during this assessment round:
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {suspiciousActivities.map((act, index) => (
                    <div key={index} className="flex justify-between items-start text-xs border-b border-zinc-900/50 pb-2">
                      <span className="text-rose-400 font-medium">{act.activity}</span>
                      <span className="text-zinc-500 font-mono text-[10px] ml-4">{act.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Deep-dive review of questions */}
          <div className="space-y-4 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">Round Questions Review</h3>
            {activeQuizQuestions.map((q, idx) => {
              const uChoice = selectedAnswers[q.id]
              const isCorrect = uChoice === q.correctOption

              return (
                <div key={q.id} className={`glass-card rounded-2xl p-5 border ${isCorrect ? 'border-emerald-500/10' : 'border-rose-500/10'}`}>
                  <h4 className="font-bold text-xs text-zinc-250 mb-3">{idx + 1}. {q.question}</h4>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, oIdx) => {
                      const isCorrectOpt = oIdx === q.correctOption
                      const isUserChoice = oIdx === uChoice
                      let optStyle = 'bg-zinc-950/20 text-zinc-550 border border-zinc-850'
                      if (isCorrectOpt) optStyle = 'bg-emerald-500/10 text-emerald-400 border border-emerald-555/20 font-bold'
                      else if (isUserChoice) optStyle = 'bg-rose-500/10 text-rose-400 border border-rose-555/20 font-bold'

                      return (
                        <div key={oIdx} className={`p-2.5 rounded-xl border ${optStyle}`}>{opt}</div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen text-zinc-100 p-6 max-w-2xl mx-auto flex flex-col justify-center animate-fade-in space-y-6">
        {/* Navigation Indicator */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-400">Round {currentRound} Assessment</span>
            <h2 className="text-sm font-bold text-zinc-200 mt-0.5">{selectedCompany} Simulated Screening</h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1.5 rounded-full border border-rose-500/20 animate-time-pulse">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] text-zinc-400 font-bold bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded-full">
              Q: {currentQuestionIdx + 1} / {activeQuizQuestions.length}
            </span>
          </div>
        </div>

        {/* Question Panel */}
        <div className="glass-card rounded-2xl p-6 border border-zinc-805 bg-zinc-900/10 space-y-5">
          <h2 className="text-sm font-bold text-zinc-150 leading-relaxed">{currentQuestion.question}</h2>

          <div className="space-y-2.5">
            {currentQuestion.options.map((option, index) => {
              const isSelected = userChoice === index
              let style = 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-850 text-zinc-300'
              if (isSelected) {
                style = 'bg-indigo-500/5 border-indigo-500/40 text-indigo-300 font-bold shadow-md shadow-indigo-500/5'
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelectOption(index)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${style}`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsRoundActive(false)}
            className="flex items-center gap-1 text-xs text-zinc-550 hover:text-zinc-350 transition-all font-semibold cursor-pointer"
          >
            <AlertCircle className="h-4 w-4" /> Quit to Roadmap
          </button>

          <div className="flex gap-2">
            {currentQuestionIdx > 0 && (
              <button
                onClick={() => setCurrentQuestionIdx((prev) => prev - 1)}
                className="px-4.5 py-2.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border border-zinc-800 cursor-pointer"
              >
                Previous
              </button>
            )}

            {currentQuestionIdx < activeQuizQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                className="px-4.5 py-2.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border border-zinc-800 cursor-pointer"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleFinishMCQRound}
                disabled={userChoice === undefined}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  userChoice !== undefined
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/20 cursor-pointer shadow-lg shadow-indigo-600/10'
                    : 'bg-zinc-900 text-zinc-650 border-zinc-800/80 cursor-not-allowed'
                }`}
              >
                Submit Round
              </button>
            )}
          </div>
        </div>

        {showWarningModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="glass-card rounded-3xl p-8 border border-rose-500/20 max-w-sm w-full space-y-6 bg-zinc-900/90 text-center shadow-2xl shadow-rose-500/10">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
                <ShieldAlert className="h-6 w-6 text-rose-400" />
              </div>
              <div>
                <h2 className="text-base font-black text-zinc-100 tracking-tight">Proctoring Warning</h2>
                <p className="text-xs text-rose-400 mt-2 font-bold uppercase tracking-wide">
                  Violation {violationsCount} of 3
                </p>
                <p className="text-[11px] text-zinc-400 mt-2.5 leading-relaxed font-medium">
                  Suspicious Activity: <span className="text-zinc-250 font-bold">{warningMessage}</span>.
                </p>
                <p className="text-[10px] text-zinc-550 mt-4 leading-normal">
                  Please focus on the exam window. You will be disqualified and your test auto-submitted after 3 violations.
                </p>
              </div>
              <button
                onClick={async () => {
                  setShowWarningModal(false)
                  try {
                    if (!document.fullscreenElement) {
                      await document.documentElement.requestFullscreen()
                    }
                  } catch (err) {
                    console.error(err)
                  }
                }}
                className="w-full py-3 rounded-xl text-xs font-bold bg-rose-650 hover:bg-rose-500 text-white transition-all cursor-pointer border border-rose-500/20"
              >
                Resume Test
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Interview Roadmap Funnel for Selected Company
  if (selectedCompany) {
    const rounds = getCompanyRounds(selectedCompany)
    const allCompleted = rounds.every(r => completedRounds[r.id])

    return (
      <div className="min-h-screen text-zinc-100 p-6 max-w-3xl mx-auto animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Company Funnel</span>
            <h1 className="text-3xl font-black text-zinc-100 mt-0.5">{selectedCompany} Recruitment Path</h1>
          </div>
          <button onClick={quitCompany} className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-all font-semibold cursor-pointer">
            <ArrowLeft size={14} /> All Companies
          </button>
        </div>

        {/* Status indicator if hired */}
        {allCompleted && (
          <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 bg-emerald-950/5 text-center space-y-3.5 animate-fade-in">
            <UserCheck className="h-10 w-10 text-emerald-400 mx-auto" />
            <div>
              <h2 className="text-md font-bold text-zinc-100">Congratulations! You are Hired!</h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                You have successfully cleared all {rounds.length} interview rounds of {selectedCompany}. Mock test stats have been updated in your dashboard.
              </p>
            </div>
            <button
              onClick={() => resetRoadmap(selectedCompany)}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-350 hover:bg-zinc-800 rounded-xl mx-auto transition-all cursor-pointer"
            >
              <RefreshCw size={13} /> Retake Pathway
            </button>
          </div>
        )}

        {/* Roadmap Stages */}
        <div className="space-y-4">
          {rounds.map((round) => {
            const isUnlocked = unlockedRounds[round.id]
            const isCompleted = completedRounds[round.id]
            const isActive = isUnlocked && !isCompleted

            let borderStyle = 'border-zinc-850'
            let bgStyle = 'bg-zinc-900/5 opacity-55'
            
            if (isCompleted) {
              borderStyle = 'border-emerald-500/20'
              bgStyle = 'bg-emerald-950/2'
            } else if (isActive) {
              borderStyle = 'border-indigo-500/30 shadow-md shadow-indigo-500/2'
              bgStyle = 'bg-zinc-900/10'
            }

            return (
              <div
                key={round.id}
                className={`glass-card rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${borderStyle} ${bgStyle}`}
              >
                <div className="flex items-start gap-4">
                  {/* Status indicator badge */}
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 flex-shrink-0 flex items-center justify-center h-12 w-12 text-zinc-500">
                    {isCompleted ? (
                      <CheckCircle className="text-emerald-400" size={20} />
                    ) : isUnlocked ? (
                      <ThumbsUp className="text-indigo-400" size={20} />
                    ) : (
                      <Lock className="text-zinc-650" size={18} />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-zinc-200">{round.name}</h3>
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-zinc-950/80 rounded border border-zinc-850 text-zinc-500 font-mono">
                        {round.type}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium mt-1">{round.desc}</p>
                  </div>
                </div>

                {/* Navigation trigger button */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {isCompleted ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                      Cleared
                    </span>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => startInterviewRound(round.id)}
                      className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/20 shadow-md shadow-indigo-500/10 transition-all cursor-pointer"
                    >
                      Start Round
                      <ChevronRight size={13} />
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 bg-zinc-950/80 border border-zinc-850 px-3 py-1.5 rounded-full flex items-center gap-1">
                      <Lock size={10} /> Locked
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Categories Landing grid view
  return (
    <div className="p-6 text-zinc-100 min-h-screen animate-fade-in space-y-6">
      <div className="pb-2 border-b border-zinc-900">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Assessments</span>
        <h1 className="text-3xl font-black tracking-tight mt-0.5">Company Tests</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Select corporations to start dynamic simulated recruitment pathways. Contains Aptitude, English, screening, and built-in coding compilers.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Tier-1 Product Giants */}
        <div className="glass-card rounded-2xl p-5 border border-zinc-800/80 bg-zinc-900/5 flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Cpu size={18} />
            </div>
            <h2 className="text-sm font-bold tracking-tight text-zinc-200 font-sans">Product Giants</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 flex-grow">
            {productCompanies.map((company) => (
              <button
                key={company}
                onClick={() => handleStartTest(company)}
                className="text-left px-3 py-2.5 rounded-xl bg-zinc-900/60 hover:bg-indigo-600 border border-zinc-800 text-xs font-semibold hover:text-white hover:border-indigo-500 transition-all duration-200 cursor-pointer"
              >
                {company}
              </button>
            ))}
          </div>
        </div>

        {/* Service Based Firms */}
        <div className="glass-card rounded-2xl p-5 border border-zinc-800/80 bg-zinc-900/5 flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Building size={18} />
            </div>
            <h2 className="text-sm font-bold tracking-tight text-zinc-200 font-sans">Service Firms</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 flex-grow">
            {serviceCompanies.map((company) => (
              <button
                key={company}
                onClick={() => handleStartTest(company)}
                className="text-left px-3 py-2.5 rounded-xl bg-zinc-900/60 hover:bg-violet-600 border border-zinc-800 text-xs font-semibold hover:text-white hover:border-violet-500 transition-all duration-200 cursor-pointer"
              >
                {company}
              </button>
            ))}
          </div>
        </div>

        {/* Indian Startups */}
        <div className="glass-card rounded-2xl p-5 border border-zinc-800/80 bg-zinc-900/5 flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap size={18} />
            </div>
            <h2 className="text-sm font-bold tracking-tight text-zinc-200 font-sans">Indian Startups</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 flex-grow">
            {startups.map((company) => (
              <button
                key={company}
                onClick={() => handleStartTest(company)}
                className="text-left px-3 py-2.5 rounded-xl bg-zinc-900/60 hover:bg-cyan-600 border border-zinc-800 text-xs font-semibold hover:text-white hover:border-cyan-500 transition-all duration-200 cursor-pointer"
              >
                {company}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  function handleStartTest(companyName: string) {
    setSelectedCompany(companyName)
    resetRoadmap(companyName)
  }
}

export default Test
