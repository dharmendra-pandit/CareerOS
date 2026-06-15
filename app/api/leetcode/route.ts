import { NextResponse } from 'next/server'

export async function GET() {
  const res = await fetch(
    'https://alfa-leetcode-api.onrender.com/dpbth/profile',
  )
  const data = await res.json()
  return NextResponse.json(data)
}
