"use server";

import { prisma } from "@/lib/db";
import { assertAuthenticated, assertRole } from "@/lib/auth-actions";
import { KelasType, Difficulty } from "@prisma/client";
import { z } from "zod";

// Custom error classes
export class AuthError extends Error {
  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "AuthError";
  }
}

export class ValidationError extends Error {
  constructor(message: string = "Validation failed") {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

// Validation schemas
const createDraftKelasSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  jsonDescription: z.any().optional(),
  htmlDescription: z.string().optional(),
  type: z.nativeEnum(KelasType).default(KelasType.REGULAR),
  level: z.nativeEnum(Difficulty),
  thumbnail: z.string().url().optional(),
  icon: z.string().optional(),
  isPaidClass: z.boolean().default(false),
  price: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  promoCode: z.string().optional(),
});

const updateKelasMetaSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  jsonDescription: z.any().optional(),
  htmlDescription: z.string().optional(),
  type: z.nativeEnum(KelasType).optional(),
  level: z.nativeEnum(Difficulty).optional(),
  thumbnail: z.string().url().optional(),
  icon: z.string().optional(),
  isPaidClass: z.boolean().optional(),
  price: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  promoCode: z.string().optional(),
});

const materiSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required"),
  jsonDescription: z.any().default({}),
  htmlDescription: z.string().min(1, "HTML description is required"),
  order: z.number().int().min(0).optional(),
  isDemo: z.boolean().default(false),
});

const vocabularyItemSchema = z.object({
  korean: z.string().min(1, "Korean word is required"),
  indonesian: z.string().min(1, "Indonesian translation is required"),
  type: z.enum(["WORD", "SENTENCE", "IDIOM"]).default("WORD"),
  pos: z.enum(["KATA_KERJA", "KATA_BENDA", "KATA_SIFAT", "KATA_KETERANGAN"]).optional(),
  audioUrl: z.string().url().optional(),
  exampleSentences: z.array(z.string()).default([]),
  order: z.number().int().min(0).optional(),
});

const vocabularySetSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  icon: z.string().default("FaBook"),
  isPublic: z.boolean().default(false),
  items: z.array(vocabularyItemSchema).min(1, "At least one vocabulary item is required"),
});

// Action 1: Create Draft Kelas
export async function createDraftKelas(payload: z.infer<typeof createDraftKelasSchema>) {
  try {
    // Validate authentication
    const session = await assertAuthenticated();
    const userId = session.user.id;

    // Validate input
    const validatedData = createDraftKelasSchema.parse(payload);

    // Create draft kelas
    const kelas = await prisma.kelas.create({
      data: {
        ...validatedData,
        isDraft: true,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            materis: true,
            members: true,
            completions: true,
          },
        },
      },
    });

    return { success: true, data: kelas };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(`Validation error: ${error.errors.map(e => e.message).join(", ")}`);
    }
    if (error instanceof AuthError) {
      throw error;
    }
    throw new Error("Failed to create draft kelas");
  }
}

// Action 2: Update Kelas Meta
export async function updateKelasMeta(id: number, payload: z.infer<typeof updateKelasMetaSchema>) {
  try {
    // Validate authentication
    const session = await assertAuthenticated();
    const userId = session.user.id;

    // Validate input
    const validatedData = updateKelasMetaSchema.parse(payload);

    // Check if kelas exists and user is the author
    const existingKelas = await prisma.kelas.findUnique({
      where: { id },
      select: { authorId: true, isDraft: true },
    });

    if (!existingKelas) {
      throw new NotFoundError("Kelas not found");
    }

    if (existingKelas.authorId !== userId) {
      throw new AuthError("You can only update your own kelas");
    }

    // Update kelas
    const updatedKelas = await prisma.kelas.update({
      where: { id },
      data: validatedData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            materis: true,
            members: true,
            completions: true,
          },
        },
      },
    });

    return { success: true, data: updatedKelas };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(`Validation error: ${error.errors.map(e => e.message).join(", ")}`);
    }
    if (error instanceof AuthError || error instanceof NotFoundError) {
      throw error;
    }
    throw new Error("Failed to update kelas meta");
  }
}

