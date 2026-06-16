import { NextResponse } from 'next/server'

interface TestCase {
  input: string
  output: string
}

// HackerEarth v4 language identifiers
const LANG_MAP: Record<string, string> = {
  python: 'PYTHON3',
  javascript: 'JAVASCRIPT_NODE',
  cpp: 'CPP17',
  java: 'JAVA8',
}

const HE_API = 'https://api.hackerearth.com/v4/partner/code-evaluation/submissions/'
const MAX_POLL_ATTEMPTS = 20   // poll up to 20 times
const POLL_INTERVAL_MS = 1500  // every 1.5 seconds

function normalizeOutput(s: string): string {
  return (s || '').trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function submitAndPoll(
  clientId: string,
  clientSecret: string,
  source: string,
  lang: string,
  input: string,
  expectedOutput: string,
  index: number
): Promise<object> {
  // Step 1: Submit
  const submitRes = await fetch(HE_API, {
    method: 'POST',
    headers: {
      'client-id': clientId,
      'client-secret': clientSecret,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      lang,
      source,
      input,
      memory_limit: 262144,
      time_limit: 5,
    }),
  })

  if (!submitRes.ok) {
    const text = await submitRes.text()
    return {
      index,
      status: { description: 'Submission Error' },
      stdout: null,
      stderr: `HackerEarth API error (${submitRes.status}): ${text}`,
      compile_output: null,
      passed: false,
    }
  }

  const submitData = await submitRes.json()
  const heId: string = submitData.he_id
  const statusUrl = `${HE_API}${heId}/`

  if (!heId) {
    return {
      index,
      status: { description: 'No submission ID returned' },
      stdout: null,
      stderr: JSON.stringify(submitData),
      compile_output: null,
      passed: false,
    }
  }

  // Step 2: Poll until REQUEST_COMPLETED
  let pollAttempts = 0
  while (pollAttempts < MAX_POLL_ATTEMPTS) {
    await sleep(POLL_INTERVAL_MS)
    pollAttempts++

    const statusRes = await fetch(statusUrl, {
      headers: {
        'client-id': clientId,
        'client-secret': clientSecret,
      },
    })

    if (!statusRes.ok) continue

    const statusData = await statusRes.json()
    const code: string = statusData.request_status?.code || ''

    if (code === 'REQUEST_COMPLETED') {
      const result = statusData.result || {}
      const runResult = result.run_status || {}
      const compileResult = result.compile_status || {}

      const stdout = normalizeOutput(runResult.output || '')
      const stderr = normalizeOutput(runResult.stderr || runResult.signal || '')
      const compileOutput = normalizeOutput(compileResult.message || '')
      const statusDesc = runResult.status || compileResult.status || 'Unknown'
      const expected = normalizeOutput(expectedOutput)

      const passed =
        (runResult.status === 'AC' || runResult.exit_code === 0) &&
        stdout === expected

      return {
        index,
        status: { description: statusDesc },
        stdout,
        stderr,
        compile_output: compileOutput,
        passed,
      }
    }

    // Compile error — stop polling early
    if (code === 'REQUEST_COMPILE_FAILED') {
      const result = statusData.result || {}
      const compileResult = result.compile_status || {}
      return {
        index,
        status: { description: 'Compile Error' },
        stdout: null,
        stderr: null,
        compile_output: normalizeOutput(compileResult.message || 'Compilation failed.'),
        passed: false,
      }
    }
  }

  // Timed out waiting
  return {
    index,
    status: { description: 'Evaluation Timeout' },
    stdout: null,
    stderr: 'The evaluation server did not respond in time. Please try again.',
    compile_output: null,
    passed: false,
  }
}

export async function POST(req: Request) {
  try {
    const { source_code, language_id, test_cases } = await req.json()

    if (!source_code) {
      return NextResponse.json({ error: 'Source code is required' }, { status: 400 })
    }
    if (!language_id) {
      return NextResponse.json({ error: 'Language is required' }, { status: 400 })
    }
    if (!test_cases || !Array.isArray(test_cases)) {
      return NextResponse.json({ error: 'Test cases must be an array' }, { status: 400 })
    }

    const clientSecret = process.env.CLIENT_SECRET_KEY
    const clientId = process.env.CLIENT_ID
    if (!clientSecret || !clientId || clientSecret === 'your_hackerearth_api_key_here') {
      return NextResponse.json({
        results: test_cases.map((_: TestCase, index: number) => ({
          index,
          status: { description: 'API Credentials Not Configured' },
          stdout: null,
          stderr: 'CLIENT_ID or CLIENT_SECRET_KEY is not set in environment variables.',
          compile_output: null,
          passed: false,
        }))
      })
    }

    // Map our language name to HackerEarth language code
    const lang = LANG_MAP[language_id] || LANG_MAP['python']

    // Run test cases sequentially to avoid rate limiting
    const results: object[] = []
    for (let i = 0; i < test_cases.length; i++) {
      const tc: TestCase = test_cases[i]
      const result = await submitAndPoll(
        clientId,
        clientSecret,
        source_code,
        lang,
        tc.input,
        tc.output,
        i
      )
      results.push(result)
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    console.error('Compiler proxy error:', error)
    return NextResponse.json(
      { error: 'Server error compiling code: ' + error.message },
      { status: 500 }
    )
  }
}
