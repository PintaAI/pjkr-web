import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

// POST /api/kelas/[id]/enroll - Enroll user in class
export async function POST(
  request: NextRequest, 
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    // Get authenticated session
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const kelasId = parseInt(params.id)
    
    if (isNaN(kelasId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid class ID' },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { bypassPaymentCheck = false } = body

    const userId = session.user.id
    const userRole = session.user.role

    // Get class details
    const kelas = await prisma.kelas.findUnique({
      where: { id: kelasId },
      include: {
        members: {
          where: { id: userId },
          select: { id: true }
        }
      }
    })

    if (!kelas) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      )
    }

    if (!kelas || kelas.isDraft) {
      return NextResponse.json(
        { success: false, error: 'Class not available for enrollment' },
        { status: 400 }
      )
    }

    // Check if user is already enrolled (skip this check if bypassing payment)
    if (kelas.members.length > 0 && !bypassPaymentCheck) {
      return NextResponse.json(
        { success: false, error: 'Already enrolled in this class' },
        { status: 400 }
      )
    }

    // If bypassing payment check and user is already enrolled, treat as success
    if (kelas.members.length > 0 && bypassPaymentCheck) {
      return NextResponse.json({
        success: true,
        message: 'User is already enrolled in this class',
        enrolled: true
      })
    }

    // Check if user is the author
    if (kelas.authorId === userId) {
      return NextResponse.json(
        { success: false, error: 'Cannot enroll in your own class' },
        { status: 400 }
      )
    }

    // Enrollment logic based on user role and class type
    if (userRole === 'MURID' && kelas.isPaidClass && !bypassPaymentCheck) {
      // MURID + Paid Class: Requires payment
      return NextResponse.json({
        success: false,
        requiresPayment: true,
        error: 'Payment required for this class',
        paymentUrl: `/payment/kelas/${kelasId}`,
        price: kelas.price ? Number(kelas.price) : 0,
        discount: kelas.discount ? Number(kelas.discount) : 0
      }, { status: 402 }) // Payment Required
    }

    // Direct enrollment for:
    // - MURID + Free Class
    // - GURU/ADMIN + Any Class
    await prisma.kelas.update({
      where: { id: kelasId },
      data: {
        members: {
          connect: { id: userId }
        }
      }
    })

    // Add success message based on role
    let message = 'Successfully enrolled in class'
    if (userRole === 'GURU' || userRole === 'ADMIN') {
      message = 'Successfully joined class as ' + userRole.toLowerCase()
      // TODO: Implement GURU/ADMIN join request logic
    }

    return NextResponse.json({
      success: true,
      message,
      enrolled: true
    })

  } catch (error) {
    console.error('Error enrolling in class:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to enroll in class' },
      { status: 500 }
    )
  }
}

// DELETE /api/kelas/[id]/enroll - Unenroll user from class
export async function DELETE(
  request: NextRequest, 
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    // Get authenticated session
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const kelasId = parseInt(params.id)
    
    if (isNaN(kelasId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid class ID' },
        { status: 400 }
      )
    }

    const userId = session.user.id

    // Check if class exists and user is enrolled
    const kelas = await prisma.kelas.findUnique({
      where: { id: kelasId },
      include: {
        members: {
          where: { id: userId },
          select: { id: true }
        }
      }
    })

    if (!kelas) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      )
    }

    if (kelas.members.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Not enrolled in this class' },
        { status: 400 }
      )
    }

    // Unenroll user
    await prisma.kelas.update({
      where: { id: kelasId },
      data: {
        members: {
          disconnect: { id: userId }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully unenrolled from class',
      enrolled: false
    })

  } catch (error) {
    console.error('Error unenrolling from class:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to unenroll from class' },
      { status: 500 }
    )
  }
}
