import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDb()
    const blogs = await db
      .collection('blogs')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()
    
    return NextResponse.json(blogs)
  } catch (error) {
    console.error('Error fetching blogs from MongoDB:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blogs from database' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
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

    const newBlog = {
      title,
      content,
      tags: tagsArray,
      author,
      reads: 0,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString()
    }

    const result = await db.collection('blogs').insertOne(newBlog)
    
    return NextResponse.json({
      success: true,
      blog: { ...newBlog, _id: result.insertedId }
    })
  } catch (error) {
    console.error('Error creating blog in MongoDB:', error)
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}
