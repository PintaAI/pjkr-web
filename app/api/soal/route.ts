import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { canAccessKoleksiSoal } from '@/lib/access-control'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    const userId = session?.user?.id || null

    const searchParams = request.nextUrl.searchParams
    const koleksiSoalId = searchParams.get('koleksiSoalId')
    const authorId = searchParams.get('authorId')
    const difficulty = searchParams.get('difficulty') as any
    const isActive = searchParams.get('isActive')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    const where: any = {}

    // If koleksiSoalId is specified, check access control first
    if (koleksiSoalId) {
      const koleksiSoalIdNum = parseInt(koleksiSoalId)
      
      // Check if user has access to this koleksi soal
      const hasAccess = await canAccessKoleksiSoal(userId, koleksiSoalIdNum)
      
      console.log(`[DEBUG] User ${userId} requesting koleksiSoalId ${koleksiSoalIdNum}`)
      console.log(`[DEBUG] Access result: ${hasAccess}`)
      
      if (!hasAccess) {
        return NextResponse.json(
          { success: false, error: 'Access denied to this question collection' },
          { status: 403 }
        )
      }
      
      where.koleksiSoalId = koleksiSoalIdNum
    }
    
    if (authorId) where.authorId = authorId
    if (difficulty) where.difficulty = difficulty
    if (isActive !== null) where.isActive = isActive === 'true'
    
    // If user is not logged in, only return questions from public collections
    if (!userId) {
      where.koleksiSoal = {
        isPrivate: false,
        isDraft: false
      }
    }

    const soal = await prisma.soal.findMany({
      where,
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
            isDraft: false,
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
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    return NextResponse.json({
      success: true,
      data: soal,
      meta: {
        total: soal.length,
        offset,
        limit,
      },
    })
  } catch (error) {
    console.error('Error fetching soal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch soal' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      koleksiSoalId,
      pertanyaan,
      difficulty,
      explanation,
      isActive = true,
      order,
      opsi,
      attachments,
    } = body

    // Validate required fields
    if (!koleksiSoalId || !pertanyaan || !opsi || opsi.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Koleksi soal ID, pertanyaan, and opsi are required' },
        { status: 400 }
      )
    }

    // Check if koleksi soal exists and user has access
    const koleksiSoal = await prisma.koleksiSoal.findFirst({
      where: {
        id: parseInt(koleksiSoalId),
        userId: session.user.id,
      },
    })

    if (!koleksiSoal) {
      return NextResponse.json(
        { success: false, error: 'Koleksi soal not found or access denied' },
        { status: 404 }
      )
    }

    const soal = await prisma.soal.create({
      data: {
        koleksiSoalId: parseInt(koleksiSoalId),
        authorId: session.user.id,
        pertanyaan,
        difficulty: difficulty || 'BEGINNER',
        explanation,
        isActive,
        order: order || 0,
        opsis: {
          create: opsi.map((opsiData: any) => ({
            opsiText: opsiData.opsiText,
            isCorrect: opsiData.isCorrect,
            order: opsiData.order || 0,
          })),
        },
        attachments: attachments ? {
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
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating soal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create soal' },
      { status: 500 }
    )
  }
}