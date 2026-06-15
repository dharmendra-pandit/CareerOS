import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import defaultTimetable from '../../data/timetable.json'

export async function GET() {
  try {
    const db = await getDb()
    const doc = await db.collection('timetable_templates').findOne({ userId: 'dharmendra_pandit' })

    if (!doc) {
      // Auto-populate collection with default template values on first query
      await db.collection('timetable_templates').insertOne({
        userId: 'dharmendra_pandit',
        templates: defaultTimetable
      })
      return NextResponse.json({ templates: defaultTimetable })
    }

    return NextResponse.json({ templates: doc.templates })
  } catch (error) {
    console.error('Error fetching timetable templates from MongoDB:', error)
    return NextResponse.json({ templates: defaultTimetable })
  }
}

export async function POST(req: Request) {
  try {
    const db = await getDb()
    const { templates } = await req.json()

    if (!templates) {
      return NextResponse.json({ error: 'Missing templates parameter' }, { status: 400 })
    }

    await db.collection('timetable_templates').updateOne(
      { userId: 'dharmendra_pandit' },
      { $set: { templates } },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating timetable templates in MongoDB:', error)
    return NextResponse.json(
      { success: false, error: 'Database connection offline' },
      { status: 500 }
    )
  }
}
