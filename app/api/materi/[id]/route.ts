import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/materi/[id] - Get specific material
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const materiId = parseInt(params.id)
    
    if (isNaN(materiId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid material ID' },
        { status: 400 }
      )
    }

    const materi = await prisma.materi.findUnique({
      where: { id: materiId },
      include: {
        kelas: {
          select: {
            id: true,
            title: true,
            type: true,
            level: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        completions: {
          select: {
            id: true,
            userId: true,
            isCompleted: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        _count: {
          select: {
            completions: true
          }
        }
      }
    })

    if (!materi) {
      return NextResponse.json(
        { success: false, error: 'Material not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: materi
    })
  } catch (error) {
    console.error('Error fetching materi:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch material' },
      { status: 500 }
    )
  }
}

// PUT /api/materi/[id] - Update specific material
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const materiId = parseInt(params.id)
    
    if (isNaN(materiId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid material ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      jsonDescription,
      htmlDescription,
      order,
      isDemo
    } = body

    // Check if material exists
    const existingMateri = await prisma.materi.findUnique({
      where: { id: materiId }
    })

    if (!existingMateri) {
      return NextResponse.json(
        { success: false, error: 'Material not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (jsonDescription !== undefined) updateData.jsonDescription = jsonDescription
    if (htmlDescription !== undefined) updateData.htmlDescription = htmlDescription
    if (order !== undefined) updateData.order = order
    if (isDemo !== undefined) updateData.isDemo = isDemo

    const materi = await prisma.materi.update({
      where: { id: materiId },
      data: updateData,
      include: {
        kelas: {
          select: {
            id: true,
            title: true,
            type: true,
            level: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: materi
    })
  } catch (error) {
    console.error('Error updating materi:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update material' },
      { status: 500 }
    )
  }
}

// DELETE /api/materi/[id] - Delete specific material
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const materiId = parseInt(params.id)
    
    if (isNaN(materiId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid material ID' },
        { status: 400 }
      )
    }

    // Check if material exists
    const existingMateri = await prisma.materi.findUnique({
      where: { id: materiId }
    })

    if (!existingMateri) {
      return NextResponse.json(
        { success: false, error: 'Material not found' },
        { status: 404 }
      )
    }

    await prisma.materi.delete({
      where: { id: materiId }
    })

    return NextResponse.json({
      success: true,
      message: 'Material deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting materi:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete material' },
      { status: 500 }
    )
  }
}
