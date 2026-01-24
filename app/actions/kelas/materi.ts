"use server";

import { prisma } from "@/lib/db";
import { assertAuthenticated } from "@/lib/auth-actions";
import { z } from "zod";

const materiSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  htmlDescription: z.string().min(1),
  jsonDescription: z.any().optional(),
  isDemo: z.boolean().default(false),
  koleksiSoalId: z.number().int().positive().nullable().optional(),
  passingScore: z.number().int().min(0).max(100).nullable().optional(),
});

// Add materis to kelas
export async function addMateris(kelasId: number, materis: (z.infer<typeof materiSchema> & { tempId?: string })[]) {
  try {
    const session = await assertAuthenticated();

    // Check ownership
    const kelas = await prisma.kelas.findUnique({
      where: { id: kelasId },
      select: { authorId: true },
    });

    if (!kelas || kelas.authorId !== session.user.id) {
      return { success: false, error: "Not authorized" };
    }

    // Get next order number
    const lastMateri = await prisma.materi.findFirst({
      where: { kelasId },
      orderBy: { order: "desc" },
    });

    let order = lastMateri?.order || 0;

    // Create materis with tempId mapping
    const tempIdMapping: Record<string, number> = {};
    const createdMateris = await Promise.all(
      materis.map(async (materi) => {
        const validMateri = materiSchema.parse(materi);
        order += 1;
        
        const created = await prisma.materi.create({
          data: {
            ...validMateri,
            jsonDescription: validMateri.jsonDescription || {},
            kelasId,
            order,
            isDraft: false,
          },
        });

        // Map tempId to real ID if tempId exists
        if (materi.tempId) {
          tempIdMapping[materi.tempId] = created.id;
        }

        return created;
      })
    );

    return {
      success: true,
      data: createdMateris,
      tempIdMapping
    };
  } catch (error) {
    console.error("Add materis error:", error);
    return { success: false, error: "Failed to add materis" };
  }
}

// Reorder materis
export async function reorderMateris(kelasId: number, materiOrders: { id: number; order: number }[]) {
  try {
    const session = await assertAuthenticated();

    // Check ownership
    const kelas = await prisma.kelas.findUnique({
      where: { id: kelasId },
      select: { authorId: true },
    });

    if (!kelas || kelas.authorId !== session.user.id) {
      return { success: false, error: "Not authorized" };
    }

    // Update orders
    await Promise.all(
      materiOrders.map(({ id, order }) =>
        prisma.materi.update({
          where: { id },
          data: { order },
        })
      )
    );

    return { success: true, message: "Materis reordered successfully" };
  } catch (error) {
    console.error("Reorder materis error:", error);
    return { success: false, error: "Failed to reorder materis" };
  }
}

// Update materi
export async function updateMateri(materiId: number, data: Partial<any>) {
  try {
    const session = await assertAuthenticated();

    // Check ownership via materi -> kelas
    const materi = await prisma.materi.findUnique({
      where: { id: materiId },
      include: {
        kelas: {
          select: { authorId: true },
        },
      },
    });

    if (!materi || !materi.kelas || materi.kelas.authorId !== session.user.id) {
      return { success: false, error: "Not authorized" };
    }

    const updatedMateri = await prisma.materi.update({
      where: { id: materiId },
      data,
    });

    return { success: true, data: updatedMateri };
  } catch (error) {
    console.error("Update materi error:", error);
    return { success: false, error: "Failed to update lesson" };
  }
}

// Delete materi
export async function deleteMateri(materiId: number) {
  try {
    const session = await assertAuthenticated();

    // Check ownership via materi -> kelas
    const materi = await prisma.materi.findUnique({
      where: { id: materiId },
      include: {
        kelas: {
          select: { authorId: true },
        },
      },
    });

    if (!materi || !materi.kelas || materi.kelas.authorId !== session.user.id) {
      return { success: false, error: "Not authorized" };
    }

    await prisma.materi.delete({ where: { id: materiId } });

    return { success: true, message: "Lesson deleted successfully" };
  } catch (error) {
    console.error("Delete materi error:", error);
    return { success: false, error: "Failed to delete lesson" };
  }
}
