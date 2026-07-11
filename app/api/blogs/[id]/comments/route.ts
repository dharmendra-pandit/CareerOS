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

    const body = await req.json()
    const { text, author } = body

    if (!text || !author) {
      return NextResponse.json(
        { error: 'Missing comment text or author name' },
        { status: 400 }
      )
    }

    const newComment = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      author,
      createdAt: new Date().toISOString()
    }

    const db = await getDb()
    const updateResult = await db.collection('blogs').updateOne(
      { _id: blogId },
      { $push: { comments: newComment } } as any
    )

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    const updatedBlog = await db.collection('blogs').findOne({ _id: blogId })

    return NextResponse.json({
      success: true,
      comments: updatedBlog?.comments || []
    })
  } catch (error) {
    console.error('Error posting comment:', error)
    return NextResponse.json(
      { error: 'Failed to post comment' },
      { status: 500 }
    )
  }
}
