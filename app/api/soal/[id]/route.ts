import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { canAccessSoal, canModifySoal } from '@/lib/access-control'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const soalId = parseInt(id)

    if (isNaN(soalId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid soal ID' },
        { status: 400 }
      )
    }

    // Check if user can access this soal
    const canAccess = await canAccessSoal(session.user.id, soalId)
    if (!canAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    const soal = await prisma.soal.findUnique({
      where: { id: soalId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        koleksiSoal: {
          select: {
            id: true,
            nama: true,
            deskripsi: true,
            isPrivate: true,
            isDraft: true,
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
            kelasKoleksiSoals: {
              include: {
                kelas: {
                  select: {
                    id: true,
                    title: true,
                    authorId: true,
                    members: {
                      where: { id: session.user.id },
                      select: { id: true }
                    }
                  }
                }
              }
            }
          },
        },
        opsis: {
          orderBy: {
            order: 'asc',
          },
        },
        attachments: true,
      },
    })

    if (!soal) {
      return NextResponse.json(
        { success: false, error: 'Soal not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: soal,
    })
  } catch (error) {
    console.error('Error fetching soal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch soal' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const soalId = parseInt(id)

    if (isNaN(soalId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid soal ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      pertanyaan,
      difficulty,
      explanation,
      isActive,
      order,
      opsi,
      attachments,
    } = body

    // Check if user can modify this soal
    const canModify = await canModifySoal(session.user.id, soalId)
    if (!canModify) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check if soal exists
    const existingSoal = await prisma.soal.findUnique({
      where: { id: soalId }
    })

    if (!existingSoal) {
      return NextResponse.json(
        { success: false, error: 'Soal not found' },
        { status: 404 }
      )
    }

    const soal = await prisma.soal.update({
      where: { id: soalId },
      data: {
        pertanyaan,
        difficulty,
        explanation,
        isActive,
        order,
        opsis: opsi ? {
          deleteMany: {},
          create: opsi.map((opsiData: any) => ({
            opsiText: opsiData.opsiText,
            isCorrect: opsiData.isCorrect,
            order: opsiData.order || 0,
          })),
        } : undefined,
        attachments: attachments ? {
          deleteMany: {},
          create: attachments,
        } : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        koleksiSoal: {
          select: {
            id: true,
            nama: true,
            deskripsi: true,
            isPrivate: true,
          },
        },
        opsis: {
          orderBy: {
            order: 'asc',
          },
        },
        attachments: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: soal,
    })
  } catch (error) {
    console.error('Error updating soal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update soal' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const soalId = parseInt(id)

    if (isNaN(soalId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid soal ID' },
        { status: 400 }
      )
    }

    // Check if user can modify this soal
    const canModify = await canModifySoal(session.user.id, soalId)
    if (!canModify) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check if soal exists
    const existingSoal = await prisma.soal.findUnique({
      where: { id: soalId }
    })

    if (!existingSoal) {
      return NextResponse.json(
        { success: false, error: 'Soal not found' },
        { status: 404 }
      )
    }

    await prisma.soal.delete({
      where: { id: soalId },
    })

    return NextResponse.json({
      success: true,
      message: 'Soal deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting soal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete soal' },
      { status: 500 }
    )
  }
}