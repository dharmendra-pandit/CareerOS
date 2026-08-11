'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft } from 'lucide-react'

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
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [selectingRole, setSelectingRole] = useState<boolean>(false)

  const getCompanyCategory = (company: string) => {
    if (productCompanies.includes(company)) return 'product'
    if (serviceCompanies.includes(company)) return 'service'
    return 'startup'
  }

  const getCompanyRounds = (company: string, role: string | null = null) => {
    const category = getCompanyCategory(company)
    const activeRole = role || selectedRole || 'Software Engineer'
    if (category === 'product') {
      return [
        { id: 1, name: 'Round 1: Aptitude Assessment', type: 'Aptitude MCQ', desc: '10 mathematical, logic and analytical queries. Passing: 60%' },
        { id: 2, name: 'Round 2: English & Verbal Ability', type: 'English MCQ', desc: '10 reading comprehension, grammar and vocabulary questions. Passing: 60%' },
        { id: 3, name: `Round 3: ${activeRole} Technical Core`, type: 'Technical MCQ', desc: `10 specialized questions on ${activeRole} concepts, frameworks, and syntax. Passing: 60%` },
        { id: 4, name: `Round 4: ${activeRole} Practical Coding`, type: 'Code Editor', desc: `1 practical algorithmic challenge compiling against the compiler.` },
        { id: 5, name: `Round 5: ${activeRole === 'Software Engineer' ? 'System Architecture' : activeRole === 'AI/ML' ? 'ML Ops & Data Pipelines' : activeRole === 'DevOps' ? 'Infrastructure & Scaling' : 'API Scale & State Design'}`, type: 'Design MCQ', desc: '10 scale-design, deployment, and performance scaling queries. Passing: 60%' },
        { id: 6, name: 'Round 6: Tricky Logic & Debugging', type: 'Logic MCQ', desc: '10 code-trace logic puzzles, pointer arithmetic, and dry-run execution tasks. Passing: 60%' },
        { id: 7, name: 'Round 7: Cultural & Behavioral Fit', type: 'Scenario MCQ', desc: '10 workplace situational dilemmas and leadership queries. Passing: 60%' },
      ]
    }
    if (category === 'service') {
      return [
        { id: 1, name: 'Round 1: Aptitude Assessment', type: 'Aptitude MCQ', desc: '10 basic math, quantitative reasoning, and patterns problems. Passing: 60%' },
        { id: 2, name: 'Round 2: English & Communication', type: 'English MCQ', desc: '10 verbal logic, grammar correction and sentence structure tasks. Passing: 60%' },
        { id: 3, name: `Round 3: ${activeRole} Core Fundamentals`, type: 'Technical MCQ', desc: `10 specialized questions on basic ${activeRole} structures and OOPs. Passing: 60%` },
        { id: 4, name: `Round 4: ${activeRole} Practical Coding`, type: 'Code Editor', desc: `1 programming task compiling in the visual code editor.` },
        { id: 5, name: 'Round 5: Technical & HR Fit', type: 'HR MCQ', desc: '10 project-handling, client relation, and workplace policy queries. Passing: 60%' },
      ]
    }
    return [
      { id: 1, name: 'Round 1: Aptitude Assessment', type: 'Aptitude MCQ', desc: '10 analytical puzzles, quick math, and logical reasoning under pressure. Passing: 60%' },
      { id: 2, name: `Round 2: ${activeRole} Technical Core`, type: 'Technical MCQ', desc: `10 specialized questions on language variables, loops, async logic, and algorithms. Passing: 60%` },
      { id: 3, name: `Round 3: ${activeRole} Practical Coding`, type: 'Code Editor', desc: `1 intense deployment scripting or algorithm task in the IDE.` },
      { id: 4, name: `Round 4: ${activeRole === 'Software Engineer' ? 'High-Scale Systems' : activeRole === 'AI/ML' ? 'Large-Scale Data Engineering' : activeRole === 'DevOps' ? 'Kubernetes & Scaling' : 'Web & Caching Scaling'}`, type: 'Systems MCQ', desc: '10 database schema design, request handling, and caching decision queries. Passing: 60%' },
    ]
  }

  // Funnel state
  const [currentRound, setCurrentRound] = useState<number>(1)
  const [unlockedRounds, setUnlockedRounds] = useState<Record<number, boolean>>({ 1: true })
  const [completedRounds, setCompletedRounds] = useState<Record<number, boolean>>({})

  // Active generation states
  const [loading, setLoading] = useState(false)
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<Question[]>([])
  const [activeCodingProblem, setActiveCodingProblem] = useState<CodingProblem | null>(null)

  // CBT Examination States
  const [isRoundActive, setIsRoundActive] = useState(false)
  const [roundFinished, setRoundFinished] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({}) // qId -> optionIndex
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({}) // qId -> boolean
  const [visitedQuestions, setVisitedQuestions] = useState<Record<number, boolean>>({}) // qId -> boolean
  const [timeLeft, setTimeLeft] = useState(360)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Code Editor states
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'javascript' | 'cpp' | 'java'>('python')
  const [codeText, setCodeText] = useState('')
  const [consoleOutput, setConsoleOutput] = useState('')
  const [compiling, setCompiling] = useState(false)
  const [testCaseResults, setTestCaseResults] = useState<any[]>([])
  const [codingSolvedVerified, setCodingSolvedVerified] = useState(false)

  // Format Timer
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`
  }

  // Timer Effect
  useEffect(() => {
    if (isRoundActive && !roundFinished && !loading) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current)
            handleFinishRound()
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
  }, [isRoundActive, roundFinished, loading])

  // Track Visited Question
  useEffect(() => {
    if (activeQuizQuestions.length > 0 && activeQuizQuestions[currentQuestionIdx]) {
      const qId = activeQuizQuestions[currentQuestionIdx].id
      setVisitedQuestions((prev) => ({ ...prev, [qId]: true }))
    }
  }, [currentQuestionIdx, activeQuizQuestions])

  const handleSelectCompany = (company: string) => {
    setSelectedCompany(company)
    setSelectingRole(true)
  }

  const handleSelectRole = (role: string) => {
    setSelectedRole(role)
    setSelectingRole(false)
    setCurrentRound(1)
    setUnlockedRounds({ 1: true })
    setCompletedRounds({})
  }

  const handleStartRound = async (roundId: number) => {
    if (!selectedCompany) return
    setCurrentRound(roundId)
    setLoading(true)
    setIsRoundActive(false)
    setRoundFinished(false)
    setShowSubmitModal(false)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'test',
          company: selectedCompany,
          role: selectedRole || 'Software Engineer',
          round: roundId,
          timestamp: Date.now()
        })
      })

      const data = await res.json()
      if (data.codingProblem) {
        setActiveCodingProblem(data.codingProblem)
        setActiveQuizQuestions([])
        const initialCode = data.codingProblem.starterTemplates?.[selectedLanguage] || '# Write code solution here\n'
        setCodeText(initialCode)
        setTimeLeft(1200)
      } else if (data.questions) {
        setActiveQuizQuestions(data.questions)
        setActiveCodingProblem(null)
        setTimeLeft(360)
      }
      setIsRoundActive(true)
    } catch (err) {
      console.error('Error starting round:', err)
    } finally {
      setLoading(false)
      setCurrentQuestionIdx(0)
      setSelectedAnswers({})
      setMarkedForReview({})
      setVisitedQuestions({})
      setConsoleOutput('')
      setTestCaseResults([])
      setCodingSolvedVerified(false)
    }
  }

  const handleOptionSelect = (qId: number, optionIdx: number) => {
    if (roundFinished) return
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx
    }))
  }

  const handleClearResponse = () => {
    if (activeQuizQuestions[currentQuestionIdx]) {
      const qId = activeQuizQuestions[currentQuestionIdx].id
      setSelectedAnswers((prev) => {
        const next = { ...prev }
        delete next[qId]
        return next
      })
    }
  }

  const handleMarkForReview = () => {
    if (activeQuizQuestions[currentQuestionIdx]) {
      const qId = activeQuizQuestions[currentQuestionIdx].id
      setMarkedForReview((prev) => ({
        ...prev,
        [qId]: !prev[qId]
      }))
      if (currentQuestionIdx < activeQuizQuestions.length - 1) {
        setCurrentQuestionIdx((prev) => prev + 1)
      }
    }
  }

  const handleSaveAndNext = () => {
    if (currentQuestionIdx < activeQuizQuestions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1)
    }
  }

  const handleLanguageChange = (lang: 'python' | 'javascript' | 'cpp' | 'java') => {
    setSelectedLanguage(lang)
    if (activeCodingProblem?.starterTemplates?.[lang]) {
      setCodeText(activeCodingProblem.starterTemplates[lang])
    }
  }

  const handleCompileCode = async (isSubmitAll: boolean = false) => {
    if (!activeCodingProblem) return
    setCompiling(true)
    setConsoleOutput('Compiling code solution...')

    const testCasesToRun = isSubmitAll ? activeCodingProblem.testCases : activeCodingProblem.testCases.slice(0, 1)

    try {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLanguage,
          code: codeText,
          testCases: testCasesToRun
        })
      })

      const data = await res.json()
      setConsoleOutput(data.output || data.error || 'Execution finished.')

      if (data.results) {
        setTestCaseResults(data.results)
        const allPassed = data.results.every((r: any) => r.passed)
        if (allPassed && isSubmitAll) {
          setCodingSolvedVerified(true)
        }
      }
    } catch (err) {
      console.error('Compile error:', err)
      setConsoleOutput('Execution Error: Connection failed.')
    } finally {
      setCompiling(false)
    }
  }

  const handleFinishRound = async () => {
    setRoundFinished(true)
    setIsRoundActive(false)
    setShowSubmitModal(false)
    if (timerRef.current) clearInterval(timerRef.current)

    const rounds = getCompanyRounds(selectedCompany!, selectedRole)
    const isCodingRound = activeCodingProblem !== null

    let passed = false
    let finalScore = 0

    if (isCodingRound) {
      passed = codingSolvedVerified
      finalScore = passed ? 100 : 0
    } else {
      let correct = 0
      activeQuizQuestions.forEach((q) => {
        if (selectedAnswers[q.id] === q.correctOption) correct++
      })
      finalScore = Math.round((correct / activeQuizQuestions.length) * 100)
      passed = finalScore >= 60
    }

    if (passed) {
      setCompletedRounds((prev) => ({ ...prev, [currentRound]: true }))
      if (currentRound < rounds.length) {
        setUnlockedRounds((prev) => ({ ...prev, [currentRound + 1]: true }))
      }
    }

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `${selectedCompany} - Round ${currentRound}`,
          score: Math.round((finalScore / 100) * (isCodingRound ? 1 : activeQuizQuestions.length)),
          total: isCodingRound ? 1 : activeQuizQuestions.length,
          type: 'exam',
          difficulty: getCompanyCategory(selectedCompany!)
        })
      })
    } catch (err) {
      console.error('Error saving exam progress:', err)
    }
  }

  const handleResetToCompanies = () => {
    setSelectedCompany(null)
    setSelectedRole(null)
    setSelectingRole(false)
    setIsRoundActive(false)
    setRoundFinished(false)
    setShowSubmitModal(false)
    setActiveQuizQuestions([])
    setActiveCodingProblem(null)
  }

  if (loading) {
    return (
      <div className="p-6 text-zinc-100 min-h-screen max-w-7xl mx-auto flex flex-col items-center justify-center space-y-4 animate-fade-in font-mono">
        <div className="w-10 h-10 border-2 border-zinc-800 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          INITIALIZING EXAMINATION PAPER FOR {selectedCompany} (ROUND {currentRound})...
        </p>
      </div>
    )
  }

  // Active Round Assessment Screen (MCQ or Code Editor)
  if (isRoundActive || roundFinished) {
    const rounds = getCompanyRounds(selectedCompany!, selectedRole)
    const activeRoundInfo = rounds.find((r) => r.id === currentRound)
    const isCodingRound = activeCodingProblem !== null

    let scoreCount = 0
    if (roundFinished && !isCodingRound) {
      activeQuizQuestions.forEach((q) => {
        if (selectedAnswers[q.id] === q.correctOption) scoreCount++
      })
    }
    const passPercentage = !isCodingRound ? Math.round((scoreCount / (activeQuizQuestions.length || 1)) * 100) : (codingSolvedVerified ? 100 : 0)
    const isPassed = !isCodingRound ? passPercentage >= 60 : codingSolvedVerified

    const answeredCount = Object.keys(selectedAnswers).length
    const reviewCount = Object.values(markedForReview).filter(Boolean).length
    const notVisitedCount = activeQuizQuestions.length - Object.keys(visitedQuestions).length
    const notAnsweredCount = activeQuizQuestions.length - answeredCount

    return (
      <div className="p-4 sm:p-6 text-zinc-100 min-h-screen max-w-7xl mx-auto space-y-4 animate-fade-in font-sans">
        
        {/* Assessment Top Header */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsRoundActive(false)
                setRoundFinished(false)
              }}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Return to Assessment Roadmap"
            >
              <ArrowLeft size={16} />
            </button>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 tracking-wider block">
                {selectedCompany} • {selectedRole} RECRUITMENT PAPER
              </span>
              <h1 className="text-base sm:text-lg font-black uppercase text-zinc-100 mt-0.5">
                {activeRoundInfo?.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end md:self-auto font-mono">
            <div className="text-right bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl">
              <span className="text-[9px] uppercase font-bold text-zinc-500 block tracking-wider">TIME REMAINING</span>
              <span className="text-base sm:text-lg font-black text-emerald-400 tracking-wider">
                {formatTime(timeLeft)}
              </span>
            </div>

            {!roundFinished && (
              <button
                onClick={() => isCodingRound ? handleFinishRound() : setShowSubmitModal(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                SUBMIT ROUND
              </button>
            )}
          </div>
        </div>

        {/* Round Finished Summary */}
        {roundFinished ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-xl">
            <div className="space-y-2 border-b border-zinc-850 pb-6">
              <span
                className={`text-[10px] font-mono font-bold uppercase px-3 py-1 rounded border ${
                  isPassed
                    ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950 border-rose-800 text-rose-300'
                }`}
              >
                {isPassed ? 'ROUND CLEARED - QUALIFIED' : 'ROUND CUTOFF UNMET'}
              </span>

              <h2 className="text-2xl sm:text-3xl font-black text-zinc-100 uppercase tracking-tight">
                {isCodingRound
                  ? codingSolvedVerified ? 'ALL TEST CASES PASSED' : 'TEST CASES FAILED'
                  : `SCORE: ${scoreCount} / ${activeQuizQuestions.length} (${passPercentage}%)`}
              </h2>

              <p className="text-xs text-zinc-400 font-mono">
                {isPassed
                  ? `You have cleared Round ${currentRound}. Proceed to Round ${currentRound + 1}.`
                  : `Minimum passing threshold is 60%. Retake Round ${currentRound} to qualify.`}
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  setRoundFinished(false)
                  setIsRoundActive(false)
                }}
                className="px-6 py-3 rounded-xl text-xs font-bold font-mono uppercase bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                RETURN TO ASSESSMENT PIPELINE
              </button>
            </div>
          </div>
        ) : isCodingRound ? (
          /* IDE Code Compiler Screen */
          <div className="grid lg:grid-cols-2 gap-6 items-start font-sans">
            
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-5 shadow-xl">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 block">
                  PRACTICAL CODING PROBLEM
                </span>
                <h3 className="text-lg font-bold text-zinc-100 mt-0.5">{activeCodingProblem.title}</h3>
              </div>

              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block">PROBLEM STATEMENT</span>
                <p className="text-zinc-300 leading-relaxed font-normal bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
                  {activeCodingProblem.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">INPUT SPEC</span>
                  <span className="text-zinc-300 text-[11px] block">{activeCodingProblem.inputFormat}</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">OUTPUT SPEC</span>
                  <span className="text-zinc-300 text-[11px] block">{activeCodingProblem.outputFormat}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">SAMPLE CASE</span>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">INPUT</span>
                    <pre className="text-zinc-300 whitespace-pre-wrap">{activeCodingProblem.sampleInput}</pre>
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">OUTPUT</span>
                    <pre className="text-indigo-300 whitespace-pre-wrap">{activeCodingProblem.sampleOutput}</pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-3 font-mono">
                <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                  {(['python', 'javascript', 'cpp', 'java'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        selectedLanguage === lang
                          ? 'bg-indigo-600 text-white'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {lang === 'cpp' ? 'C++' : lang}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={compiling}
                    onClick={() => handleCompileCode(false)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all cursor-pointer"
                  >
                    RUN SAMPLE
                  </button>
                  <button
                    disabled={compiling}
                    onClick={() => handleCompileCode(true)}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold uppercase bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    {compiling ? 'COMPILING...' : 'SUBMIT CODE'}
                  </button>
                </div>
              </div>

              <textarea
                rows={14}
                value={codeText}
                onChange={(e) => setCodeText(e.target.value)}
                className="w-full text-xs font-mono rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-100 p-4 focus:border-indigo-500 outline-none leading-relaxed resize-none"
              />

              <div className="space-y-2 font-mono">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">EXECUTION CONSOLE</span>
                <pre className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 min-h-[90px] whitespace-pre-wrap leading-relaxed">
                  {consoleOutput || '// Click "RUN SAMPLE" or "SUBMIT CODE" to execute program.'}
                </pre>
              </div>

            </div>

          </div>
        ) : (
          /* MCQ Assessment Dual-Pane CBT Layout */
          <div className="grid lg:grid-cols-4 gap-4 items-start font-sans">
            
            {/* Question Paper Area */}
            <div className="lg:col-span-3 bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl flex flex-col justify-between min-h-[500px]">
              
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-3 font-mono">
                  <span className="text-xs font-bold uppercase text-indigo-400">
                    QUESTION NO. {currentQuestionIdx + 1} OF {activeQuizQuestions.length}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-zinc-500 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded">
                    SINGLE CHOICE (+1.0 MARKS)
                  </span>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
                  <p className="text-sm sm:text-base font-bold text-zinc-100 leading-relaxed">
                    {activeQuizQuestions[currentQuestionIdx]?.question}
                  </p>
                </div>

                <div className="space-y-3">
                  {activeQuizQuestions[currentQuestionIdx]?.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[activeQuizQuestions[currentQuestionIdx].id] === optIdx
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleOptionSelect(activeQuizQuestions[currentQuestionIdx].id, optIdx)}
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
                      markedForReview[activeQuizQuestions[currentQuestionIdx]?.id]
                        ? 'bg-purple-950 text-purple-300 border-purple-800'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-850'
                    }`}
                  >
                    {markedForReview[activeQuizQuestions[currentQuestionIdx]?.id] ? 'UNMARK REVIEW' : 'MARK FOR REVIEW & NEXT'}
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

            {/* Question Palette Sidebar */}
            <div className="lg:col-span-1 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-4 shadow-xl font-mono">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block tracking-wider border-b border-zinc-850 pb-2">
                QUESTION PALETTE
              </span>

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

              <div className="pt-2 border-t border-zinc-850">
                <span className="text-[9px] uppercase font-bold text-zinc-500 block mb-2">CHOOSE A QUESTION</span>
                <div className="grid grid-cols-5 gap-2">
                  {activeQuizQuestions.map((q, idx) => {
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
                  SUBMIT ROUND
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
                  Submit Assessment Round?
                </h3>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-2 text-xs font-mono text-zinc-300">
                <div className="flex justify-between py-1 border-b border-zinc-850">
                  <span>Total Questions:</span>
                  <span className="font-bold text-zinc-100">{activeQuizQuestions.length}</span>
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
                Are you sure you want to finish and submit your assessment round?
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono uppercase bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-850 cursor-pointer font-bold"
                >
                  CONTINUE TEST
                </button>
                <button
                  onClick={handleFinishRound}
                  className="px-5 py-2 rounded-xl text-xs font-mono uppercase bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 cursor-pointer font-bold"
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

  // Role Selection Modal
  if (selectingRole && selectedCompany) {
    return (
      <div className="p-6 text-zinc-100 min-h-screen max-w-4xl mx-auto space-y-6 animate-fade-in font-sans">
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-zinc-850 pb-4">
            <button
              onClick={() => setSelectingRole(false)}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-indigo-400 tracking-wider">
                TARGET COMPANY: {selectedCompany}
              </span>
              <h2 className="text-lg font-bold text-zinc-100 mt-0.5">
                SELECT ENGINEERING ROLE TRACK
              </h2>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { role: 'Software Engineer', desc: 'Core DSA, System Design, Algorithms & Practical Coding.' },
              { role: 'AI/ML', desc: 'Python, Math/NumPy, ML Pipelines & Vector Logic Coding.' },
              { role: 'DevOps', desc: 'Linux, Docker/K8s, Networking & Script Parser Coding.' },
              { role: 'MERN Stack', desc: 'React, Node, MongoDB, REST APIs & Config Integration Coding.' }
            ].map(({ role, desc }) => (
              <button
                key={role}
                onClick={() => handleSelectRole(role)}
                className="bg-zinc-900/60 rounded-2xl p-6 border border-zinc-800 hover:border-indigo-500/50 text-left transition-all duration-200 cursor-pointer space-y-2 group"
              >
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 block">
                  TRACK: {role}
                </span>
                <h3 className="text-base font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors">
                  {role} EXAMINATION SUITE
                </h3>
                <p className="text-[11px] text-zinc-400 font-normal leading-relaxed">
                  {desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Company Round Roadmap Funnel View
  if (selectedCompany && selectedRole) {
    const rounds = getCompanyRounds(selectedCompany, selectedRole)

    return (
      <div className="p-6 text-zinc-100 min-h-screen max-w-5xl mx-auto space-y-6 animate-fade-in font-sans">
        
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <button
              onClick={handleResetToCompanies}
              className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-indigo-400 hover:underline cursor-pointer mb-1"
            >
              <ArrowLeft size={12} />
              <span>BACK TO ALL COMPANIES</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100 uppercase">
              {selectedCompany} RECRUITMENT FUNNEL
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-normal">
              Track: <span className="text-indigo-300 font-bold">{selectedRole}</span> • Complete each round sequentially to qualify for final selection.
            </p>
          </div>
        </div>

        {/* Rounds Timeline Funnel */}
        <div className="space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
            SELECTION ROUNDS ({rounds.length} PIPELINE STAGES)
          </h2>

          <div className="space-y-3">
            {rounds.map((round) => {
              const isUnlocked = unlockedRounds[round.id] || false
              const isDone = completedRounds[round.id] || false

              return (
                <div
                  key={round.id}
                  className={`rounded-2xl p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-800/60'
                      : isUnlocked
                      ? 'bg-zinc-950 border-zinc-800 hover:border-indigo-500/50'
                      : 'bg-zinc-950/40 border-zinc-900 opacity-40'
                  }`}
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                        {round.type}
                      </span>
                      {isDone && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                          QUALIFIED
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-zinc-100">{round.name}</h3>
                    <p className="text-xs text-zinc-400 font-normal">{round.desc}</p>
                  </div>

                  <div className="self-end sm:self-center font-mono">
                    {isUnlocked ? (
                      <button
                        onClick={() => handleStartRound(round.id)}
                        className={`px-5 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border ${
                          isDone
                            ? 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-850'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/30 shadow-md shadow-indigo-600/20'
                        }`}
                      >
                        {isDone ? 'RETAKE PAPER' : 'START PAPER'}
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-zinc-600 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-850 cursor-not-allowed">
                        LOCKED
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    )
  }

  // Company Selection Main Dashboard View
  return (
    <div className="p-6 text-zinc-100 min-h-screen max-w-7xl mx-auto space-y-6 animate-fade-in relative font-sans">
      
      {/* Top Banner */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl z-10">
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-950 border border-indigo-800 text-indigo-300 inline-block">
            COMPANY EXAMINATION PIPELINE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100 uppercase">
            RECRUITMENT TEST DIRECTORY
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-normal">
            Select a target company to launch its official computer-based technical evaluation paper.
          </p>
        </div>
      </div>

      {/* Companies Grid Categories */}
      <div className="space-y-6">
        {/* Product Companies */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
            PRODUCT TECH COMPANIES
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {productCompanies.map((c) => (
              <button
                key={c}
                onClick={() => handleSelectCompany(c)}
                className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800 hover:border-indigo-500/50 text-left transition-all duration-200 cursor-pointer space-y-1 group"
              >
                <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 block">PRODUCT</span>
                <h3 className="text-sm font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors truncate">
                  {c}
                </h3>
              </button>
            ))}
          </div>
        </div>

        {/* Service Companies */}
        <div className="space-y-3 pt-4 border-t border-zinc-850">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
            SERVICE &amp; CONSULTING ENTERPRISE
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {serviceCompanies.map((c) => (
              <button
                key={c}
                onClick={() => handleSelectCompany(c)}
                className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800 hover:border-indigo-500/50 text-left transition-all duration-200 cursor-pointer space-y-1 group"
              >
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 block">ENTERPRISE</span>
                <h3 className="text-sm font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors truncate">
                  {c}
                </h3>
              </button>
            ))}
          </div>
        </div>

        {/* High-Growth Startups */}
        <div className="space-y-3 pt-4 border-t border-zinc-850">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
            HIGH-GROWTH TECH STARTUPS
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {startups.map((c) => (
              <button
                key={c}
                onClick={() => handleSelectCompany(c)}
                className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800 hover:border-indigo-500/50 text-left transition-all duration-200 cursor-pointer space-y-1 group"
              >
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block">STARTUP</span>
                <h3 className="text-sm font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors truncate">
                  {c}
                </h3>
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

export default Test