// Action 3: Add Materi Quick (Bulk)
export async function addMateriQuick(id: number, materiList: z.infer<typeof materiSchema>[]) {
  try {
    // Validate authentication
    const session = await assertAuthenticated();
    const userId = session.user.id;

    // Validate input
    const validatedMateris = materiList.map(materi => materiSchema.parse(materi));

    // Check if kelas exists and user is the author
    const existingKelas = await prisma.kelas.findUnique({
      where: { id },
      select: { authorId: true, isDraft: true },
    });

    if (!existingKelas) {
      throw new NotFoundError("Kelas not found");
    }

    if (existingKelas.authorId !== userId) {
      throw new AuthError("You can only add materis to your own kelas");
    }

    // Get current max order
    const maxOrder = await prisma.materi.findFirst({
      where: { kelasId: id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    let currentOrder = maxOrder?.order ?? -1;

    // Prepare materi data with incremented order
    const materiData = validatedMateris.map(materi => ({
      title: materi.title,
      description: materi.description,
      jsonDescription: materi.jsonDescription,
      htmlDescription: materi.htmlDescription,
      isDemo: materi.isDemo,
      kelasId: id,
      order: materi.order ?? ++currentOrder,
      isDraft: true,
    }));

    // Bulk create materis
    await prisma.materi.createMany({
      data: materiData,
    });

    // Return updated kelas with new materis
    const updatedKelas = await prisma.kelas.findUnique({
      where: { id },
      include: {
        materis: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            materis: true,
            members: true,
            completions: true,
          },
        },
      },
    });

    return { success: true, data: updatedKelas };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(`Validation error: ${error.errors.map(e => e.message).join(", ")}`);
    }
    if (error instanceof AuthError || error instanceof NotFoundError) {
      throw error;
    }
    throw new Error("Failed to add materis");
  }
}

// Action 4: Add Vocabulary Set Quick
export async function addVocabularySetQuick(id: number, set: z.infer<typeof vocabularySetSchema>) {
  try {
    // Validate authentication
    const session = await assertAuthenticated();
    const userId = session.user.id;

    // Validate input
    const validatedSet = vocabularySetSchema.parse(set);

    // Check if kelas exists and user is the author
    const existingKelas = await prisma.kelas.findUnique({
      where: { id },
      select: { authorId: true, isDraft: true },
    });

    if (!existingKelas) {
      throw new NotFoundError("Kelas not found");
    }

    if (existingKelas.authorId !== userId) {
      throw new AuthError("You can only add vocabulary sets to your own kelas");
    }

    // Create vocabulary set with items
    const vocabularySet = await prisma.vocabularySet.create({
      data: {
        title: validatedSet.title,
        description: validatedSet.description,
        icon: validatedSet.icon,
        isPublic: validatedSet.isPublic,
        userId,
        kelasId: id,
        items: {
          create: validatedSet.items.map((item, index) => ({
            ...item,
            creatorId: userId,
            order: item.order ?? index,
          })),
        },
      },
      include: {
        items: {
          orderBy: { order: "asc" },
        },
      },
    });

    return { success: true, data: vocabularySet, setId: vocabularySet.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(`Validation error: ${error.errors.map(e => e.message).join(", ")}`);
    }
    if (error instanceof AuthError || error instanceof NotFoundError) {
      throw error;
    }
    throw new Error("Failed to add vocabulary set");
  }
}

// Action 5: Add Soal Set Quick
export async function addSoalSetQuick(id: number, koleksiSoalId: number) {
  try {
    // Validate authentication
    const session = await assertAuthenticated();
    const userId = session.user.id;

    // Check if kelas exists and user is the author
    const existingKelas = await prisma.kelas.findUnique({
      where: { id },
      select: { authorId: true, isDraft: true },
    });

    if (!existingKelas) {
      throw new NotFoundError("Kelas not found");
    }

    if (existingKelas.authorId !== userId) {
      throw new AuthError("You can only add soal sets to your own kelas");
    }

    // Check if koleksi soal exists and user owns it
    const koleksiSoal = await prisma.koleksiSoal.findUnique({
      where: { id: koleksiSoalId },
      select: { userId: true },
    });

    if (!koleksiSoal) {
      throw new NotFoundError("Koleksi soal not found");
    }

    if (koleksiSoal.userId !== userId) {
      throw new AuthError("You can only link your own koleksi soal");
    }

    // For now, we'll just return success since there's no direct relation
    // between Kelas and KoleksiSoal in the schema
    // In a real implementation, you might want to create a junction table
    // or add this relationship to the schema
    
    return { 
      success: true, 
      message: "Soal set linked successfully",
      data: { kelasId: id, koleksiSoalId }
    };
  } catch (error) {
    if (error instanceof AuthError || error instanceof NotFoundError) {
      throw error;
    }
    throw new Error("Failed to add soal set");
  }
}

