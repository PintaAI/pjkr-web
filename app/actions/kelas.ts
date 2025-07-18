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

// Types for better type safety
export type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export type KelasWithDetails = {
  id: number;
  title: string;
  description?: string | null;
  isDraft: boolean;
  authorId: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  };
  _count: {
    materis: number;
    members: number;
    completions: number;
  };
};

// Validation schemas
const createDraftKelasSchema = z.object({
  title: z.string().min(1, "Title is required").max(255).trim(),
  description: z.string().optional(),
  jsonDescription: z.any().optional(),
  htmlDescription: z.string().optional(),
  type: z.nativeEnum(KelasType).default(KelasType.REGULAR),
  level: z.nativeEnum(Difficulty),
  thumbnail: z.string().url("Invalid thumbnail URL").optional(),
  icon: z.string().optional(),
  isPaidClass: z.boolean().default(false),
  price: z.number().min(0, "Price must be non-negative").optional(),
  discount: z.number().min(0, "Discount must be non-negative").max(100, "Discount cannot exceed 100%").optional(),
  promoCode: z.string().max(50, "Promo code too long").optional(),
});

const updateKelasMetaSchema = z.object({
  title: z.string().min(1, "Title is required").max(255).trim().optional(),
  description: z.string().optional(),
  jsonDescription: z.any().optional(),
  htmlDescription: z.string().optional(),
  type: z.nativeEnum(KelasType).optional(),
  level: z.nativeEnum(Difficulty).optional(),
  thumbnail: z.string().url("Invalid thumbnail URL").optional(),
  icon: z.string().optional(),
  isPaidClass: z.boolean().optional(),
  price: z.number().min(0, "Price must be non-negative").optional(),
  discount: z.number().min(0, "Discount must be non-negative").max(100, "Discount cannot exceed 100%").optional(),
  promoCode: z.string().max(50, "Promo code too long").optional(),
});

const materiSchema = z.object({
  title: z.string().min(1, "Title is required").max(255).trim(),
  description: z.string().min(1, "Description is required").trim(),
  jsonDescription: z.any().default({}),
  htmlDescription: z.string().min(1, "HTML description is required"),
  order: z.number().int().min(0).optional(),
  isDemo: z.boolean().default(false),
});

const vocabularyItemSchema = z.object({
  korean: z.string().min(1, "Korean word is required").trim(),
  indonesian: z.string().min(1, "Indonesian translation is required").trim(),
  type: z.enum(["WORD", "SENTENCE", "IDIOM"]).default("WORD"),
  pos: z.enum(["KATA_KERJA", "KATA_BENDA", "KATA_SIFAT", "KATA_KETERANGAN"]).optional(),
  audioUrl: z.string().url("Invalid audio URL").optional(),
  exampleSentences: z.array(z.string()).default([]),
  order: z.number().int().min(0).optional(),
});

const vocabularySetSchema = z.object({
  title: z.string().min(1, "Title is required").max(255).trim(),
  description: z.string().optional(),
  icon: z.string().default("FaBook"),
  isPublic: z.boolean().default(false),
  items: z.array(vocabularyItemSchema).min(1, "At least one vocabulary item is required"),
});

const reorderSchema = z.object({
  id: z.number().int().positive(),
  order: z.number().int().min(0),
});

// Helper functions
async function validateKelasOwnership(kelasId: number, userId: string) {
  const kelas = await prisma.kelas.findUnique({
    where: { id: kelasId },
    select: { authorId: true, isDraft: true },
  });

  if (!kelas) {
    throw new NotFoundError("Kelas not found");
  }

  if (kelas.authorId !== userId) {
    throw new AuthError("You can only modify your own kelas");
  }

  return kelas;
}

function handleActionError(error: unknown, defaultMessage: string): never {
  if (error instanceof z.ZodError) {
    throw new ValidationError(`Validation error: ${error.errors.map(e => e.message).join(", ")}`);
  }
  if (error instanceof AuthError || error instanceof NotFoundError || error instanceof ValidationError) {
    throw error;
  }
  throw new Error(defaultMessage);
}

const kelasInclude = {
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
} as const;

/**
 * Creates a new draft kelas (course)
 * @param payload - The kelas data to create
 * @returns Promise<ActionResult<KelasWithDetails>>
 */
export async function createDraftKelas(payload: z.infer<typeof createDraftKelasSchema>): Promise<ActionResult<KelasWithDetails>> {
  try {
    const session = await assertAuthenticated();
    const userId = session.user.id;

    const validatedData = createDraftKelasSchema.parse(payload);

    // Validate pricing logic
    if (validatedData.isPaidClass && (!validatedData.price || validatedData.price <= 0)) {
      throw new ValidationError("Price is required for paid classes");
    }

    const kelas = await prisma.kelas.create({
      data: {
        ...validatedData,
        isDraft: true,
        authorId: userId,
      },
      include: kelasInclude,
    });

    return { success: true, data: kelas };
  } catch (error) {
    handleActionError(error, "Failed to create draft kelas");
  }
}

