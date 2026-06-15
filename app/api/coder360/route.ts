import { NextResponse } from 'next/server'

export async function GET() {
  const res = await fetch(
    'https://api.codingninjas.com/api/v3/public_section/profile/user_details?uuid=panditbth',
  )
  const data = await res.json()
  const solved = data?.data?.dsa_domain_data?.problem_count_data

  return NextResponse.json(solved)
}
