import { NextResponse } from 'next/server'

const FALLBACK_GFG = {
  codingScore: 480,
  problemsSolved: 215,
  instituteRank: 42,
  articlesPublished: 3,
  school: 25,
  basic: 45,
  easy: 75,
  medium: 55,
  hard: 15
}

export async function GET() {
  try {
    const res = await fetch(
      'https://www.geeksforgeeks.org/profile/iampanditbth/',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        next: { revalidate: 3600 }
      }
    )

    if (!res.ok) {
      console.warn(`GFG API returned status ${res.status}. Returning fallback data.`)
      return NextResponse.json(FALLBACK_GFG)
    }

    const html = await res.text()

    const extract = (regex: RegExp, fallback = '0') => {
      const match = html.match(regex)
      return match ? match[1] : fallback
    }

    const data = {
      codingScore: Number(extract(/\\?"score\\?":\s*(\d+)/, '480')),
      problemsSolved: Number(extract(/\\?"total_problems_solved\\?":\s*(\d+)/, '215')),
      instituteRank: Number(extract(/\\?"pod_global_rank\\?":\s*(\d+)/, '42')),
      articlesPublished: Number(extract(/\\?"article_count\\?":\s*(\d+)/, '3')),
      school: Number(extract(/\\?"school_count\\?":\s*(\d+)/, '25')),
      basic: Number(extract(/\\?"basic_count\\?":\s*(\d+)/, '45')),
      easy: Number(extract(/\\?"easy_count\\?":\s*(\d+)/, '75')),
      medium: Number(extract(/\\?"medium_count\\?":\s*(\d+)/, '55')),
      hard: Number(extract(/\\?"hard_count\\?":\s*(\d+)/, '15'))
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('GFG API Error:', error)
    return NextResponse.json(FALLBACK_GFG)
  }
}
