import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/vocabulary-sets/[id] - Get specific vocabulary set
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const setId = parseInt(params.id)
    
    if (isNaN(setId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid vocabulary set ID' },
        { status: 400 }
      )
    }

    const vocabularySet = await prisma.vocabularySet.findUnique({
      where: { id: setId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        kelas: {
          select: {
            id: true,
            title: true,
            type: true,
            level: true,
            thumbnail: true,
            author: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        items: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            items: true
          }
        }
      }
    })

    if (!vocabularySet) {
      return NextResponse.json(
        { success: false, error: 'Vocabulary set not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: vocabularySet
    })
  } catch (error) {
    console.error('Error fetching vocabulary set:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vocabulary set' },
      { status: 500 }
    )
  }
}

// PUT /api/vocabulary-sets/[id] - Update specific vocabulary set
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const setId = parseInt(params.id)
    
    if (isNaN(setId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid vocabulary set ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      icon,
      isPublic
    } = body

    // Check if vocabulary set exists
    const existingSet = await prisma.vocabularySet.findUnique({
      where: { id: setId }
    })

    if (!existingSet) {
      return NextResponse.json(
        { success: false, error: 'Vocabulary set not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (icon !== undefined) updateData.icon = icon
    if (isPublic !== undefined) updateData.isPublic = isPublic

    const vocabularySet = await prisma.vocabularySet.update({
      where: { id: setId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        kelas: {
          select: {
            id: true,
            title: true,
            type: true,
            level: true,
            thumbnail: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: vocabularySet
    })
  } catch (error) {
    console.error('Error updating vocabulary set:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update vocabulary set' },
      { status: 500 }
    )
  }
}

// DELETE /api/vocabulary-sets/[id] - Delete specific vocabulary set
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const setId = parseInt(params.id)
    
    if (isNaN(setId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid vocabulary set ID' },
        { status: 400 }
      )
    }

    // Check if vocabulary set exists
    const existingSet = await prisma.vocabularySet.findUnique({
      where: { id: setId }
    })

    if (!existingSet) {
      return NextResponse.json(
        { success: false, error: 'Vocabulary set not found' },
        { status: 404 }
      )
    }

    await prisma.vocabularySet.delete({
      where: { id: setId }
    })

    return NextResponse.json({
      success: true,
      message: 'Vocabulary set deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting vocabulary set:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete vocabulary set' },
      { status: 500 }
    )
  }
}
