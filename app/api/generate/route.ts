import { NextResponse } from 'next/server'

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

const getCompanyCategory = (company: string) => {
  if (productCompanies.includes(company)) return 'product'
  if (serviceCompanies.includes(company)) return 'service'
  return 'startup'
}

const OFFLINE_PRACTICE: Record<string, Record<string, Question[]>> = {
  python: {
    easy: [
      {
        id: 1,
        question: "What is the output of print(3 * 2)?",
        options: ["5", "6", "9", "33"],
        correctOption: 1,
        explanation: "Simple multiplication."
      },
      {
        id: 2,
        question: "Which of these is a valid integer variable?",
        options: ["x = 5", "x = '5'", "x = 5.0", "x = true"],
        correctOption: 0,
        explanation: "Integer assignment without quotes."
      }
    ],
    medium: [
      {
        id: 1,
        question: "What is the output of [x*2 for x in range(3)]?",
        options: ["[0, 2, 4]", "[0, 1, 2]", "[2, 4, 6]", "[0, 2, 4, 6]"],
        correctOption: 0,
        explanation: "List comprehension iterating 0 to 2."
      }
    ],
    hard: [
      {
        id: 1,
        question: "What is the time complexity of dictionary lookups in Python on average?",
        options: ["O(1)", "O(log N)", "O(N)", "O(N^2)"],
        correctOption: 0,
        explanation: "Average case hash lookup."
      }
    ]
  }
}

// Generate fallback 20 questions in case of offline or errors
const generateFallbackPracticeQuestions = (topic: string, difficulty: string): Question[] => {
  const list: Question[] = []
  const baseTopic = topic.toLowerCase()
  
  if (OFFLINE_PRACTICE[baseTopic]?.[difficulty]) {
    const predefined = OFFLINE_PRACTICE[baseTopic][difficulty]
    for (let i = 0; i < 20; i++) {
      const q = predefined[i % predefined.length]
      list.push({
        ...q,
        id: i + 1,
        question: `[Q${i + 1}] (${difficulty.toUpperCase()}) ${q.question}`
      })
    }
    return list
  }

  for (let i = 1; i <= 20; i++) {
    list.push({
      id: i,
      question: `Standard conceptual assessment question ${i} on the topic of ${topic} (${difficulty} level).`,
      options: [
        `Optimal answer option A for concept ${i}`,
        `Secondary fallback option B`,
        `Incorrect alternative C`,
        `Incorrect alternative D`
      ],
      correctOption: 0,
      explanation: `Correct concept explanation ${i}.`
    })
  }
  return list
}

