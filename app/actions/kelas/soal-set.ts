"use server";
import { prisma } from '@/lib/db';
import { assertAuthenticated } from '@/lib/auth-actions';
import { z } from 'zod';

const soalSetLinkSchema = z.object({
  koleksiSoalId: z.number().int().positive(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  order: z.number().int().min(0).default(0),
});

export async function saveSoalSetLink(kelasId: number, data: z.infer<typeof soalSetLinkSchema>, soalSetId?: number) {
  try {
    const session = await assertAuthenticated();
    const valid = soalSetLinkSchema.parse(data);

    // Verify kelas ownership
    const kelas = await prisma.kelas.findUnique({ where: { id: kelasId }, select: { authorId: true } });
    if (!kelas || kelas.authorId !== session.user.id) {
      return { success: false, error: 'Not authorized' };
    }

    let record;
    if (soalSetId) {
      // Update only order and relation if needed; title/description may not exist yet if migration pending
      record = await prisma.kelasKoleksiSoal.update({
        where: { id: soalSetId },
        data: {
          order: valid.order,

          title: (valid as any).title,

          description: (valid as any).description,
          koleksiSoalId: valid.koleksiSoalId,
        },
      });
    } else {
      record = await prisma.kelasKoleksiSoal.create({
        data: {
          kelasId,
          koleksiSoalId: valid.koleksiSoalId,
          order: valid.order,
          title: (valid as any).title,
          description: (valid as any).description,
        },
      });
    }

    return { success: true, data: record };
  } catch (e) {
    console.error('saveSoalSetLink error', e);
    return { success: false, error: 'Failed to save soal set link' };
  }
}

export async function getGuruSoalSets() {
  try {
    const session = await assertAuthenticated();

    if (session.user.role !== "GURU") {
      return { success: false, error: "Not authorized" };
    }

    const userId = session.user.id;

    // Get kelas IDs that the user has joined
    const joinedKelas = await prisma.kelas.findMany({
      where: {
        members: {
          some: { id: userId }
        }
      },
      select: { id: true }
    });

    const joinedKelasIds = joinedKelas.map(k => k.id);

    // Get soal sets: either created by the guru or linked to joined kelas
    const soalSets = await prisma.koleksiSoal.findMany({
      where: {
        OR: [
          { userId: userId },
          {
            kelasKoleksiSoals: {
              some: {
                kelasId: { in: joinedKelasIds }
              }
            }
          }
        ]
      },
      include: {
        soals: {
          select: {
            id: true,
            pertanyaan: true,
            difficulty: true
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        },
        kelasKoleksiSoals: {
          include: {
            kelas: {
              select: {
                id: true,
                title: true,
                level: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: soalSets };
  } catch (error) {
    console.error("Get guru soal sets error:", error);
    return { success: false, error: "Failed to get soal sets" };
  }
}
