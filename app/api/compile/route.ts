import { NextResponse } from 'next/server'

interface TestCase {
  input: string
  output: string
}

export async function POST(req: Request) {
  try {
    const { source_code, language_id, test_cases } = await req.json()

    if (!source_code) {
      return NextResponse.json({ error: 'Source code is required' }, { status: 400 })
    }
    if (!language_id) {
      return NextResponse.json({ error: 'Language ID is required' }, { status: 400 })
    }
    if (!test_cases || !Array.isArray(test_cases)) {
      return NextResponse.json({ error: 'Test cases must be an array' }, { status: 400 })
    }

    const judge0Url = process.env.JUDGE0_API_URL || 'http://localhost:2358'

    // Encode strings to base64
    const b64Source = Buffer.from(source_code).toString('base64')

    // Submit each testcase in parallel
    const submissionPromises = test_cases.map(async (tc: TestCase, index: number) => {
      const b64Input = Buffer.from(tc.input).toString('base64')
      const b64Output = Buffer.from(tc.output).toString('base64')

      try {
        const res = await fetch(`${judge0Url}/submissions?base64_encoded=true&wait=true`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source_code: b64Source,
            language_id: Number(language_id),
            stdin: b64Input,
            expected_output: b64Output,
          }),
        })

        if (!res.ok) {
          const text = await res.text()
          return {
            index,
            status: { id: 13, description: 'Internal Error' },
            stdout: null,
            stderr: `Judge0 returned error code ${res.status}: ${text}`,
            compile_output: null,
            passed: false,
          }
        }

        const data = await res.json()

        const decodedStdout = data.stdout ? Buffer.from(data.stdout, 'base64').toString('utf-8') : ''
        const decodedStderr = data.stderr ? Buffer.from(data.stderr, 'base64').toString('utf-8') : ''
        const decodedCompile = data.compile_output ? Buffer.from(data.compile_output, 'base64').toString('utf-8') : ''

        return {
          index,
          status: data.status || { id: 13, description: 'Unknown' },
          stdout: decodedStdout,
          stderr: decodedStderr,
          compile_output: decodedCompile,
          passed: data.status?.id === 3, // 3 means "Accepted"
        }
      } catch (err: any) {
        console.error(`Error compiling testcase ${index}:`, err)
        return {
          index,
          status: { id: 13, description: 'Judge0 Offline' },
          stdout: null,
          stderr: `Failed to connect to Judge0 compiler at ${judge0Url}. Please make sure your self-hosted compiler is running.`,
          compile_output: null,
          passed: false,
        }
      }
    })

    const results = await Promise.all(submissionPromises)

    return NextResponse.json({ results })
  } catch (error: any) {
    console.error('Compiler proxy error:', error)
    return NextResponse.json({ error: 'Server error compiling code: ' + error.message }, { status: 500 })
  }
}
