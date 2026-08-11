import { NextResponse } from 'next/server'

const ACCURATE_LEETCODE = {
  totalSolved: 79,
  easySolved: 40,
  mediumSolved: 38,
  hardSolved: 1,
  totalSubmissions: [
    { difficulty: 'Easy', count: 40 },
    { difficulty: 'Medium', count: 38 },
    { difficulty: 'Hard', count: 1 }
  ]
}

export async function GET() {
  try {
    const postData = JSON.stringify({
      query: `
        query userProblemsSolved($username: String!) {
          matchedUser(username: $username) {
            submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
        }
      `,
      variables: { username: 'dpbth' }
    })

    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://leetcode.com/dpbth/'
      },
      body: postData,
      next: { revalidate: 600 }
    })

    if (!res.ok) {
      console.warn(`Official LeetCode GraphQL returned status ${res.status}. Returning fallback data.`)
      return NextResponse.json(ACCURATE_LEETCODE)
    }

    const payload = await res.json()
    const statsList = payload?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum

    if (Array.isArray(statsList)) {
      const allObj = statsList.find((s: any) => s.difficulty === 'All')
      const easyObj = statsList.find((s: any) => s.difficulty === 'Easy')
      const mediumObj = statsList.find((s: any) => s.difficulty === 'Medium')
      const hardObj = statsList.find((s: any) => s.difficulty === 'Hard')

      const easyCount = easyObj?.count ?? 40
      const mediumCount = mediumObj?.count ?? 38
      const hardCount = hardObj?.count ?? 1
      const totalCount = allObj?.count ?? (easyCount + mediumCount + hardCount)

      return NextResponse.json({
        totalSolved: totalCount,
        easySolved: easyCount,
        mediumSolved: mediumCount,
        hardSolved: hardCount,
        totalSubmissions: [
          { difficulty: 'Easy', count: easyCount },
          { difficulty: 'Medium', count: mediumCount },
          { difficulty: 'Hard', count: hardCount }
        ]
      })
    }

    return NextResponse.json(ACCURATE_LEETCODE)
  } catch (error) {
    console.error('LeetCode GraphQL Error:', error)
    return NextResponse.json(ACCURATE_LEETCODE)
  }
}
