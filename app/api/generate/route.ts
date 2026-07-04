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
      { id: 1, question: "What is the output of print(3 * 2)?", options: ["5", "6", "9", "33"], correctOption: 1, explanation: "Simple multiplication." },
      { id: 2, question: "Which of these is a valid integer variable?", options: ["x = 5", "x = '5'", "x = 5.0", "x = true"], correctOption: 0, explanation: "Integer assignment." },
      { id: 3, question: "What is the correct syntax to output 'Hello World' in Python?", options: ["print('Hello World')", "echo('Hello World')", "p('Hello World')", "printf('Hello World')"], correctOption: 0, explanation: "Uses print() function." },
      { id: 4, question: "How do you start a comment in Python?", options: ["# comment", "// comment", "/* comment */", "<!-- comment -->"], correctOption: 0, explanation: "# starts single-line comment." },
      { id: 5, question: "Which data type is used to store multiple items in a single variable?", options: ["List", "Integer", "String", "Float"], correctOption: 0, explanation: "List holds multiple items." }
    ],
    medium: [
      { id: 1, question: "What is the output of [x*2 for x in range(3)]?", options: ["[0, 2, 4]", "[0, 1, 2]", "[2, 4, 6]", "[0, 2, 4, 6]"], correctOption: 0, explanation: "List comprehension." },
      { id: 2, question: "Which of the following is used to handle exceptions in Python?", options: ["try/except", "if/else", "do/while", "catch/throw"], correctOption: 0, explanation: "try/except block." },
      { id: 3, question: "How do you check if a key exists in a dictionary?", options: ["key in dict", "dict.has(key)", "dict.contains(key)", "dict.check(key)"], correctOption: 0, explanation: "'in' keyword checks presence." },
      { id: 4, question: "What is the output of print('hello'.upper())?", options: ["HELLO", "Hello", "hello", "Error"], correctOption: 0, explanation: "upper() converts to uppercase." },
      { id: 5, question: "Which function gets the length of a list in Python?", options: ["len()", "length()", "size()", "count()"], correctOption: 0, explanation: "len() returns count." }
    ],
    hard: [
      { id: 1, question: "What is the time complexity of dictionary lookups in Python on average?", options: ["O(1)", "O(log N)", "O(N)", "O(N^2)"], correctOption: 0, explanation: "Average case hash lookup." },
      { id: 2, question: "What is the use of 'yield' keyword in Python?", options: ["To return a generator", "To stop loop", "To exit program", "To define a class"], correctOption: 0, explanation: "yield makes it a generator." },
      { id: 3, question: "Which decorator is used to define a static method in Python?", options: ["@staticmethod", "@classmethod", "@property", "@static"], correctOption: 0, explanation: "@staticmethod decorator." },
      { id: 4, question: "What is the output of print(2 ** 3 ** 2)?", options: ["512", "64", "4096", "Error"], correctOption: 0, explanation: "Right-to-left associativity: 2**(3**2)." },
      { id: 5, question: "What does the '__init__' method do in Python classes?", options: ["Initializes object state", "Deletes object", "Imports libraries", "Defines inheritance"], correctOption: 0, explanation: "Constructor method." }
    ]
  },
  aptitude: {
    easy: [
      { id: 1, question: "A car travels at a constant speed of 60 km/h. How far does it travel in 2.5 hours?", options: ["120 km", "150 km", "180 km", "200 km"], correctOption: 1, explanation: "Distance = speed * time" },
      { id: 2, question: "If the ratio of two numbers is 3:5 and their sum is 80, what is the smaller number?", options: ["30", "50", "40", "20"], correctOption: 0, explanation: "3x + 5x = 80 => 8x = 80 => x=10. Smaller is 30." },
      { id: 3, question: "A book is sold for $120 making a profit of 20%. What was the cost price?", options: ["$100", "$90", "$110", "$96"], correctOption: 0, explanation: "CP = 120 / 1.2 = 100." },
      { id: 4, question: "What is the average of the first 5 natural numbers (1, 2, 3, 4, 5)?", options: ["3", "2.5", "4", "3.5"], correctOption: 0, explanation: "Sum is 15. Average is 15/5 = 3." },
      { id: 5, question: "Solve for x: if x + 15 = 35, what is the value of 2x - 10?", options: ["30", "40", "20", "50"], correctOption: 0, explanation: "x = 20. 2x - 10 = 40 - 10 = 30." }
    ],
    medium: [
      { id: 1, question: "If 5 workers can build a wall in 12 days, how many days would it take 6 workers to build the same wall?", options: ["8 days", "10 days", "12 days", "15 days"], correctOption: 1, explanation: "Total worker-days = 60. 60 / 6 = 10 days." },
      { id: 2, question: "A principal of $1000 yields $200 simple interest in 2 years. What is the rate of interest per annum?", options: ["10%", "5%", "8%", "12%"], correctOption: 0, explanation: "I = P*R*T/100 => 200 = 1000*R*2/100 => R = 10%." },
      { id: 3, question: "In how many ways can the letters of the word 'LEAD' be arranged?", options: ["24", "12", "48", "6"], correctOption: 0, explanation: "4! = 24 arrangements." },
      { id: 4, question: "A train 150m long passes a pole in 15 seconds. What is the speed of the train in km/h?", options: ["36 km/h", "54 km/h", "45 km/h", "30 km/h"], correctOption: 0, explanation: "Speed = 150/15 = 10 m/s = 36 km/h." },
      { id: 5, question: "What is the probability of getting a sum of 7 when two dice are rolled?", options: ["1/6", "1/12", "1/36", "5/36"], correctOption: 0, explanation: "Favorable: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1). 6/36 = 1/6." }
    ],
    hard: [
      { id: 1, question: "A bag contains 4 red balls and 6 blue balls. If two balls are drawn at random without replacement, what is the probability that both are red?", options: ["2/15", "4/15", "2/9", "6/25"], correctOption: 0, explanation: "P = (4/10) * (3/9) = 2/15." },
      { id: 2, question: "A sum of money compounded annually doubles itself in 5 years. In how many years will it become 8 times itself?", options: ["15 years", "10 years", "20 years", "25 years"], correctOption: 0, explanation: "Doubles every 5 years. 2^3 = 8 times => 3 * 5 = 15 years." },
      { id: 3, question: "Two pipes A and B can fill a tank in 20 and 30 minutes respectively. If both pipes are opened together, how long will it take to fill the tank?", options: ["12 minutes", "15 minutes", "10 minutes", "25 minutes"], correctOption: 0, explanation: "Time = (20 * 30) / (20 + 30) = 12 mins." },
      { id: 4, question: "The average age of a class of 20 students is 15 years. If the teacher's age is included, the average increases by 1 year. What is the teacher's age?", options: ["36 years", "35 years", "40 years", "30 years"], correctOption: 0, explanation: "New sum = 21 * 16 = 336. Old sum = 20 * 15 = 300. Teacher = 36." },
      { id: 5, question: "What is the unit digit of the number 2^2026?", options: ["4", "2", "8", "6"], correctOption: 0, explanation: "Cycle of 2 is 2,4,8,6. 2026 % 4 = 2. Unit digit is 4." }
    ]
  },
  "english/verbal ability": {
    easy: [
      { id: 1, question: "Choose the correct synonym for the word 'Diligent':", options: ["Lazy", "Hardworking", "Clever", "Careless"], correctOption: 1, explanation: "Diligent means hardworking." },
      { id: 2, question: "Identify the correct spelling of the word:", options: ["Receive", "Recieve", "Receve", "Riceive"], correctOption: 0, explanation: "Correct spelling is Receive." },
      { id: 3, question: "What is the antonym of the word 'Amateur'?", options: ["Professional", "Novice", "Learner", "Beginner"], correctOption: 0, explanation: "Antonym is Professional." },
      { id: 4, question: "Fill in the blank: She ___ to the store yesterday.", options: ["went", "goes", "go", "gone"], correctOption: 0, explanation: "Past tense is 'went'." },
      { id: 5, question: "Choose the correct plural form of 'Child':", options: ["Children", "Childs", "Childrens", "Childes"], correctOption: 0, explanation: "Plural form is Children." }
    ],
    medium: [
      { id: 1, question: "Identify the grammatically correct sentence from the following options:", options: ["He did not wrote the letter yesterday.", "He did not write the letter yesterday.", "He has not wrote the letter yesterday.", "He was not write the letter yesterday."], correctOption: 1, explanation: "'did not' takes base verb." },
      { id: 2, question: "What is the meaning of the idiom 'Spill the beans'?", options: ["To reveal a secret", "To waste food", "To cook a meal", "To perform a magic trick"], correctOption: 0, explanation: "Means to reveal a secret." },
      { id: 3, question: "Identify the active voice: 'The cake was eaten by the boy.'", options: ["The boy ate the cake.", "The boy eats the cake.", "The boy was eating cake.", "The cake was eating the boy."], correctOption: 0, explanation: "Active is: Sub + Verb + Obj." },
      { id: 4, question: "Choose the correct preposition: He is good ___ playing chess.", options: ["at", "in", "with", "on"], correctOption: 0, explanation: "We say 'good at'." },
      { id: 5, question: "Choose the correct synonym for 'Benevolent':", options: ["Kind", "Cruel", "Selfish", "Greedy"], correctOption: 0, explanation: "Benevolent means kind-hearted." }
    ],
    hard: [
      { id: 1, question: "Choose the word that best fits the sentence: 'The speaker's argument was ________; it was clear, logical, and extremely persuasive.'", options: ["spurious", "cogent", "redundant", "convoluted"], correctOption: 1, explanation: "Cogent means persuasive." },
      { id: 2, question: "Identify the part of the sentence containing an error: 'Neither the teacher nor the students was present at the assembly.'", options: ["was present", "Neither the teacher", "nor the students", "at the assembly"], correctOption: 0, explanation: "Should be 'were' present." },
      { id: 3, question: "Select the pair that expresses a relationship similar to 'Meticulous : Care':", options: ["Sloppy : Diligence", "Altruistic : Selfishness", "Lethargic : Energy", "Flamboyant : Showiness"], correctOption: 3, explanation: "Flamboyant is characterized by showiness." },
      { id: 4, question: "What is the synonym of 'Obsequious'?", options: ["Servile", "Dominant", "Rebellious", "Indifferent"], correctOption: 0, explanation: "Obsequious means overly obedient." },
      { id: 5, question: "Complete the sentence: 'If I ___ you, I would have accepted the offer.'", options: ["were", "was", "had been", "am"], correctOption: 0, explanation: "Subjunctive mood uses 'were'." }
    ]
  },
  "logical reasoning": {
    easy: [
      { id: 1, question: "Find the missing number in the sequence: 2, 4, 8, 16, ?", options: ["20", "24", "30", "32"], correctOption: 3, explanation: "Sequence doubles: 16*2=32." },
      { id: 2, question: "If CAT is coded as DBT, how is DOG coded?", options: ["EPH", "ENF", "EOF", "FPH"], correctOption: 0, explanation: "C->D (+1), A->B (+1), T->T (+0). D->E, O->P, G->H." },
      { id: 3, question: "Choose the odd one out:", options: ["Apple", "Orange", "Potato", "Banana"], correctOption: 2, explanation: "Potato is a vegetable, others are fruits." },
      { id: 4, question: "Pointing to a man, a woman said, 'His mother is the only daughter of my mother.' How is the woman related to the man?", options: ["Mother", "Sister", "Daughter", "Grandmother"], correctOption: 0, explanation: "Only daughter of her mother is herself." },
      { id: 5, question: "If yesterday was Tuesday, what day will it be 3 days after tomorrow?", options: ["Saturday", "Sunday", "Friday", "Monday"], correctOption: 1, explanation: "Yesterday Tuesday => Today Wed => Tomorrow Thu => +3 days = Sunday." }
    ],
    medium: [
      { id: 1, question: "Point A is 10m West of Point B. Point C is 10m North of Point B. In which direction is Point C with respect to Point A?", options: ["North-West", "North-East", "South-East", "South-West"], correctOption: 1, explanation: "Point C is North-East of A." },
      { id: 2, question: "Complete the letter series: A, C, F, J, ?", options: ["O", "N", "M", "P"], correctOption: 0, explanation: "A(+2)->C(+3)->F(+4)->J(+5)->O." },
      { id: 3, question: "If '+' means 'x', '-' means '+', 'x' means '/' and '/' means '-', what is 10 + 5 - 3 x 3 / 2?", options: ["49", "50", "48", "45"], correctOption: 0, explanation: "10 * 5 + 3 / 3 - 2 = 50 + 1 - 2 = 49." },
      { id: 4, question: "Five people are sitting in a row. A is to the left of B, C is to the right of B. D is between A and B. Who is sitting in the middle?", options: ["D", "A", "B", "C"], correctOption: 0, explanation: "Order: A - D - B - C. D is in the middle." },
      { id: 5, question: "Find the missing number: 1, 9, 25, 49, ?, 121", options: ["81", "64", "100", "99"], correctOption: 0, explanation: "Squares of odd numbers: 1, 3, 5, 7, 9, 11." }
    ],
    hard: [
      { id: 1, question: "If all cats are animals, and some animals are dogs, which of the following is definitely true?", options: ["Some cats are dogs", "All dogs are animals", "All animals are cats", "None of the above"], correctOption: 3, explanation: "No definite relationship." },
      { id: 2, question: "In a family, each boy has as many sisters as brothers and each girl has twice as many brothers as sisters. How many boys and girls are there?", options: ["4 boys, 3 girls", "3 boys, 4 girls", "4 boys, 4 girls", "3 boys, 3 girls"], correctOption: 0, explanation: "4 boys, 3 girls satisfy criteria." },
      { id: 3, question: "A is the brother of B. C is the father of A. D is the brother of E. E is the daughter of B. Who is the uncle of D?", options: ["A", "C", "B", "E"], correctOption: 0, explanation: "B's kids D and E. B's brother is A. So A is uncle." },
      { id: 4, question: "If all P are Q and no Q are R, then which statement is correct?", options: ["No P are R", "Some P are R", "All P are R", "All R are Q"], correctOption: 0, explanation: "Since all P are Q and no Q is R." },
      { id: 5, question: "Six books A, B, C, D, E, F are placed side by side. B, C, E have blue covers, others have red. A, B, D are new, others are old. A, C, D are law reports, others are dictionaries. Which book is a new blue dictionary?", options: ["B", "C", "D", "E"], correctOption: 0, explanation: "B is blue, new, and dictionary." }
    ]
  }
}

