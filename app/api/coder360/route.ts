import { NextResponse } from 'next/server'

const FALLBACK_CODER360 = {
  easy_count: 85,
  medium_count: 110,
  hard_count: 28,
  total_count: 223
}

export async function GET() {
  try {
    const res = await fetch(
      'https://api.codingninjas.com/api/v3/public_section/profile/user_details?uuid=panditbth',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        next: { revalidate: 3600 }
      }
    )

    if (!res.ok) {
      console.warn(`Code360 API returned status ${res.status}. Returning fallback data.`)
      return NextResponse.json(FALLBACK_CODER360)
    }

    const text = await res.text()
    try {
      const data = JSON.parse(text)
      const solved = data?.data?.dsa_domain_data?.problem_count_data
      if (solved) {
        return NextResponse.json(solved)
      }
    } catch {
      console.warn('Code360 API returned non-JSON text. Returning fallback data.')
      return NextResponse.json(FALLBACK_CODER360)
    }

    return NextResponse.json(FALLBACK_CODER360)
  } catch (error) {
    console.error('Code360 API error:', error)
    return NextResponse.json(FALLBACK_CODER360)
  }
}
