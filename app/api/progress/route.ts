import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

const DEFAULT_PROGRESS = {
  userId: 'dharmendra_pandit',
  practiceCount: 0,
  mockTestsCount: 0
}

export async function GET() {
  try {
    const db = await getDb()
    const progress = await db.collection('progress').findOne({ userId: 'dharmendra_pandit' })
    
    if (!progress) {
      return NextResponse.json(DEFAULT_PROGRESS)
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error fetching progress from MongoDB:', error)
    return NextResponse.json(DEFAULT_PROGRESS)
  }
}

export async function POST(req: Request) {
  try {
    const db = await getDb()
    const body = await req.json()
    const { type } = body

    if (type === 'reset') {
      await db.collection('progress').updateOne(
        { userId: 'dharmendra_pandit' },
        { $set: { practiceCount: 0, mockTestsCount: 0 } },
        { upsert: true }
      )
      return NextResponse.json({ success: true, practiceCount: 0, mockTestsCount: 0 })
    }

    const incrementField = type === 'practice' ? 'practiceCount' : 'mockTestsCount'

    const result = await db.collection('progress').findOneAndUpdate(
      { userId: 'dharmendra_pandit' },
      { $inc: { [incrementField]: 1 } },
      { upsert: true, returnDocument: 'after' }
    )

    // In modern mongodb package, result is either the document itself, or has a value property
    const updatedDocument = result || DEFAULT_PROGRESS

    return NextResponse.json({
      success: true,
      practiceCount: updatedDocument.practiceCount ?? 0,
      mockTestsCount: updatedDocument.mockTestsCount ?? 0
    })
  } catch (error) {
    console.error('Error updating progress in MongoDB:', error)
    return NextResponse.json(
      { success: false, error: 'Database connection offline' },
      { status: 500 }
    )
  }
}
