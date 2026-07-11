import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
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

    const { searchParams } = new URL(req.url)
    const increment = searchParams.get('increment') !== 'false'

    const db = await getDb()

    if (increment) {
      // Increment read count
      await db.collection('blogs').updateOne(
        { _id: blogId },
        { $inc: { reads: 1 } }
      )
    }

    const blog = await db.collection('blogs').findOne({ _id: blogId })

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    return NextResponse.json(blog)
  } catch (error) {
    console.error('Error fetching blog details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const body = await req.json()
    const { title, content, tags, author } = body

    if (!title || !content || !author) {
      return NextResponse.json(
        { error: 'Missing title, content, or author' },
        { status: 400 }
      )
    }

    const tagsArray = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map(t => t.trim()).filter(Boolean)
      : []

    const updateResult = await db.collection('blogs').updateOne(
      { _id: blogId },
      {
        $set: {
          title,
          content,
          tags: tagsArray,
          author,
          updatedAt: new Date().toISOString()
        }
      }
    )

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    const updatedBlog = await db.collection('blogs').findOne({ _id: blogId })

    return NextResponse.json({
      success: true,
      blog: updatedBlog
    })
  } catch (error) {
    console.error('Error updating blog in MongoDB:', error)
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    const deleteResult = await db.collection('blogs').deleteOne({ _id: blogId })

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting blog in MongoDB:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}