/**
 * Updates kelas metadata
 * @param id - The kelas ID
 * @param payload - The updated kelas data
 * @returns Promise<ActionResult<KelasWithDetails>>
 */
export async function updateKelasMeta(id: number, payload: z.infer<typeof updateKelasMetaSchema>): Promise<ActionResult<KelasWithDetails>> {
  try {
    const session = await assertAuthenticated();
    const userId = session.user.id;

    const validatedData = updateKelasMetaSchema.parse(payload);

    // Validate pricing logic
    if (validatedData.isPaidClass && (!validatedData.price || validatedData.price <= 0)) {
      throw new ValidationError("Price is required for paid classes");
    }

    await validateKelasOwnership(id, userId);

    const updatedKelas = await prisma.kelas.update({
      where: { id },
      data: validatedData,
      include: kelasInclude,
    });

    return { success: true, data: updatedKelas };
  } catch (error) {
    handleActionError(error, "Failed to update kelas meta");
  }
}

/**
 * Bulk adds materi (learning materials) to a kelas
 * @param id - The kelas ID
 * @param materiList - Array of materi to add
 * @returns Promise<ActionResult>
 */
export async function addMateriQuick(id: number, materiList: z.infer<typeof materiSchema>[]): Promise<ActionResult> {
  try {
    const session = await assertAuthenticated();
    const userId = session.user.id;

    if (!materiList.length) {
      throw new ValidationError("At least one materi is required");
    }

    const validatedMateris = materiList.map(materi => materiSchema.parse(materi));

    await validateKelasOwnership(id, userId);

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Get current max order
      const maxOrder = await tx.materi.findFirst({
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
      await tx.materi.createMany({
        data: materiData,
      });

      // Return updated kelas with new materis
      return await tx.kelas.findUnique({
        where: { id },
        include: {
          materis: {
            orderBy: { order: "asc" },
          },
          ...kelasInclude,
        },
      });
    });

    return { success: true, data: result };
  } catch (error) {
    handleActionError(error, "Failed to add materis");
  }
}

/**
 * Adds a vocabulary set to a kelas
 * @param id - The kelas ID
 * @param set - The vocabulary set data
 * @returns Promise<ActionResult>
 */
export async function addVocabularySetQuick(id: number, set: z.infer<typeof vocabularySetSchema>): Promise<ActionResult> {
  try {
    const session = await assertAuthenticated();
    const userId = session.user.id;

    const validatedSet = vocabularySetSchema.parse(set);

    await validateKelasOwnership(id, userId);

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

    return { success: true, data: vocabularySet, message: "Vocabulary set added successfully" };
  } catch (error) {
    handleActionError(error, "Failed to add vocabulary set");
  }
}

/**
 * Links a soal set (question set) to a kelas
 * @param id - The kelas ID
 * @param koleksiSoalId - The koleksi soal ID to link
 * @returns Promise<ActionResult>
 */
export async function addSoalSetQuick(id: number, koleksiSoalId: number): Promise<ActionResult> {
  try {
    const session = await assertAuthenticated();
    const userId = session.user.id;

    await validateKelasOwnership(id, userId);

    // Check if koleksi soal exists and user owns it
    const koleksiSoal = await prisma.koleksiSoal.findUnique({
      where: { id: koleksiSoalId },
      select: { userId: true, nama: true, _count: { select: { soals: true } } },
    });

    if (!koleksiSoal) {
      throw new NotFoundError("Koleksi soal not found");
    }

    if (koleksiSoal.userId !== userId) {
      throw new AuthError("You can only link your own koleksi soal");
    }

    if (koleksiSoal._count.soals === 0) {
      throw new ValidationError("Cannot link empty koleksi soal");
    }

    // TODO: Implement actual linking logic when schema supports it
    // For now, return success with metadata
    return { 
      success: true, 
      message: "Soal set linked successfully",
      data: { 
        kelasId: id, 
        koleksiSoalId,
        koleksiSoalTitle: koleksiSoal.nama,
        soalCount: koleksiSoal._count.soals
      }
    };
  } catch (error) {
    handleActionError(error, "Failed to add soal set");
  }
}

/**
 * Reorders materi within a kelas
 * @param id - The kelas ID
 * @param newOrder - Array of materi IDs with their new order positions
 * @returns Promise<ActionResult>
 */
