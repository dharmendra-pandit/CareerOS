import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch(
      'https://www.geeksforgeeks.org/profile/iampanditbth/',
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        next: { revalidate: 3600 },
      },
    )

    if (!res.ok) {
      throw new Error(`Failed to fetch profile: ${res.status}`)
    }

    const html = await res.text()

    const extract = (regex: RegExp, fallback = '0') => {
      const match = html.match(regex)
      return match ? match[1] : fallback
    }

    const data = {
      codingScore: Number(extract(/\\?"score\\?":\s*(\d+)/)),

      problemsSolved: Number(extract(/\\?"total_problems_solved\\?":\s*(\d+)/)),

      instituteRank: Number(extract(/\\?"pod_global_rank\\?":\s*(\d+)/)),

      articlesPublished: Number(extract(/\\?"article_count\\?":\s*(\d+)/)),

      school: Number(extract(/\\?"school_count\\?":\s*(\d+)/)),

      basic: Number(extract(/\\?"basic_count\\?":\s*(\d+)/)),

      easy: Number(extract(/\\?"easy_count\\?":\s*(\d+)/)),

      medium: Number(extract(/\\?"medium_count\\?":\s*(\d+)/)),

      hard: Number(extract(/\\?"hard_count\\?":\s*(\d+)/)),
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('GFG API Error:', error)

    return NextResponse.json(
      {
        codingScore: 0,
        problemsSolved: 0,
        instituteRank: 0,
        articlesPublished: 0,
        school: 0,
        basic: 0,
        easy: 0,
        medium: 0,
        hard: 0,
      },
      { status: 500 },
    )
  }
}
