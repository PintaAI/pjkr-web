import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const materiId = parseInt(resolvedParams.id);
    if (isNaN(materiId)) {
      return NextResponse.json({ error: 'Invalid materi ID' }, { status: 400 });
    }

    // Check if user is author or admin
    if (session.user.role !== 'GURU' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { koleksiSoalId, passingScore } = body;

    // Validate input
    if (koleksiSoalId !== undefined && (typeof koleksiSoalId !== 'number' || koleksiSoalId <= 0)) {
      return NextResponse.json({ error: 'Invalid koleksiSoalId' }, { status: 400 });
    }

    if (passingScore !== undefined && (typeof passingScore !== 'number' || passingScore < 0 || passingScore > 100)) {
      return NextResponse.json({ error: 'Invalid passingScore' }, { status: 400 });
    }

    // Check if materi exists
    const materi = await prisma.materi.findUnique({
      where: { id: materiId }
    });

    if (!materi) {
      return NextResponse.json({ error: 'Materi not found' }, { status: 404 });
    }

    // Check if koleksiSoal exists
    if (koleksiSoalId) {
      const koleksiSoal = await prisma.koleksiSoal.findUnique({
        where: { id: koleksiSoalId }
      });

      if (!koleksiSoal) {
        return NextResponse.json({ error: 'KoleksiSoal not found' }, { status: 404 });
      }
    }

    // Update materi with assessment config
    const updateData: any = {};
    if (koleksiSoalId !== undefined) {
      updateData.koleksiSoalId = koleksiSoalId;
    } else {
      updateData.koleksiSoalId = null;
    }

    if (passingScore !== undefined) {
      updateData.passingScore = passingScore;
    } else {
      updateData.passingScore = null;
    }

    const updatedMateri = await prisma.materi.update({
      where: { id: materiId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: updatedMateri
    });
  } catch (error) {
    console.error('Error updating materi assessment config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}