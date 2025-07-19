"use server";

import { prisma } from "@/lib/db";
import { assertAuthenticated } from "@/lib/auth-actions";
import { KelasType, Difficulty } from "@prisma/client";
import { z } from "zod";

// Simple validation schemas - Use z.any() for JSON fields to ensure compatibility with Prisma
const createKelasSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  jsonDescription: z.any().optional(),
  htmlDescription: z.string().optional(),
  type: z.nativeEnum(KelasType).default(KelasType.REGULAR),
  level: z.nativeEnum(Difficulty),
  thumbnail: z.string().optional(),
  icon: z.string().optional(),
  isPaidClass: z.boolean().default(false),
  price: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  promoCode: z.string().optional(),
});

const updateKelasSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  jsonDescription: z.any().optional(),
  htmlDescription: z.string().optional(),
  type: z.nativeEnum(KelasType).optional(),
  level: z.nativeEnum(Difficulty).optional(),
  thumbnail: z.string().optional(),
  icon: z.string().optional(),
  isPaidClass: z.boolean().optional(),
  price: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  promoCode: z.string().optional(),
});

const materiSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  htmlDescription: z.string().min(1),
  jsonDescription: z.any().optional(),
  isDemo: z.boolean().default(false),
});

// Create draft kelas
export async function createDraftKelas(data: z.infer<typeof createKelasSchema>) {
  try {
    const session = await assertAuthenticated();
    const validData = createKelasSchema.parse(data);

    const kelas = await prisma.kelas.create({
      data: {
        ...validData,
        isDraft: true,
        authorId: session.user.id,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { materis: true, members: true } },
      },
    });

    return { success: true, data: kelas };
  } catch (error) {
    console.error("Create kelas error:", error);
    return { success: false, error: "Failed to create kelas" };
  }
}

// Update kelas
export async function updateKelas(id: number, data: z.infer<typeof updateKelasSchema>) {
  try {
    const session = await assertAuthenticated();
    const validData = updateKelasSchema.parse(data);

    // Check ownership
    const existing = await prisma.kelas.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!existing || existing.authorId !== session.user.id) {
      return { success: false, error: "Not authorized" };
    }

    const kelas = await prisma.kelas.update({
      where: { id },
      data: validData,
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { materis: true, members: true } },
      },
    });

    return { success: true, data: kelas };
  } catch (error) {
    console.error("Update kelas error:", error);
    return { success: false, error: "Failed to update kelas" };
  }
}

// Add materis to kelas
export async function addMateris(kelasId: number, materis: z.infer<typeof materiSchema>[]) {
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

    // Create materis
    const createdMateris = await Promise.all(
      materis.map(async (materi) => {
        const validMateri = materiSchema.parse(materi);
        order += 1;
        
        return prisma.materi.create({
          data: {
            ...validMateri,
            jsonDescription: validMateri.jsonDescription || {},
            kelasId,
            order,
            isDraft: true,
          },
        });
      })
    );

    return { success: true, data: createdMateris };
  } catch (error) {
    console.error("Add materis error:", error);
    return { success: false, error: "Failed to add materis" };
  }
}

// Publish kelas
export async function publishKelas(id: number) {
  try {
    const session = await assertAuthenticated();

    // Check ownership and requirements
    const kelas = await prisma.kelas.findUnique({
      where: { id },
      include: {
        _count: { select: { materis: true } },
      },
    });

    if (!kelas || kelas.authorId !== session.user.id) {
      return { success: false, error: "Not authorized" };
    }

    if (!kelas.isDraft) {
      return { success: false, error: "Already published" };
    }

    if (kelas._count.materis === 0) {
      return { success: false, error: "Need at least one materi" };
    }

    // Publish kelas and materis
    await prisma.$transaction([
      prisma.kelas.update({
        where: { id },
        data: { isDraft: false },
      }),
      prisma.materi.updateMany({
        where: { kelasId: id },
        data: { isDraft: false },
      }),
    ]);

    return { success: true, message: "Kelas published successfully" };
  } catch (error) {
    console.error("Publish kelas error:", error);
    return { success: false, error: "Failed to publish kelas" };
  }
}

// Unpublish kelas
export async function unpublishKelas(id: number) {
  try {
    const session = await assertAuthenticated();

    // Check ownership
    const kelas = await prisma.kelas.findUnique({
      where: { id },
      select: { authorId: true, isDraft: true },
    });

    if (!kelas || kelas.authorId !== session.user.id) {
      return { success: false, error: "Not authorized" };
    }

    if (kelas.isDraft) {
      return { success: false, error: "Already unpublished" };
    }

    // Unpublish kelas and materis
    await prisma.$transaction([
      prisma.kelas.update({
        where: { id },
        data: { isDraft: true },
      }),
      prisma.materi.updateMany({
        where: { kelasId: id },
        data: { isDraft: true },
      }),
    ]);

    return { success: true, message: "Kelas unpublished successfully" };
  } catch (error) {
    console.error("Unpublish kelas error:", error);
    return { success: false, error: "Failed to unpublish kelas" };
  }
}

// Delete draft kelas
export async function deleteDraftKelas(id: number) {
  try {
    const session = await assertAuthenticated();

    const kelas = await prisma.kelas.findUnique({
      where: { id },
      select: { authorId: true, isDraft: true },
    });

    if (!kelas || kelas.authorId !== session.user.id) {
      return { success: false, error: "Not authorized" };
    }

    if (!kelas.isDraft) {
      return { success: false, error: "Can only delete draft kelas" };
    }

    await prisma.kelas.delete({ where: { id } });

    return { success: true, message: "Kelas deleted successfully" };
  } catch (error) {
    console.error("Delete kelas error:", error);
    return { success: false, error: "Failed to delete kelas" };
  }
}

// Get kelas by ID
export async function getKelasById(id: number) {
  try {
    const session = await assertAuthenticated();

    const kelas = await prisma.kelas.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        materis: { orderBy: { order: "asc" } },
        _count: { select: { materis: true, members: true } },
      },
    });

    if (!kelas) {
      return { success: false, error: "Kelas not found" };
    }

    // Check access for draft kelas
    if (kelas.isDraft && kelas.authorId !== session.user.id) {
      return { success: false, error: "Not authorized" };
    }

    return { success: true, data: kelas };
  } catch (error) {
    console.error("Get kelas error:", error);
    return { success: false, error: "Failed to get kelas" };
  }
}

// Get user's kelas list
export async function getUserKelasList() {
  try {
    const session = await assertAuthenticated();

    const kelasList = await prisma.kelas.findMany({
      where: { authorId: session.user.id },
      include: {
        _count: { select: { materis: true, members: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: kelasList };
  } catch (error) {
    console.error("Get kelas list error:", error);
    return { success: false, error: "Failed to get kelas list" };
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