const OFFLINE_CODING_FALLBACKS: Record<string, CodingProblem> = {
  product: {
    title: "Merge k Sorted Lists",
    description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    constraints: "k == lists.length, 0 <= k <= 100, 0 <= lists[i].length <= 100",
    inputFormat: "The first line contains k, the number of lists. The next k lines contain space-separated integers representing each sorted list.",
    outputFormat: "Print the space-separated values of the merged sorted list.",
    sampleInput: "3\n1 4 5\n1 3 4\n2 6",
    sampleOutput: "1 1 2 3 4 4 5 6",
    testCases: [
      { input: "3\n1 4 5\n1 3 4\n2 6", output: "1 1 2 3 4 4 5 6" },
      { input: "2\n1 3\n2 4", output: "1 2 3 4" },
      { input: "1\n5 10", output: "5 10" }
    ],
    starterTemplates: {
      python: `import sys\n\ndef solve():\n    lines = sys.stdin.read().splitlines()\n    if not lines:\n        return\n    k = int(lines[0])\n    merged = []\n    for i in range(1, k + 1):\n        if i < len(lines) and lines[i].strip():\n            merged.extend(map(int, lines[i].split()))\n    merged.sort()\n    print(*(merged))\n\nif __name__ == '__main__':\n    solve()`,
      javascript: `const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf-8');\n    const lines = input.trim().split('\\n');\n    if (lines.length === 0 || !lines[0]) return;\n    const k = parseInt(lines[0]);\n    let merged = [];\n    for (let i = 1; i <= k; i++) {\n        if (lines[i] && lines[i].trim()) {\n            merged.push(...lines[i].trim().split(/\\s+/).map(Number));\n        }\n    }\n    merged.sort((a, b) => a - b);\n    console.log(merged.join(' '));\n}\n\nsolve();`,
      cpp: `#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <string>\n#include <sstream>\nusing namespace std;\n\nint main() {\n    int k;\n    if (!(cin >> k)) return 0;\n    string line;\n    getline(cin, line); // consume remainder of line\n    vector<int> merged;\n    for (int i = 0; i < k; ++i) {\n        if (getline(cin, line)) {\n            stringstream ss(line);\n            int num;\n            while (ss >> num) {\n                merged.push_back(num);\n            }\n        }\n    }\n    sort(merged.begin(), merged.end());\n    for (size_t i = 0; i < merged.size(); ++i) {\n        cout << merged[i] << (i + 1 == merged.size() ? "" : " ");\n    }\n    cout << endl;\n    return 0;\n}`,
      java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String kStr = br.readLine();\n        if (kStr == null) return;\n        int k = Integer.parseInt(kStr.trim());\n        List<Integer> list = new ArrayList<>();\n        for (int i = 0; i < k; i++) {\n            String line = br.readLine();\n            if (line == null) break;\n            if (line.trim().isEmpty()) continue;\n            String[] parts = line.trim().split("\\\\s+");\n            for (String part : parts) {\n                list.add(Integer.parseInt(part));\n            }\n        }\n        Collections.sort(list);\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < list.size(); i++) {\n            sb.append(list.get(i)).append(i + 1 == list.size() ? "" : " ");\n        }\n        System.out.println(sb.toString());\n    }\n}`
    }
  },
  service: {
    title: "Two Sum",
    description: "Given an array of integers, return indices of the two numbers such that they add up to a specific target.",
    constraints: "2 <= nums.length <= 1000, -1000 <= nums[i] <= 1000",
    inputFormat: "The first line contains space-separated integers representing the array. The second line contains the target sum.",
    outputFormat: "Print the indices of the two numbers separated by a space.",
    sampleInput: "2 7 11 15\n9",
    sampleOutput: "0 1",
    testCases: [
      { input: "2 7 11 15\n9", output: "0 1" },
      { input: "3 2 4\n6", output: "1 2" },
      { input: "3 3\n6", output: "0 1" }
    ],
    starterTemplates: {
      python: `import sys\n\ndef solve():\n    lines = sys.stdin.read().splitlines()\n    if len(lines) < 2:\n        return\n    nums = list(map(int, lines[0].split()))\n    target = int(lines[1])\n    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):\n            if nums[i] + nums[j] == target:\n                print(f"{i} {j}")\n                return\n\nif __name__ == '__main__':\n    solve()`,
      javascript: `const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf-8');\n    const lines = input.trim().split('\\n');\n    if (lines.length < 2) return;\n    const nums = lines[0].trim().split(/\\s+/).map(Number);\n    const target = parseInt(lines[1]);\n    for (let i = 0; i < nums.length; i++) {\n        for (let j = i + 1; j < nums.length; j++) {\n            if (nums[i] + nums[j] === target) {\n                console.log(i + " " + j);\n                return;\n            }\n        }\n    }\n}\n\nsolve();`,
      cpp: `#include <iostream>\n#include <vector>\n#include <string>\n#include <sstream>\nusing namespace std;\n\nint main() {\n    string line;\n    if (!getline(cin, line)) return 0;\n    stringstream ss(line);\n    vector<int> nums;\n    int num;\n    while (ss >> num) {\n        nums.push_back(num);\n    }\n    int target;\n    if (!(cin >> target)) return 0;\n    for (size_t i = 0; i < nums.size(); ++i) {\n        for (size_t j = i + 1; j < nums.size(); ++j) {\n            if (nums[i] + nums[j] == target) {\n                cout << i << " " << j << endl;\n                return 0;\n            }\n        }\n    }\n    return 0;\n}`,
      java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String firstLine = br.readLine();\n        String secondLine = br.readLine();\n        if (firstLine == null || secondLine == null) return;\n        String[] parts = firstLine.trim().split("\\\\s+");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) {\n            nums[i] = Integer.parseInt(parts[i]);\n        }\n        int target = Integer.parseInt(secondLine.trim());\n        for (int i = 0; i < nums.length; i++) {\n            for (int j = i + 1; j < nums.length; j++) {\n                if (nums[i] + nums[j] == target) {\n                    System.out.println(i + " " + j);\n                    return;\n                }\n            }\n        }\n    }\n}`
    }
  },
  startup: {
    title: "Valid Parentheses",
    description: "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    constraints: "1 <= s.length <= 1000, s consists of parentheses only.",
    inputFormat: "A single line containing the parentheses string.",
    outputFormat: "Print 'true' if the string is valid, otherwise 'false'.",
    sampleInput: "()[]{}",
    sampleOutput: "true",
    testCases: [
      { input: "()[]{}", output: "true" },
      { input: "(]", output: "false" },
      { input: "([)]", output: "false" }
    ],
    starterTemplates: {
      python: `import sys\n\ndef solve():\n    s = sys.stdin.read().strip()\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in mapping:\n            top_element = stack.pop() if stack else '#'\n            if mapping[char] != top_element:\n                print("false")\n                return\n        else:\n            stack.append(char)\n    print("true" if not stack else "false")\n\nif __name__ == '__main__':\n    solve()`,
      javascript: `const fs = require('fs');\n\nfunction solve() {\n    const s = fs.readFileSync(0, 'utf-8').trim();\n    const stack = [];\n    const mapping = {')': '(', '}': '{', ']': '['};\n    for (let i = 0; i < s.length; i++) {\n        const char = s[i];\n        if (mapping[char]) {\n            const top = stack.length ? stack.pop() : '#';\n            if (mapping[char] !== top) {\n                console.log("false");\n                return;\n            }\n        } else {\n            stack.push(char);\n        }\n    }\n    console.log(stack.length === 0 ? "true" : "false");\n}\n\nsolve();`,
      cpp: `#include <iostream>\n#include <stack>\n#include <string>\n#include <map>\nusing namespace std;\n\nint main() {\n    string s;\n    if (!(cin >> s)) return 0;\n    stack<char> st;\n    map<char, char> mapping = {{')', '('}, {'}', '{'}, {']', '['}};\n    for (char c : s) {\n        if (mapping.count(c)) {\n            char top = st.empty() ? '#' : st.top();\n            if (!st.empty()) st.pop();\n            if (mapping[c] != top) {\n                cout << "false" << endl;\n                return 0;\n            }\n        } else {\n            st.push(c);\n        }\n    }\n    cout << (st.empty() ? "true" : "false") << endl;\n    return 0;\n}`,
      java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String s = br.readLine();\n        if (s == null) return;\n        s = s.trim();\n        Stack<Character> stack = new Stack<>();\n        Map<Character, Character> mapping = new HashMap<>();\n        mapping.put(')', '(');\n        mapping.put('}', '{');\n        mapping.put(']', '[');\n        for (int i = 0; i < s.length(); i++) {\n            char c = s.charAt(i);\n            if (mapping.containsKey(c)) {\n                char top = stack.isEmpty() ? '#' : stack.pop();\n                if (mapping.get(c) != top) {\n                    System.out.println("false");\n                    return;\n                }\n            } else {\n                stack.push(c);\n            }\n        }\n        System.out.println(stack.isEmpty() ? "true" : "false");\n    }\n}`
    }
  }
}

/**
 * Robustly parse a JSON string from an LLM response.
 * Handles: markdown code fences (```json ... ```), trailing commas,
 * extra text before/after the JSON object, and whitespace.
 */
function safeParseJSON(raw: string): any {
  if (!raw || typeof raw !== 'string') throw new Error('Empty AI response content')

  let text = raw.trim()

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

  // Extract the first JSON object or array (find first { or [)
  const firstBrace = text.indexOf('{')
  const firstBracket = text.indexOf('[')
  let startIdx = -1
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace
  } else if (firstBracket !== -1) {
    startIdx = firstBracket
  }

  if (startIdx > 0) {
    text = text.slice(startIdx)
  }

  // Remove trailing commas before ] or } (common LLM mistake)
  text = text.replace(/,\s*([\]\}])/g, '$1')

  return JSON.parse(text)
}

export async function POST(req: Request) {
  try {
    const { type, topic, company, difficulty, round } = await req.json()
    const apiKey = process.env.DEEPSEEK_API_KEY
    const hasApiKey = apiKey && apiKey !== 'your_deepseek_api_key_here'

    const normTopic = (topic || 'Python').trim()
    const normDiff = (difficulty || 'medium').toLowerCase()
    const normCompany = (company || 'Google').trim()
    const normRound = Number(round || 1)

    const category = getCompanyCategory(normCompany)

    // Practice generation flow
    if (type === 'practice') {
      if (!hasApiKey) {
        return NextResponse.json({
          questions: generateFallbackPracticeQuestions(normTopic, normDiff),
          isAI: false
        })
      }

      const prompt = `Generate exactly 20 highly tricky, practical, industry-standard multiple choice questions (MCQ) for practice on topic: "${normTopic}" at difficulty: "${normDiff}".
