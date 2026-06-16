import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const all = searchParams.get('all')
    const date = searchParams.get('date')

    const db = await getDb()

    if (all === 'true') {
      const docs = await db.collection('schedule').find({
        userId: 'dharmendra_pandit'
      }).toArray()
      return NextResponse.json({
        schedules: docs.map(doc => ({
          date: doc.date,
          completedTimes: doc.completedTimes || []
        }))
      })
    }

    if (!date) {
      return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 })
    }

    const doc = await db.collection('schedule').findOne({
      userId: 'dharmendra_pandit',
      date: date
    })

    return NextResponse.json({
      completedTimes: doc?.completedTimes || []
    })
  } catch (error) {
    console.error('Error fetching schedule completions from MongoDB:', error)
    return NextResponse.json({ completedTimes: [], schedules: [] })
  }
}

export async function POST(req: Request) {
  try {
    const db = await getDb()
    const body = await req.json()
    const { date, time, completed } = body

    if (!date || !time) {
      return NextResponse.json({ error: 'Missing date or time parameters' }, { status: 400 })
    }

    const updateOperation = completed
      ? { $addToSet: { completedTimes: time } }
      : { $pull: { completedTimes: time } }

    await db.collection('schedule').updateOne(
      { userId: 'dharmendra_pandit', date: date },
      updateOperation as any,
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating schedule completion in MongoDB:', error)
    return NextResponse.json(
      { success: false, error: 'Database connection offline' },
      { status: 500 }
    )
  }
}
