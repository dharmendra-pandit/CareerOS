import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

const DEFAULT_PROFILE = {
  userId: 'dharmendra_pandit',
  name: 'Dharmendra Pandit',
  role: 'Software Engineer',
  email: 'dharmendra193728@gmail.com',
  prepInternship: true,
  prepPlacement: true,
  prepGovt: false,
  notifyDaily: true,
  notifyWeekly: true,
  notifyAlerts: false,
  theme: 'Dark'
}

export async function GET() {
  try {
    const db = await getDb()
    const profile = await db.collection('profile').findOne({ userId: 'dharmendra_pandit' })
    
    if (!profile) {
      return NextResponse.json(DEFAULT_PROFILE)
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching profile from MongoDB:', error)
    // Fallback to default in case MongoDB connection string is not set up yet
    return NextResponse.json(DEFAULT_PROFILE)
  }
}

export async function POST(req: Request) {
  try {
    const db = await getDb()
    const body = await req.json()

    // Filter update body to allowed keys
    const updateData = {
      name: body.name ?? DEFAULT_PROFILE.name,
      role: body.role ?? DEFAULT_PROFILE.role,
      email: body.email ?? DEFAULT_PROFILE.email,
      prepInternship: body.prepInternship ?? DEFAULT_PROFILE.prepInternship,
      prepPlacement: body.prepPlacement ?? DEFAULT_PROFILE.prepPlacement,
      prepGovt: body.prepGovt ?? DEFAULT_PROFILE.prepGovt,
      notifyDaily: body.notifyDaily ?? DEFAULT_PROFILE.notifyDaily,
      notifyWeekly: body.notifyWeekly ?? DEFAULT_PROFILE.notifyWeekly,
      notifyAlerts: body.notifyAlerts ?? DEFAULT_PROFILE.notifyAlerts,
      theme: body.theme ?? DEFAULT_PROFILE.theme,
    }

    await db.collection('profile').updateOne(
      { userId: 'dharmendra_pandit' },
      { $set: updateData },
      { upsert: true }
    )

    return NextResponse.json({ success: true, profile: updateData })
  } catch (error) {
    console.error('Error saving profile to MongoDB:', error)
    return NextResponse.json(
      { success: false, error: 'Database connection offline' },
      { status: 500 }
    )
  }
}
