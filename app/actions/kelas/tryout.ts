"use server";

import { prisma } from '@/lib/db';
import { assertAuthenticated } from '@/lib/auth-actions';
import { z } from 'zod';

const tryoutSchema = z.object({
  nama: z.string().min(1).max(255),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  duration: z.number().int().min(1).default(30),
  maxAttempts: z.number().int().min(1).default(1),
  shuffleQuestions: z.boolean().default(false),
  passingScore: z.number().int().min(0).max(100).default(60),
  koleksiSoalId: z.number().int().positive(),
  isActive: z.boolean().default(false),
});

export async function saveTryout(tryoutData: z.infer<typeof tryoutSchema>, tryoutId?: number) {
  try {
    const session = await assertAuthenticated();
    const valid = tryoutSchema.parse(tryoutData);

    // Verify user owns the koleksiSoal
    const koleksi = await prisma.koleksiSoal.findUnique({
      where: { id: valid.koleksiSoalId },
      select: { userId: true }
    });

    if (!koleksi) {
      return { success: false, error: 'Question collection not found' };
    }

    if (koleksi.userId !== session.user.id) {
      return { success: false, error: 'Not authorized to use this question collection' };
    }

    let tryout;
    if (tryoutId) {
      // Update existing tryout
      const existingTryout = await prisma.tryout.findUnique({
        where: { id: tryoutId },
        select: { guruId: true }
      });

      if (!existingTryout) {
        return { success: false, error: 'Tryout not found' };
      }

      if (existingTryout.guruId !== session.user.id) {
        return { success: false, error: 'Not authorized to update this tryout' };
      }

      tryout = await prisma.tryout.update({
        where: { id: tryoutId },
        data: {
          nama: valid.nama,
          description: valid.description,
          startTime: new Date(valid.startTime),
          endTime: new Date(valid.endTime),
          duration: valid.duration,
          maxAttempts: valid.maxAttempts,
          shuffleQuestions: valid.shuffleQuestions,
          passingScore: valid.passingScore,
          koleksiSoalId: valid.koleksiSoalId,
          isActive: valid.isActive,
        },
      });
    } else {
      // Create new tryout
      tryout = await prisma.tryout.create({
        data: {
          nama: valid.nama,
          description: valid.description,
          startTime: new Date(valid.startTime),
          endTime: new Date(valid.endTime),
          duration: valid.duration,
          maxAttempts: valid.maxAttempts,
          shuffleQuestions: valid.shuffleQuestions,
          passingScore: valid.passingScore,
          koleksiSoalId: valid.koleksiSoalId,
          isActive: valid.isActive,
          guruId: session.user.id,
        },
      });
    }

    // Fetch the tryout with relations to return
    const finalTryout = await prisma.tryout.findUnique({
      where: { id: tryout.id },
      include: {
        koleksiSoal: {
          select: {
            id: true,
            nama: true,
          },
        },
        guru: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    return { success: true, data: finalTryout };
  } catch (error) {
    console.error("Save tryout error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to save tryout" };
  }
}

export async function deleteTryout(tryoutId: number) {
  try {
    const session = await assertAuthenticated();

    if (session.user.role !== "GURU") {
      return { success: false, error: "Not authorized" };
    }

    // Check if the tryout exists and belongs to the user
    const tryout = await prisma.tryout.findUnique({
      where: { id: tryoutId },
      select: { guruId: true }
    });

    if (!tryout) {
      return { success: false, error: "Tryout not found" };
    }

    if (tryout.guruId !== session.user.id) {
      return { success: false, error: "Not authorized to delete this tryout" };
    }

    // Delete the tryout (cascade will handle related records)
    await prisma.tryout.delete({
      where: { id: tryoutId }
    });

    return { success: true };
  } catch (error) {
    console.error("Delete tryout error:", error);
    return { success: false, error: "Failed to delete tryout" };
  }
}

export async function toggleTryoutActive(tryoutId: number) {
  try {
    const session = await assertAuthenticated();

    if (session.user.role !== "GURU") {
      return { success: false, error: "Not authorized" };
    }

    // Check if the tryout exists and belongs to the user
    const tryout = await prisma.tryout.findUnique({
      where: { id: tryoutId },
      select: { guruId: true, isActive: true }
    });

    if (!tryout) {
      return { success: false, error: "Tryout not found" };
    }

    if (tryout.guruId !== session.user.id) {
      return { success: false, error: "Not authorized to update this tryout" };
    }

    // Toggle active status
    const updatedTryout = await prisma.tryout.update({
      where: { id: tryoutId },
      data: {
        isActive: !tryout.isActive,
      },
    });

    return { success: true, data: updatedTryout };
  } catch (error) {
    console.error("Toggle tryout active error:", error);
    return { success: false, error: "Failed to toggle tryout status" };
  }
}

export async function getGuruTryouts() {
  try {
    const session = await assertAuthenticated();

    // This function is GURU-only - verify role before any database queries
    if (session.user.role !== "GURU") {
      return { success: false, error: "Not authorized" };
    }

    const userId = session.user.id;

    // Get only tryouts created by the guru
    const tryouts = await prisma.tryout.findMany({
      where: {
        guruId: userId,
      },
      include: {
        koleksiSoal: {
          select: {
            id: true,
            nama: true,
          },
        },
        guru: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: tryouts };
  } catch (error) {
    console.error("Get guru tryouts error:", error);
    return { success: false, error: "Failed to get tryouts" };
  }
}

export async function getGuruSoalSetsForTryout() {
  try {
    const session = await assertAuthenticated();

    // This function is GURU-only
    if (session.user.role !== "GURU") {
      return { success: false, error: "Not authorized" };
    }

    const userId = session.user.id;

    // Get soal sets created by the guru
    const soalSets = await prisma.koleksiSoal.findMany({
      where: {
        userId: userId,
      },
      include: {
        _count: {
          select: {
            soals: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: soalSets };
  } catch (error) {
    console.error("Get guru soal sets for tryout error:", error);
    return { success: false, error: "Failed to get soal sets" };
  }
}
