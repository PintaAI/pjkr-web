import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

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

    const soal = await prisma.soal.findFirst({
      where: {
        id: soalId,
        isActive: true,
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
            user: {
              select: {
                id: true,
                name: true,
              },
            },
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

    // Check if user has access to this soal (either owns it or koleksi soal is public)
    const koleksiSoal = await prisma.koleksiSoal.findUnique({
      where: { id: soal.koleksiSoalId },
      select: { isPrivate: true },
    })
    const hasAccess = soal.authorId === session.user.id || !koleksiSoal?.isPrivate

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
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

    // Check if soal exists and user owns it
    const existingSoal = await prisma.soal.findFirst({
      where: {
        id: soalId,
        authorId: session.user.id,
      },
    })

    if (!existingSoal) {
      return NextResponse.json(
        { success: false, error: 'Soal not found or access denied' },
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

    // Check if soal exists and user owns it
    const existingSoal = await prisma.soal.findFirst({
      where: {
        id: soalId,
        authorId: session.user.id,
      },
    })

    if (!existingSoal) {
      return NextResponse.json(
        { success: false, error: 'Soal not found or access denied' },
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