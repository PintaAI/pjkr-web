import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { canAccessKoleksiSoal, canModifyKoleksiSoal, canAccessKoleksiSoalForPractice } from '@/lib/access-control'

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
    const koleksiSoalId = parseInt(id)

    if (isNaN(koleksiSoalId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid koleksi soal ID' },
        { status: 400 }
      )
    }

    // Get query parameters including kelasId for practice access
    const { searchParams } = new URL(request.url)
    const kelasIdParam = searchParams.get('kelasId')
    const kelasId = kelasIdParam ? parseInt(kelasIdParam) : null

    // If kelasId is provided, check practice access specifically
    if (kelasId && !isNaN(kelasId)) {
      const hasPracticeAccess = await canAccessKoleksiSoalForPractice(
        session.user.id,
        koleksiSoalId,
        kelasId
      )

      if (!hasPracticeAccess) {
        return NextResponse.json(
          { success: false, error: 'Access denied: not enrolled in class' },
          { status: 403 }
        )
      }
    }

    const koleksiSoal = await prisma.koleksiSoal.findUnique({
      where: { id: koleksiSoalId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        soals: {
          select: {
            id: true,
            pertanyaan: true,
            difficulty: true,
            explanation: true,
            isActive: true,
            order: true,
            createdAt: true,
            updatedAt: true,
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
              include: {
                attachments: true,
              },
            },
            attachments: true,
          },
          orderBy: { order: 'asc' },
        },
        kelasKoleksiSoals: {
          include: {
            kelas: {
              select: {
                id: true,
                title: true,
                level: true,
              },
            },
          },
        },
        _count: {
          select: {
            soals: true,
          },
        },
      },
    })

    if (!koleksiSoal) {
      return NextResponse.json(
        { success: false, error: 'Koleksi soal not found' },
        { status: 404 }
      )
    }

    // If no kelasId provided, use the general access check
    if (!kelasId) {
      const hasAccess = await canAccessKoleksiSoal(session.user.id, koleksiSoalId)

      if (!hasAccess) {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: koleksiSoal,
    })
  } catch (error) {
    console.error('Error fetching koleksi soal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch koleksi soal' },
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
    const koleksiSoalId = parseInt(id)

    if (isNaN(koleksiSoalId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid koleksi soal ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      nama,
      deskripsi,
      isPrivate,
      isDraft,
    } = body

    // Check if user can modify this koleksi soal
    const canModify = await canModifyKoleksiSoal(session.user.id, koleksiSoalId)
    if (!canModify) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check if koleksi soal exists
    const existingKoleksiSoal = await prisma.koleksiSoal.findUnique({
      where: { id: koleksiSoalId },
    })

    if (!existingKoleksiSoal) {
      return NextResponse.json(
        { success: false, error: 'Koleksi soal not found' },
        { status: 404 }
      )
    }

    const koleksiSoal = await prisma.koleksiSoal.update({
      where: { id: koleksiSoalId },
      data: {
        nama,
        deskripsi,
        isPrivate,
        isDraft,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        soals: {
          select: {
            id: true,
            pertanyaan: true,
            difficulty: true,
            isActive: true,
            order: true,
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            opsis: {
              orderBy: {
                order: 'asc',
              },
            },
            attachments: true,
          },
          orderBy: { order: 'asc' },
        },
        kelasKoleksiSoals: {
          include: {
            kelas: {
              select: {
                id: true,
                title: true,
                level: true,
              },
            },
          },
        },
        _count: {
          select: {
            soals: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: koleksiSoal,
    })
  } catch (error) {
    console.error('Error updating koleksi soal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update koleksi soal' },
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
    const koleksiSoalId = parseInt(id)

    if (isNaN(koleksiSoalId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid koleksi soal ID' },
        { status: 400 }
      )
    }

    // Check if user can modify this koleksi soal
    const canModify = await canModifyKoleksiSoal(session.user.id, koleksiSoalId)
    if (!canModify) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check if koleksi soal exists
    const existingKoleksiSoal = await prisma.koleksiSoal.findUnique({
      where: { id: koleksiSoalId },
    })

    if (!existingKoleksiSoal) {
      return NextResponse.json(
        { success: false, error: 'Koleksi soal not found' },
        { status: 404 }
      )
    }

    await prisma.koleksiSoal.delete({
      where: { id: koleksiSoalId },
    })

    return NextResponse.json({
      success: true,
      message: 'Koleksi soal deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting koleksi soal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete koleksi soal' },
      { status: 500 }
    )
  }
}