import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDb()
    
    // Fetch last 7 updated dates in history
    const logs = await db.collection('schedule')
      .find({ userId: 'dharmendra_pandit', date: { $exists: true, $ne: null } })
      .sort({ date: -1 })
      .limit(7)
      .toArray()

    return NextResponse.json({
      logs: logs.map(doc => ({
        date: doc.date,
        completedTimes: doc.completedTimes || []
      }))
    })
  } catch (error) {
    console.error('Error fetching schedule logs history from MongoDB:', error)
    return NextResponse.json({ logs: [] })
  }
}
