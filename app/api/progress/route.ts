import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

const DEFAULT_PROGRESS = {
  userId: 'dharmendra_pandit',
  practiceCount: 0,
  mockTestsCount: 0,
  history: []
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
        { $set: { practiceCount: 0, mockTestsCount: 0, history: [] } },
        { upsert: true }
      )
      return NextResponse.json({ success: true, practiceCount: 0, mockTestsCount: 0, history: [] })
    }

    const incrementField = type === 'practice' ? 'practiceCount' : 'mockTestsCount'
    const { topic, difficulty, score, total } = body

    const updateObj: any = {
      $inc: { [incrementField]: 1 }
    }

    if (topic) {
      updateObj.$push = {
        history: {
          type,
          topic,
          difficulty: difficulty || 'medium',
          score: typeof score === 'number' ? score : 0,
          total: typeof total === 'number' ? total : 20,
          timestamp: new Date()
        }
      }
    }

    const result = await db.collection('progress').findOneAndUpdate(
      { userId: 'dharmendra_pandit' },
      updateObj,
      { upsert: true, returnDocument: 'after' }
    )

    // In modern mongodb package, result is either the document itself, or has a value property
    const updatedDocument = result || DEFAULT_PROGRESS

    return NextResponse.json({
      success: true,
      practiceCount: updatedDocument.practiceCount ?? 0,
      mockTestsCount: updatedDocument.mockTestsCount ?? 0,
      history: updatedDocument.history ?? []
    })
  } catch (error) {
    console.error('Error updating progress in MongoDB:', error)
    return NextResponse.json(
      { success: false, error: 'Database connection offline' },
      { status: 500 }
    )
  }
}