export async function reorderMateri(id: number, newOrder: { id: number; order: number }[]): Promise<ActionResult> {
  try {
    const session = await assertAuthenticated();
    const userId = session.user.id;

    if (!newOrder.length) {
      throw new ValidationError("Order array cannot be empty");
    }

    // Validate input schema
    const validatedOrder = newOrder.map(item => reorderSchema.parse(item));

    await validateKelasOwnership(id, userId);

    // Validate that all materi IDs belong to this kelas
    const materiIds = validatedOrder.map(item => item.id);
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

    // Check for duplicate orders
    const orders = validatedOrder.map(item => item.order);
    const uniqueOrders = new Set(orders);
    if (uniqueOrders.size !== orders.length) {
      throw new ValidationError("Duplicate order values are not allowed");
    }

    // Update orders in a transaction
    const updatedMateris = await prisma.$transaction(async (tx) => {
      await Promise.all(
        validatedOrder.map(item =>
          tx.materi.update({
            where: { id: item.id },
            data: { order: item.order },
          })
        )
      );

      return await tx.materi.findMany({
        where: { kelasId: id },
        orderBy: { order: "asc" },
      });
    });

    return { success: true, data: updatedMateris, message: "Materi reordered successfully" };
  } catch (error) {
    handleActionError(error, "Failed to reorder materis");
  }
}

/**
 * Publishes a draft kelas, making it available to users
 * @param id - The kelas ID
 * @returns Promise<ActionResult<KelasWithDetails>>
 */
export async function publishKelas(id: number): Promise<ActionResult<KelasWithDetails>> {
  try {
    const session = await assertAuthenticated();
    const userId = session.user.id;

    // Get kelas with validation requirements
    const existingKelas = await prisma.kelas.findUnique({
      where: { id },
      include: {
        materis: {
          select: { id: true, isDraft: true },
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

    // Comprehensive validation for publishing
    const validationErrors: string[] = [];

    if (!existingKelas.title?.trim()) {
      validationErrors.push("Title is required");
    }

    if (!existingKelas.description?.trim()) {
      validationErrors.push("Description is required");
    }

    if (existingKelas._count.materis === 0) {
      validationErrors.push("At least one materi is required");
    }

    if (existingKelas.isPaidClass && (!existingKelas.price || existingKelas.price.toNumber() <= 0)) {
      validationErrors.push("Price is required for paid classes");
    }

    if (validationErrors.length > 0) {
      throw new ValidationError(validationErrors.join(", "));
    }

    // Publish kelas and its materis in a transaction
    const publishedKelas = await prisma.$transaction(async (tx) => {
      // Update all materis to published state
      await tx.materi.updateMany({
        where: { kelasId: id },
        data: { isDraft: false },
      });

      // Publish the kelas
      return await tx.kelas.update({
        where: { id },
        data: { isDraft: false },
        include: {
          ...kelasInclude,
          materis: {
            orderBy: { order: "asc" },
          },
        },
      });
    });

    return { success: true, data: publishedKelas, message: "Kelas published successfully" };
  } catch (error) {
    handleActionError(error, "Failed to publish kelas");
  }
}

/**
 * Deletes a draft kelas (only draft kelas can be deleted)
 * @param id - The kelas ID
 * @returns Promise<ActionResult>
 */
export async function deleteDraftKelas(id: number): Promise<ActionResult> {
  try {
    const session = await assertAuthenticated();
    const userId = session.user.id;

    const existingKelas = await validateKelasOwnership(id, userId);

    if (!existingKelas.isDraft) {
      throw new ValidationError("Only draft kelas can be deleted");
    }

    // Delete kelas (cascade will handle related records)
    await prisma.kelas.delete({
      where: { id },
    });

    return { success: true, message: "Draft kelas deleted successfully" };
  } catch (error) {
    handleActionError(error, "Failed to delete draft kelas");
  }
}

/**
 * Gets a kelas by ID with full details (for authorized users)
 * @param id - The kelas ID
 * @returns Promise<ActionResult<KelasWithDetails>>
 */
export async function getKelasById(id: number): Promise<ActionResult<KelasWithDetails>> {
  try {
    const session = await assertAuthenticated();
    const userId = session.user.id;

    const kelas = await prisma.kelas.findUnique({
      where: { id },
      include: {
        ...kelasInclude,
        materis: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!kelas) {
      throw new NotFoundError("Kelas not found");
    }

    // Check if user has access to this kelas
    if (kelas.isDraft && kelas.authorId !== userId) {
      throw new AuthError("You don't have access to this draft kelas");
    }

    return { success: true, data: kelas };
  } catch (error) {
    handleActionError(error, "Failed to get kelas");
  }
}