Focus on real-world coding snippets, algorithmic complexity, performance bottlenecks, and systems topics.
Format output as a compact, minified JSON object containing key "questions" (array of MCQ objects).
Each MCQ object must use exactly these short keys to save tokens:
- id: number (1-20)
- q: string (the question text)
- o: array of 4 options strings
- c: number (index of correct option, 0-3)
- e: string (explanation, strictly under 8 words)
Do not pretty-print. No markdown syntax (\`\`\`json). No indentation. Keep all strings short to save tokens.`

      const apiRes = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a cost-optimized assessment engine. You output strictly minified JSON. Do not pretty-print. No newlines. Keep explanations under 5 words. Do not use emojis.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3
        })
      })

      if (!apiRes.ok) {
        throw new Error(`API error: ${apiRes.status}`)
      }

      const payload = await apiRes.json()
      const content = payload.choices?.[0]?.message?.content
      const parsed = safeParseJSON(content)
      
      const formattedQuestions = (parsed.questions || []).map((item: any) => ({
        id: item.id,
        question: item.q || item.question,
        options: item.o || item.options,
        correctOption: typeof item.c === 'number' ? item.c : item.correctOption,
        explanation: item.e || item.explanation || ''
      }))

      return NextResponse.json({
        questions: formattedQuestions.slice(0, 20),
        isAI: true
      })
    }

    // Company Test multi-round generation flow
    if (type === 'test') {
      const isCodingRound = (category === 'product' && normRound === 4) ||
                            (category === 'service' && normRound === 4) ||
                            (category === 'startup' && normRound === 3)

      if (!hasApiKey) {
        return handleOfflineTestFallback(normCompany, normRound)
      }

      let systemPrompt = 'You are a cost-optimized recruitment system. You output strictly minified JSON. No indentation. Keep explanations under 5 words. Do not use emojis.'
      let prompt = ''

      if (isCodingRound) {
        prompt = `Generate exactly 1 highly practical, real-world scenario DSA coding challenge used in technical hiring at ${normCompany}.
The question should focus on core data structures/algorithms (such as graph traversals, heap, cache eviction, interval merge, rate limiting arrays, trees).
Ensure to output a JSON object containing key "codingProblem" matching exactly the short keys below:
- t: string (problem title)
- d: string (short problem statement / description detailing standard input/output behavior)
- c: string (complexity/size constraints)
- if: string (input format from standard input)
- of: string (output format to standard output)
- si: string (sample input)
- so: string (sample output)
- tc: array of 3 objects representing test cases, each with keys "i" (stdin string) and "o" (expected stdout string)
- st: object containing starter template strings for programming languages, keys must be: "python", "javascript", "cpp", "java"
Ensure the template handles reading inputs from standard input and printing standard output.
Do not use markdown formatting. Keep descriptions concise to minimize tokens.`
      } else {
        // MCQ Rounds
        let roundScope = 'general programming screening'
        if (category === 'product') {
          if (normRound === 1) roundScope = 'Quantitative aptitude, mathematical logic, reasoning puzzles, permutation combinations, probability, sequences'
          if (normRound === 2) roundScope = 'English & Verbal ability, sentence completion, reading comprehension, grammar corrections'
          if (normRound === 3) roundScope = 'Technical core topics and DSA concepts (Time complexity, search/sort algorithms, trees, array traversal, stack operations)'
          if (normRound === 5) roundScope = 'Advanced system architecture, distributed systems, microservices, scaling database replication, and system performance design'
          if (normRound === 6) roundScope = 'Tricky execution logic, code trace puzzles, pointer operations, bitwise logic, memory leak scenarios'
          if (normRound === 7) roundScope = 'Behavioral workplace situational scenarios, cultural alignment, leadership logic'
        } else if (category === 'service') {
          if (normRound === 1) roundScope = 'Quantitative aptitude, basic arithmetic, logical reasoning, numerical series'
          if (normRound === 2) roundScope = 'English comprehension, grammar, vocabulary, sentence correction'
          if (normRound === 3) roundScope = 'Technical fundamentals, OOPs, database queries, basic arrays and strings memory complexity'
          if (normRound === 5) roundScope = 'Technical interview review, project situational dilemmas, HR communication, client coordination'
        } else { // startup
          if (normRound === 1) roundScope = 'Aptitude logic, analytical puzzles, quick math, logical deduction under time pressure'
          if (normRound === 2) roundScope = 'Technical screening, programming language basics, asynchronous executions (JS callbacks/promises), basic algorithms'
          if (normRound === 4) roundScope = 'High-scale systems, database schema decisions, caching strategy, api scaling, and system execution logic'
        }

        prompt = `Generate exactly 10 highly tricky, practical, industry-standard MCQ questions for Round ${normRound} (${roundScope}) of simulated recruitment for "${normCompany}".
Format output as a compact, minified JSON object containing key "questions" (array of MCQ objects).
Each MCQ object must use exactly these short keys to save tokens:
- id: number (1-10)
- q: string (the question text)
- o: array of 4 options strings
- c: number (index of correct option, 0-3)
- e: string (explanation, strictly under 5 words)
Do not pretty-print. Keep all strings short to save tokens.`
      }

      const apiRes = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3
        })
      })

      if (!apiRes.ok) {
        throw new Error(`API error: ${apiRes.status}`)
      }

      const payload = await apiRes.json()
      const content = payload.choices?.[0]?.message?.content
      const parsed = safeParseJSON(content)

      if (isCodingRound) {
        const rawProblem = parsed.codingProblem || {}
        // Map short keys to verbose coding problem keys for frontend compatibility
        const formattedProblem = {
          title: rawProblem.t || rawProblem.title || 'Coding Challenge',
          description: rawProblem.d || rawProblem.description || '',
          constraints: rawProblem.c || rawProblem.constraints || '',
          inputFormat: rawProblem.if || rawProblem.inputFormat || '',
          outputFormat: rawProblem.of || rawProblem.outputFormat || '',
          sampleInput: rawProblem.si || rawProblem.sampleInput || '',
          sampleOutput: rawProblem.so || rawProblem.sampleOutput || '',
          testCases: (rawProblem.tc || rawProblem.testCases || []).map((tc: any) => ({
            input: tc.i || tc.input || '',
            output: tc.o || tc.output || ''
          })),
          starterTemplates: rawProblem.st || rawProblem.starterTemplates || {}
        }
        return NextResponse.json({
          codingProblem: formattedProblem,
          isAI: true
        })
      } else {
        const formattedQuestions = (parsed.questions || []).map((item: any) => ({
          id: item.id,
          question: item.q || item.question,
          options: item.o || item.options,
          correctOption: typeof item.c === 'number' ? item.c : item.correctOption,
          explanation: item.e || item.explanation || ''
        }))
        return NextResponse.json({
          questions: formattedQuestions.slice(0, 10),
          isAI: true
        })
      }
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })

  } catch (error) {
    console.error('Error generating AI data:', error)
    // Dynamic fallback
    try {
      const body = await req.clone().json()
      if (body.type === 'practice') {
        return NextResponse.json({
          questions: generateFallbackPracticeQuestions(body.topic || 'Python', body.difficulty || 'medium'),
          isAI: false,
          error: true
        })
      } else {
        return handleOfflineTestFallback(body.company || 'Google', Number(body.round || 1))
      }
    } catch {
      return NextResponse.json({
        questions: generateFallbackPracticeQuestions('Python', 'medium'),
        isAI: false,
        error: true
      })
    }
  }
}