const normalizeFallbackTopic = (topic: string): string => {
  const t = topic.toLowerCase().trim()
  if (t.includes('aptitude')) return 'aptitude'
  if (t.includes('english') || t.includes('verbal')) return 'english/verbal ability'
  if (t.includes('logical') || t.includes('reasoning')) return 'logical reasoning'
  return t
}

// Generate fallback 20 questions in case of offline or errors
const generateFallbackPracticeQuestions = (topic: string, difficulty: string): Question[] => {
  const list: Question[] = []
  const baseTopic = normalizeFallbackTopic(topic)
  const normDiff = (difficulty || 'medium').toLowerCase()
  
  if (OFFLINE_PRACTICE[baseTopic]?.[normDiff]) {
    const predefined = OFFLINE_PRACTICE[baseTopic][normDiff]
    for (let i = 0; i < 20; i++) {
      const q = predefined[i % predefined.length]
      list.push({
        ...q,
        id: i + 1,
        question: `[Q${i + 1}] ${q.question}`
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
      python: `import sys\n\ndef solve():\n    lines = sys.stdin.read().splitlines()\n    if not lines:\n        return\n    k = int(lines[0])\n    # TODO: Write your logic here to merge the k sorted lists\n    # Each list is represented as a space-separated string of integers in lines[1...k]\n    \n    # Print the space-separated values of the merged sorted list\n    pass\n\nif __name__ == '__main__':\n    solve()`,
      javascript: `const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf-8');\n    const lines = input.trim().split('\\n');\n    if (lines.length === 0 || !lines[0]) return;\n    const k = parseInt(lines[0]);\n    // TODO: Write your logic here to merge the k sorted lists\n    \n    // Print the space-separated values of the merged sorted list\n}\n\nsolve();`,
      cpp: `#include <iostream>\n#include <vector>\n#include <string>\n#include <sstream>\nusing namespace std;\n\nint main() {\n    int k;\n    if (!(cin >> k)) return 0;\n    string line;\n    getline(cin, line); // consume remainder of line\n    // TODO: Write your logic here to merge the k sorted lists\n    \n    // Print the space-separated values of the merged sorted list\n    return 0;\n}`,
      java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String kStr = br.readLine();\n        if (kStr == null) return;\n        int k = Integer.parseInt(kStr.trim());\n        // TODO: Write your logic here to merge the k sorted lists\n        \n        // Print the space-separated values of the merged sorted list\n    }\n}`
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
      python: `import sys\n\ndef solve():\n    lines = sys.stdin.read().splitlines()\n    if len(lines) < 2:\n        return\n    nums = list(map(int, lines[0].split()))\n    target = int(lines[1])\n    # TODO: Write logic here to find indices of the two numbers that add up to target\n    \n    # Print the indices of the two numbers separated by a space\n    pass\n\nif __name__ == '__main__':\n    solve()`,
      javascript: `const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf-8');\n    const lines = input.trim().split('\\n');\n    if (lines.length < 2) return;\n    const nums = lines[0].trim().split(/\\s+/).map(Number);\n    const target = parseInt(lines[1]);\n    // TODO: Write logic here to find indices of the two numbers that add up to target\n    \n    // Print the indices of the two numbers separated by a space\n}\n\nsolve();`,
      cpp: `#include <iostream>\n#include <vector>\n#include <string>\n#include <sstream>\nusing namespace std;\n\nint main() {\n    string line;\n    if (!getline(cin, line)) return 0;\n    stringstream ss(line);\n    vector<int> nums;\n    int num;\n    while (ss >> num) {\n        nums.push_back(num);\n    }\n    int target;\n    if (!(cin >> target)) return 0;\n    // TODO: Write logic here to find indices of the two numbers that add up to target\n    \n    // Print the indices of the two numbers separated by a space\n    return 0;\n}`,
      java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String firstLine = br.readLine();\n        String secondLine = br.readLine();\n        if (firstLine == null || secondLine == null) return;\n        String[] parts = firstLine.trim().split("\\\\s+");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) {\n            nums[i] = Integer.parseInt(parts[i]);\n        }\n        int target = Integer.parseInt(secondLine.trim());\n        // TODO: Write logic here to find indices of the two numbers that add up to target\n        \n        // Print the indices of the two numbers separated by a space\n    }\n}`
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
      python: `import sys\n\ndef solve():\n    s = sys.stdin.read().strip()\n    # TODO: Write logic here to check if the parentheses string s is valid\n    \n    # Print 'true' if the string is valid, otherwise 'false'\n    pass\n\nif __name__ == '__main__':\n    solve()`,
      javascript: `const fs = require('fs');\n\nfunction solve() {\n    const s = fs.readFileSync(0, 'utf-8').trim();\n    // TODO: Write logic here to check if the parentheses string s is valid\n    \n    # Print 'true' if the string is valid, otherwise 'false'\n}\n\nsolve();`,
      cpp: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    if (!(cin >> s)) return 0;\n    // TODO: Write logic here to check if the parentheses string s is valid\n    \n    // Print 'true' if the string is valid, otherwise 'false'\n    return 0;\n}`,
      java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String s = br.readLine();\n        if (s == null) return;\n        s = s.trim();\n        // TODO: Write logic here to check if the parentheses string s is valid\n        \n        // Print 'true' if the string is valid, otherwise 'false'\n    }\n}`
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

const isGeneralTopic = (topic: string): boolean => {
  const t = topic.toLowerCase().trim()
  return t === 'aptitude' || t === 'english/verbal ability' || t === 'logical reasoning' || t === 'english' || t === 'verbal ability'
}

const getTopicFocus = (topic: string): string => {
  const t = topic.toLowerCase().trim()
  if (t === 'aptitude') return 'quantitative aptitude, math word problems, speed-distance-time, probability, percentages, algebra, geometry'
  if (t === 'english/verbal ability' || t === 'english' || t === 'verbal ability') return 'English verbal ability, grammar, sentence correction, vocabulary, synonyms/antonyms, reading comprehension'
  if (t === 'logical reasoning') return 'logical deduction, puzzles, sequences, blood relations, direction tests, syllogisms'
  return `technical software engineering concepts, coding syntax, algorithms, complexity, performance, and best practices for ${topic}`
}

const getDifficultyInstruction = (difficulty: string): string => {
  const d = difficulty.toLowerCase().trim()
  if (d === 'easy') return 'basic level: test fundamental syntax, simple rules, straightforward calculations, basic vocabulary, or simple definitions'
  if (d === 'hard') return 'hard level: test advanced optimizations, deep edge cases, complex multi-step reasoning, tricky logical traps, or advanced scenarios'
  return 'medium level: test intermediate concepts, practical application, basic loops/logic, or standard multi-step problem solving'
}

const getCompanyDifficulty = (company: string): string => {
  const cat = getCompanyCategory(company)
  if (cat === 'product') return 'hard'
  if (cat === 'service') return 'easy/medium'
  return 'medium/hard'
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, topic, company, difficulty, round, role } = body
    const apiKey = process.env.DEEPSEEK_API_KEY
    const hasApiKey = apiKey && apiKey !== 'your_deepseek_api_key_here'

    const normTopic = (topic || 'Python').trim()
    const normDiff = (difficulty || 'medium').toLowerCase()
    const normCompany = (company || 'Google').trim()
    const normRound = Number(round || 1)
    const normRole = (role || 'Software Engineer').trim()

    const category = getCompanyCategory(normCompany)

    // Practice generation flow
    if (type === 'practice') {
      if (!hasApiKey) {
        return NextResponse.json({
          questions: generateFallbackPracticeQuestions(normTopic, normDiff),
          isAI: false
        })
      }

      const topicFocus = getTopicFocus(normTopic)
      const diffInst = getDifficultyInstruction(normDiff)

      const prompt = `Generate 20 MCQ questions for practice on "${normTopic}".
Focus: ${topicFocus}.
Difficulty: ${diffInst}.
Format: Minified JSON object with key "questions" (array).
MCQ structure:
- id: 1-20
- q: short question text
- o: 4 options
- c: index of correct option (0-3)
- e: explanation (max 5 words)
Constraint: Do NOT pretty-print. Do NOT include markdown code blocks. Keep all text extremely short to save tokens. Do not mention other technologies or coding if it is a general/non-coding topic.`

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
              content: 'You are a cost-optimized assessment engine. Output strictly minified JSON. Keep explanations under 5 words.'
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
        return handleOfflineTestFallback(normCompany, normRound, normRole)
      }

      let systemPrompt = 'You are a recruitment engine. Output strictly minified JSON.'
      let prompt = ''

      if (isCodingRound) {
        let roleFocus = 'core data structures/algorithms (such as graph traversals, heap, cache eviction, interval merge, rate limiting arrays, trees)'
        if (normRole === 'AI/ML') {
          roleFocus = 'AI/ML algorithmic implementations (such as linear algebra matrix operations, model metrics calculations like F1/Precision/Recall/ROC-AUC, distance calculations like Cosine/Euclidean, k-means clustering iterations, array vectorization processing, or simple regression/backpropagation formulas)'
        } else if (normRole === 'DevOps') {
          roleFocus = 'DevOps/systems automation scripting challenges (such as parsing system logs, configuration/JSON validation, container resource calculation arrays, IP subnet range parsing, cron schedule validators, file-path traversal matching, or command arguments parsing)'
        } else if (normRole === 'MERN Stack') {
          roleFocus = 'web/full-stack programming logic (such as deep merging nested config structures, URL route pattern matching and parameter extraction, validating complex JSON request shapes, asynchronous callback sequence execution queues, or string tokenizers for templates)'
        }

        prompt = `Generate exactly 1 coding challenge for a ${normRole} role, styled as used in technical hiring at ${normCompany}.
Difficulty: ${category === 'service' ? 'medium' : 'hard'} level.
The challenge must focus on: ${roleFocus}.
Output JSON object containing key "codingProblem" matching exactly these short keys:
- t: problem title
- d: short problem description (stdin/stdout behavior)
- c: complexity constraints
- if: input format
- of: output format
- si: sample input
- so: sample output
- tc: array of 3 test case objects with keys "i" (stdin) and "o" (expected stdout)
- st: object containing starter template strings (boilerplates only, handling standard input/output reading, leaving the logic body empty with a TODO comment) for python, javascript, cpp, java
Constraint: Minify output. Keep descriptions extremely short. Do NOT include markdown code blocks or explanations outside JSON.`
      } else {
        // MCQ Rounds
        let roundScope = 'general programming screening'
        let isGeneralRound = false
        let isBehavioral = false

        if (category === 'product') {
          if (normRound === 1) { roundScope = 'Quantitative aptitude, mathematical logic, reasoning puzzles, permutation combinations, probability, sequences'; isGeneralRound = true; }
          else if (normRound === 2) { roundScope = 'English & Verbal ability, sentence completion, reading comprehension, grammar corrections'; isGeneralRound = true; }
          else if (normRound === 3) {
            roundScope = normRole === 'AI/ML' ? 'AI/ML core machine learning, training algorithms, metrics, vector mathematics, activation functions'
                      : normRole === 'DevOps' ? 'DevOps, CI/CD pipelines, Docker, Kubernetes, Linux operating system, bash basics'
                      : normRole === 'MERN Stack' ? 'MERN stack web engineering, JavaScript engine, React component rendering lifecycle, NodeJS backend processes, MongoDB indexing'
                      : 'Technical core topics and DSA concepts (Time complexity, search/sort algorithms, trees, array traversal, stack operations)'
          }
          else if (normRound === 5) {
            roundScope = normRole === 'AI/ML' ? 'AI/ML System Design, feature stores, model latency optimization, distributed training scalability'
                      : normRole === 'DevOps' ? 'Cloud Infrastructure, load balancing, multi-region high availability, VPC networking, infrastructure as code'
                      : normRole === 'MERN Stack' ? 'Web App Scale Design, session caching, state synchronization, CDN caching, database replica shards'
                      : 'Advanced system architecture, distributed systems, microservices, scaling database replication, and system performance design'
          }
          else if (normRound === 6) {
            roundScope = normRole === 'AI/ML' ? 'Python ML debugging, pandas/numpy vector diagnostics, tensor shapes mismatches, numerical precision overflow'
                      : normRole === 'DevOps' ? 'Bash scripts debugging, regex configurations, log trace files, Dockerfile errors, process termination flags'
                      : normRole === 'MERN Stack' ? 'NodeJS event loop blocks, React state updates side-effects, async callback leaks, mongo db cursor queries'
                      : 'Tricky execution logic, code trace puzzles, pointer operations, bitwise logic, memory leak scenarios'
          }
          else if (normRound === 7) { roundScope = 'Behavioral workplace situational scenarios, cultural alignment, leadership logic'; isBehavioral = true; }
        } else if (category === 'service') {
          if (normRound === 1) { roundScope = 'Quantitative aptitude, basic arithmetic, logical reasoning, numerical series'; isGeneralRound = true; }
          else if (normRound === 2) { roundScope = 'English comprehension, grammar, vocabulary, sentence correction'; isGeneralRound = true; }
          else if (normRound === 3) {
            roundScope = normRole === 'AI/ML' ? 'AI/ML basics, Python collections, statistics concepts, regression models, classification metrics'
                      : normRole === 'DevOps' ? 'Cloud foundations, basic command line shell utilities, Git workflow, CI jobs syntax'
                      : normRole === 'MERN Stack' ? 'Web fundamentals, basic HTML DOM, CSS rules, JavaScript array methods, express route setup'
                      : 'Technical fundamentals, OOPs, database queries, basic arrays and strings memory complexity'
          }
          else if (normRound === 5) { roundScope = 'Technical interview review, project situational dilemmas, HR communication, client coordination'; isBehavioral = true; }
        } else { // startup
          if (normRound === 1) { roundScope = 'Aptitude logic, analytical puzzles, quick math, logical deduction under time pressure'; isGeneralRound = true; }
          else if (normRound === 2) {
            roundScope = normRole === 'AI/ML' ? 'ML model setup, vector dot products, python functions, training loop checks'
                      : normRole === 'DevOps' ? 'Git actions, bash scripts, container setup, process port monitoring'
                      : normRole === 'MERN Stack' ? 'React component hooks, express REST handlers, asynchronous JS promises, mongo collections queries'
                      : 'Technical screening, programming language basics, asynchronous executions (JS callbacks/promises), basic algorithms'
          }
          else if (normRound === 4) {
            roundScope = normRole === 'AI/ML' ? 'Scalable data loading, vector databases queries indexing, inference server cache, batching data pipelines'
                      : normRole === 'DevOps' ? 'Docker orchestration, kubernetes pods routing, configuration state maps, secrets management'
                      : normRole === 'MERN Stack' ? 'MERN production deployment, reverse proxy caching, redis session stores, MongoDB performance aggregation'
                      : 'High-scale systems, database schema decisions, caching strategy, api scaling, and system execution logic'
          }
        }

        const compDiff = getCompanyDifficulty(normCompany)
        let roundFocus = ''
        if (isBehavioral) {
          roundFocus = `Generate situational questions evaluating professional behavior, communication, team collaboration, and client relations matching the standards of ${normCompany}. No coding or math.`
        } else if (isGeneralRound) {
          roundFocus = `Generate questions on ${roundScope}. Focus purely on math, logic, verbal, or analytical reasoning. Do NOT include coding, software engineering terminology, or system architecture.`
        } else {
          roundFocus = `Generate questions testing ${roundScope} tailored specifically for a ${normRole} position. Include code debugging snippets, complexity, algorithms, and tech stack concepts.`
        }

        prompt = `Generate 10 MCQ questions for Round ${normRound} of simulated recruitment at ${normCompany}.
Topic: ${roundScope}.
Focus: ${roundFocus}.
Difficulty: ${compDiff} level.
Format: Minified JSON object with key "questions" (array).
MCQ structure:
- id: 1-10
- q: short question text
- o: 4 options
- c: index of correct option (0-3)
- e: explanation (max 5 words)
Constraint: Do NOT pretty-print. Do NOT include markdown code blocks. Keep all text extremely short to save tokens.`
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

function handleOfflineTestFallback(company: string, round: number, role: string = 'Software Engineer') {
  const category = getCompanyCategory(company)
  const isCoding = (category === 'product' && round === 4) ||
                   (category === 'service' && round === 4) ||
                   (category === 'startup' && round === 3)
  
  if (isCoding) {
    let problem = OFFLINE_CODING_FALLBACKS[category] || OFFLINE_CODING_FALLBACKS.product

    if (role === 'AI/ML') {
      problem = {
        title: "Vector Distance Calculator",
        description: "Calculate the Euclidean distance between two 1D numeric vectors representing array of floats.",
        constraints: "Vector dimensions N <= 1000",
        inputFormat: "The first line contains N. The next 2 lines contain space-separated floats.",
        outputFormat: "Print the Euclidean distance rounded to 2 decimal places.",
        sampleInput: "3\n1.0 2.0 3.0\n4.0 5.0 6.0",
        sampleOutput: "5.20",
        testCases: [
          { input: "3\n1.0 2.0 3.0\n4.0 5.0 6.0", output: "5.20" },
          { input: "2\n0.0 0.0\n3.0 4.0", output: "5.00" },
          { input: "1\n10.5\n2.5", output: "8.00" }
        ],
        starterTemplates: {
          python: `import sys\nimport math\n\ndef solve():\n    lines = sys.stdin.read().splitlines()\n    if len(lines) < 3:\n        return\n    n = int(lines[0])\n    # TODO: Parse vector 1 and vector 2, calculate Euclidean distance\n    \n    # Print output rounded to 2 decimal places\n    pass\n\nif __name__ == '__main__':\n    solve()`,
          javascript: `const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf-8');\n    const lines = input.trim().split('\\n');\n    if (lines.length < 3) return;\n    const n = parseInt(lines[0]);\n    // TODO: Parse vector 1 and vector 2, calculate Euclidean distance\n    \n    // Print output rounded to 2 decimal places\n}\n\nsolve();`,
          cpp: `#include <iostream>\n#include <vector>\n#include <cmath>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    // TODO: Parse vectors and calculate Euclidean distance\n    return 0;\n}`,
          java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        // TODO: Parse vectors and calculate Euclidean distance\n    }\n}`
        }
      }
    } else if (role === 'DevOps') {
      problem = {
        title: "Log Event Parser",
        description: "Parse log events and extract count of lines that match 'ERROR' status.",
        constraints: "Lines of log L <= 5000",
        inputFormat: "The first line contains number of lines L. The next L lines contain log entries.",
        outputFormat: "Print the total count of error lines.",
        sampleInput: "3\n[INFO] User logged in\n[ERROR] Connection timeout\n[WARNING] Retry attempt 1",
        sampleOutput: "1",
        testCases: [
          { input: "3\n[INFO] User logged in\n[ERROR] Connection timeout\n[WARNING] Retry attempt 1", output: "1" },
          { input: "2\n[ERROR] Database down\n[ERROR] Write failed", output: "2" },
          { input: "1\n[INFO] Healthy state", output: "0" }
        ],
        starterTemplates: {
          python: `import sys\n\ndef solve():\n    lines = sys.stdin.read().splitlines()\n    if not lines:\n        return\n    l = int(lines[0])\n    # TODO: Count the number of error logs in lines[1...l]\n    pass\n\nif __name__ == '__main__':\n    solve()`,
          javascript: `const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf-8');\n    const lines = input.trim().split('\\n');\n    if (lines.length === 0 || !lines[0]) return;\n    const l = parseInt(lines[0]);\n    // TODO: Count the number of error logs\n}\n\nsolve();`,
          cpp: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    int l;\n    if (!(cin >> l)) return 0;\n    // TODO: Count the number of error logs\n    return 0;\n}`,
          java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        // TODO: Count the number of error logs\n    }\n}`
        }
      }
    } else if (role === 'MERN Stack') {
      problem = {
        title: "Deep Merge Configurations",
        description: "Given two flat dictionary/object structures in key=value format, deep merge them into a single sorted output list of key=value.",
        constraints: "Keys count K <= 500",
        inputFormat: "The first line contains N (number of lines of config 1). The next N lines contain key=value format. The next line contains M (number of lines of config 2). The next M lines contain key=value. Second config keys overwrite the first.",
        outputFormat: "Print the sorted list of key=value lines representing the merged configuration.",
        sampleInput: "2\nport=3000\nhost=localhost\n2\nport=8080\ndb=mongo",
        sampleOutput: "db=mongo\nhost=localhost\nport=8080",
        testCases: [
          { input: "2\nport=3000\nhost=localhost\n2\nport=8080\ndb=mongo", output: "db=mongo\nhost=localhost\nport=8080" },
          { input: "1\na=1\n1\nb=2", output: "a=1\nb=2" },
          { input: "1\nx=hello\n1\nx=world", output: "x=world" }
        ],
        starterTemplates: {
          python: `import sys\n\ndef solve():\n    lines = sys.stdin.read().splitlines()\n    # TODO: Deep merge config 1 and config 2, print sorted merged output\n    pass\n\nif __name__ == '__main__':\n    solve()`,
          javascript: `const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf-8');\n    const lines = input.trim().split('\\n');\n    // TODO: Deep merge and print sorted output\n}\n\nsolve();`,
          cpp: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    // TODO: Deep merge and print sorted output\n    return 0;\n}`,
          java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        // TODO: Deep merge and print sorted output\n    }\n}`
        }
      }
    }

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
  let offlineKey = 'python' // default
  if (category === 'product') {
    if (round === 1) { subject = 'Quantitative Aptitude'; offlineKey = 'aptitude'; }
    else if (round === 2) { subject = 'English & Verbal Ability'; offlineKey = 'english/verbal ability'; }
    else if (round === 3) subject = 'Technical Screening DSA'
    else if (round === 5) subject = 'System Design Scaling'
    else if (round === 6) subject = 'Tricky logic operations'
    else if (round === 7) subject = 'Behavioral scenario choices'
  } else if (category === 'service') {
    if (round === 1) { subject = 'Quantitative Aptitude'; offlineKey = 'aptitude'; }
    else if (round === 2) { subject = 'English & Verbal Ability'; offlineKey = 'english/verbal ability'; }
    else if (round === 3) subject = 'Technical fundamentals'
    else if (round === 5) subject = 'Technical HR project management'
  } else {
    if (round === 1) { subject = 'Aptitude analytical puzzles'; offlineKey = 'logical reasoning'; }
    else if (round === 2) subject = 'Technical async variables'
    else if (round === 4) subject = 'High-scale systems caching'
  }

  const diffLevel = category === 'service' ? 'easy' : category === 'product' ? 'hard' : 'medium'
  const predefined = OFFLINE_PRACTICE[offlineKey]?.[diffLevel] || OFFLINE_PRACTICE.python.easy

  for (let i = 1; i <= 10; i++) {
    const q = predefined[(i - 1) % predefined.length]
    list.push({
      id: i,
      question: `[Simulated ${subject}] ${q.question}`,
      options: q.options,
      correctOption: q.correctOption,
      explanation: q.explanation
    })
  }

  return NextResponse.json({
    questions: list,
    isAI: false
  })
}
