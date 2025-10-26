import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { canAccessMateri, canModifyMateri, filterDemoContent } from '@/lib/access-control'

// GET /api/materi/[id] - Get specific material
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const materiId = parseInt(params.id)
    
    if (isNaN(materiId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid material ID' },
        { status: 400 }
      )
    }

    // Check if user can access this materi
    const canAccess = await canAccessMateri(session.user.id, materiId)
    if (!canAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
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
            authorId: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            },
            members: {
              where: { id: session.user.id },
              select: { id: true }
            }
          }
        },
        koleksiSoal: {
          include: {
            soals: {
              include: {
                opsis: true
              },
              orderBy: {
                order: 'asc'
              }
            }
          }
        },
        completions: {
          select: {
            id: true,
            userId: true,
            isCompleted: true,
            assessmentPassed: true,
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
        assessments: {
          where: {
            userId: session.user.id
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    if (!materi) {
      return NextResponse.json(
        { success: false, error: 'Material not found' },
        { status: 404 }
      )
    }

    // Check if user is enrolled or is the author
    const isEnrolled = materi.kelas.authorId === session.user.id ||
                     materi.kelas.members.length > 0

    // Filter demo content for non-enrolled users
    const filteredMateri = filterDemoContent(materi, isEnrolled)

    return NextResponse.json({
      success: true,
      data: filteredMateri
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
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
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

    // Check if user can modify this materi
    const canModify = await canModifyMateri(session.user.id, materiId)
    if (!canModify) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
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
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const materiId = parseInt(params.id)
    
    if (isNaN(materiId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid material ID' },
        { status: 400 }
      )
    }

    // Check if user can modify this materi
    const canModify = await canModifyMateri(session.user.id, materiId)
    if (!canModify) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
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
