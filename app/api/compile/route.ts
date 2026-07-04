import { NextResponse } from 'next/server'

interface TestCase {
  input: string
  output: string
}

// Maps our language names to onlinecompiler.io compiler IDs
const COMPILER_MAP: Record<string, string> = {
  python: 'python-3.14',
  javascript: 'typescript-deno',
  cpp: 'g++-15',
  java: 'openjdk-25',
}

function normalizeOutput(s: string): string {
  return (s || '').trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

async function runTestCase(
  apiKey: string,
  source: string,
  compilerId: string,
  tc: TestCase,
  index: number
): Promise<object> {
  try {
    const res = await fetch('https://api.onlinecompiler.io/api/run-code-sync/', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        compiler: compilerId,
        code: source,
        input: tc.input,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      return {
        index,
        status: { description: 'API Error' },
        stdout: null,
        stderr: `OnlineCompiler API error (${res.status}): ${text}`,
        compile_output: null,
        passed: false,
      }
    }

    const data = await res.json()
    const stdout = normalizeOutput(data.output || '')
    const expected = normalizeOutput(tc.output)
    const passed = data.exit_code === 0 && stdout === expected

    // If it failed with non-zero exit code, classify error
    const hasError = data.exit_code !== 0 || !!data.error
    let errorDescription = 'Failed'
    if (hasError) {
      errorDescription = data.error && (data.error.includes('error:') || data.error.includes('Compilation failed')) 
        ? 'Compile Error' 
        : 'Runtime Error'
    }

    return {
      index,
      status: { description: passed ? 'Passed' : errorDescription },
      stdout: data.output || '',
      stderr: data.error || '',
      compile_output: data.exit_code !== 0 ? data.error : null,
      passed,
    }
  } catch (error: any) {
    return {
      index,
      status: { description: 'Server Exception' },
      stdout: null,
      stderr: error.message || 'Unknown network error',
      compile_output: null,
      passed: false,
    }
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

    const apiKey = process.env.ONLINE_COMPILER_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        results: test_cases.map((_: TestCase, index: number) => ({
          index,
          status: { description: 'API Key Not Configured' },
          stdout: null,
          stderr: 'ONLINE_COMPILER_API_KEY is not set in environment variables.',
          compile_output: null,
          passed: false,
        }))
      })
    }

    // Map UI language to onlinecompiler.io compiler ID
    const compilerId = COMPILER_MAP[language_id] || COMPILER_MAP['python']

    // Evaluate all test cases concurrently for speed
    const evalPromises = test_cases.map((tc, index) =>
      runTestCase(apiKey, source_code, compilerId, tc, index)
    )
    const results = await Promise.all(evalPromises)

    return NextResponse.json({ results })
  } catch (error: any) {
    console.error('Compiler proxy error:', error)
    return NextResponse.json(
      { error: 'Server error compiling code: ' + error.message },
      { status: 500 }
    )
  }
}
