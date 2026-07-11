import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    let blogId: ObjectId
    try {
      blogId = new ObjectId(id)
    } catch {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }

    const db = await getDb()
    const updateResult = await db.collection('blogs').updateOne(
      { _id: blogId },
      { $inc: { likes: 1 } }
    )

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    const updatedBlog = await db.collection('blogs').findOne({ _id: blogId })

    return NextResponse.json({
      success: true,
      likes: updatedBlog?.likes || 0
    })
  } catch (error) {
    console.error('Error incrementing blog likes:', error)
    return NextResponse.json(
      { error: 'Failed to record like' },
      { status: 500 }
    )
  }
}