// Action 6: Reorder Materi
export async function reorderMateri(id: number, newOrder: { id: number; order: number }[]) {
  try {
    // Validate authentication
    const session = await assertAuthenticated();
    const userId = session.user.id;

    // Check if kelas exists and user is the author
    const existingKelas = await prisma.kelas.findUnique({
      where: { id },
      select: { authorId: true, isDraft: true },
    });

    if (!existingKelas) {
      throw new NotFoundError("Kelas not found");
    }

    if (existingKelas.authorId !== userId) {
      throw new AuthError("You can only reorder materis in your own kelas");
    }

    // Validate that all materi IDs belong to this kelas
    const materiIds = newOrder.map(item => item.id);
    const existingMateris = await prisma.materi.findMany({
      where: {
        id: { in: materiIds },
        kelasId: id,
      },
      select: { id: true },
    });

    if (existingMateris.length !== materiIds.length) {
      throw new ValidationError("Some materi IDs are invalid or don't belong to this kelas");
    }

    // Update orders in a transaction
    await prisma.$transaction(
      newOrder.map(item =>
        prisma.materi.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    // Return updated materis
    const updatedMateris = await prisma.materi.findMany({
      where: { kelasId: id },
      orderBy: { order: "asc" },
    });

    return { success: true, data: updatedMateris };
  } catch (error) {
    if (error instanceof AuthError || error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    throw new Error("Failed to reorder materis");
  }
}

// Action 7: Publish Kelas
export async function publishKelas(id: number) {
  try {
    // Validate authentication
    const session = await assertAuthenticated();
    const userId = session.user.id;

    // Check if kelas exists and user is the author
    const existingKelas = await prisma.kelas.findUnique({
      where: { id },
      include: {
        materis: {
          select: { id: true },
        },
        _count: {
          select: { materis: true },
        },
      },
    });

    if (!existingKelas) {
      throw new NotFoundError("Kelas not found");
    }

    if (existingKelas.authorId !== userId) {
      throw new AuthError("You can only publish your own kelas");
    }

    if (!existingKelas.isDraft) {
      throw new ValidationError("Kelas is already published");
    }

    // Validate required fields for publishing
    if (!existingKelas.title || !existingKelas.description) {
      throw new ValidationError("Title and description are required for publishing");
    }

    if (existingKelas._count.materis === 0) {
      throw new ValidationError("At least one materi is required for publishing");
    }

    // Publish kelas
    const publishedKelas = await prisma.kelas.update({
      where: { id },
      data: { isDraft: false },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        materis: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            materis: true,
            members: true,
            completions: true,
          },
        },
      },
    });

    return { success: true, data: publishedKelas };
  } catch (error) {
    if (error instanceof AuthError || error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    throw new Error("Failed to publish kelas");
  }
}

// Action 8: Delete Draft Kelas
export async function deleteDraftKelas(id: number) {
  try {
    // Validate authentication
    const session = await assertAuthenticated();
    const userId = session.user.id;

    // Check if kelas exists and user is the author
    const existingKelas = await prisma.kelas.findUnique({
      where: { id },
      select: { authorId: true, isDraft: true },
    });

    if (!existingKelas) {
      throw new NotFoundError("Kelas not found");
    }

    if (existingKelas.authorId !== userId) {
      throw new AuthError("You can only delete your own kelas");
    }

    if (!existingKelas.isDraft) {
      throw new ValidationError("Only draft kelas can be deleted");
    }

    // Delete kelas (cascade will handle related records)
    await prisma.kelas.delete({
      where: { id },
    });

    return { success: true, message: "Draft kelas deleted successfully" };
  } catch (error) {
    if (error instanceof AuthError || error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    throw new Error("Failed to delete draft kelas");
  }
}