function handleOfflineTestFallback(company: string, round: number) {
  const category = getCompanyCategory(company)
  const isCoding = (category === 'product' && round === 4) ||
                   (category === 'service' && round === 4) ||
                   (category === 'startup' && round === 3)
  
  if (isCoding) {
    const problem = OFFLINE_CODING_FALLBACKS[category] || OFFLINE_CODING_FALLBACKS.product
    return NextResponse.json({
      codingProblem: {
        ...problem,
        title: `[Offline] ${problem.title}`
      },
      isAI: false
    })
  }

  // MCQ Fallbacks for 10 questions
  const list: Question[] = []
  
  let subject = 'screening concepts'
  if (category === 'product') {
    if (round === 1) subject = 'Quantitative Aptitude'
    if (round === 2) subject = 'English & Verbal Ability'
    if (round === 3) subject = 'Technical Screening DSA'
    if (round === 5) subject = 'System Design Scaling'
    if (round === 6) subject = 'Tricky logic operations'
    if (round === 7) subject = 'Behavioral scenario choices'
  } else if (category === 'service') {
    if (round === 1) subject = 'Quantitative Aptitude'
    if (round === 2) subject = 'English & Verbal Ability'
    if (round === 3) subject = 'Technical fundamentals'
    if (round === 5) subject = 'Technical HR project management'
  } else {
    if (round === 1) subject = 'Aptitude analytical puzzles'
    if (round === 2) subject = 'Technical async variables'
    if (round === 4) subject = 'High-scale systems caching'
  }

  for (let i = 1; i <= 10; i++) {
    list.push({
      id: i,
      question: `Offline simulated question ${i} for Round ${round} (${subject}) of ${company}'s recruitment.`,
      options: [
        "Optimal technical choice A",
        "Alternative technical choice B",
        "Incorrect answer option C",
        "Incorrect answer option D"
      ],
      correctOption: 0,
      explanation: "Concept verified."
    })
  }

  return NextResponse.json({
    questions: list,
    isAI: false
  })
}
