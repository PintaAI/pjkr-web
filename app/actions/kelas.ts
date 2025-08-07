"use server";

import { prisma } from "@/lib/db";
import { assertAuthenticated } from "@/lib/auth-actions";
import { KelasType, Difficulty, VocabularyType, PartOfSpeech } from "@prisma/client";
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

// Assessment collection schemas
const koleksiSoalSchema = z.object({
  nama: z.string().min(1).max(255),
  deskripsi: z.string().optional(),
  isPrivate: z.boolean().default(false),
  isDraft: z.boolean().default(true),
});

const soalSchema = z.object({
  pertanyaan: z.string().min(1),
  difficulty: z.nativeEnum(Difficulty).optional(),
  explanation: z.string().optional(),
  isActive: z.boolean().default(true),
});

const opsiSchema = z.object({
  opsiText: z.string().min(1),
  isCorrect: z.boolean().default(false),
  order: z.number().min(0),
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

    // Convert Decimal fields to numbers for client components
    const serializedKelas = {
      ...kelas,
      price: kelas.price ? Number(kelas.price) : null,
      discount: kelas.discount ? Number(kelas.discount) : null,
    };

    return { success: true, data: serializedKelas };
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

    // Convert Decimal fields to numbers for client components
    const serializedKelas = {
      ...kelas,
      price: kelas.price ? Number(kelas.price) : null,
      discount: kelas.discount ? Number(kelas.discount) : null,
    };

    return { success: true, data: serializedKelas };
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
            isDraft: false,
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
        kelasKoleksiSoals: {
          include: {
            koleksiSoal: {
              include: {
                soals: {
                  include: {
                    opsis: { orderBy: { order: "asc" } }
                  }
                }
              }
            }
          }
        },
        vocabularySets: {
          include: {
            items: {
              orderBy: { order: "asc" }
            }
          }
        },
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

    // Convert Decimal fields to numbers for client components
    const serializedKelas = {
      ...kelas,
      price: kelas.price ? Number(kelas.price) : null,
      discount: kelas.discount ? Number(kelas.discount) : null,
      // Flatten the koleksiSoals from the junction table
      koleksiSoals: kelas.kelasKoleksiSoals.map(junction => junction.koleksiSoal),
      // Include vocabulary sets directly
      vocabularySets: kelas.vocabularySets,
    };

    return { success: true, data: serializedKelas };
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

    // Convert Decimal fields to numbers for client components
    const serializedKelasList = kelasList.map(kelas => ({
      ...kelas,
      price: kelas.price ? Number(kelas.price) : null,
      discount: kelas.discount ? Number(kelas.discount) : null,
    }));

    return { success: true, data: serializedKelasList };
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

// Assessment collection actions
export async function saveKoleksiSoal(kelasId: number | null, koleksiData: z.infer<typeof koleksiSoalSchema>, koleksiId?: number) {
  try {
    const session = await assertAuthenticated();

    const validData = koleksiSoalSchema.parse(koleksiData);

    let koleksiSoal;
    if (koleksiId) {
      // Update existing
      koleksiSoal = await prisma.koleksiSoal.update({
        where: { id: koleksiId },
        data: {
          nama: validData.nama,
          deskripsi: validData.deskripsi,
          isPrivate: validData.isPrivate,
          isDraft: validData.isDraft,
        },
        include: { soals: true },
      });
    } else {
      // Create new
      koleksiSoal = await prisma.koleksiSoal.create({
        data: {
          nama: validData.nama,
          deskripsi: validData.deskripsi,
          isPrivate: validData.isPrivate,
          isDraft: validData.isDraft,
          userId: session.user.id,
        },
        include: { soals: true },
      });
    }

    // If kelasId is provided, create the many-to-many relationship
    if (kelasId && !koleksiId) {
      await prisma.kelasKoleksiSoal.create({
        data: {
          kelasId: kelasId,
          koleksiSoalId: koleksiSoal.id,
        },
      });
    }

    return { success: true, data: koleksiSoal };
  } catch (error) {
    console.error("Save koleksi soal error:", error);
    return { success: false, error: "Failed to save question collection" };
  }
}

export async function saveSoal(koleksiSoalId: number, soalData: z.infer<typeof soalSchema>, soalId?: number) {
  try {
    const session = await assertAuthenticated();

    // Check ownership via koleksiSoal
    const koleksiSoal = await prisma.koleksiSoal.findUnique({
      where: { id: koleksiSoalId },
      include: { user: { select: { id: true } } },
    });

    if (!koleksiSoal || !koleksiSoal.user || koleksiSoal.user.id !== session.user.id) {
      return { success: false, error: "Not authorized" };
    }

    const validData = soalSchema.parse(soalData);

    let soal;
    if (soalId) {
      // Update existing
      soal = await prisma.soal.update({
        where: { id: soalId },
        data: validData,
        include: { opsis: true },
      });
    } else {
      // Create new
      soal = await prisma.soal.create({
        data: {
          ...validData,
          koleksiSoalId,
          authorId: session.user.id,
        },
        include: { opsis: true },
      });
    }

    return { success: true, data: soal };
  } catch (error) {
    console.error("Save soal error:", error);
    return { success: false, error: "Failed to save question" };
  }
}

export async function saveOpsi(soalId: number, opsiData: z.infer<typeof opsiSchema>, opsiId?: number) {
  try {
    const session = await assertAuthenticated();

    // Check ownership via soal -> koleksiSoal -> user
    const soal = await prisma.soal.findUnique({
      where: { id: soalId },
      include: {
        koleksiSoal: {
          include: { user: { select: { id: true } } },
        },
      },
    });

    if (!soal || !soal.koleksiSoal || !soal.koleksiSoal.user || soal.koleksiSoal.user.id !== session.user.id) {
      return { success: false, error: "Not authorized" };
    }

    const validData = opsiSchema.parse(opsiData);

    let opsi;
    if (opsiId) {
      // Update existing
      opsi = await prisma.opsi.update({
        where: { id: opsiId },
        data: validData,
      });
    } else {
      // Create new
      opsi = await prisma.opsi.create({
        data: {
          ...validData,
          soalId,
        },
      });
    }

    return { success: true, data: opsi };
  } catch (error) {
    console.error("Save opsi error:", error);
    return { success: false, error: "Failed to save option" };
  }
}

export async function deleteKoleksiSoal(koleksiSoalId: number) {
  try {
    const session = await assertAuthenticated();

    // Check ownership
    const koleksiSoal = await prisma.koleksiSoal.findUnique({
      where: { id: koleksiSoalId },
      include: { user: { select: { id: true } } },
    });

    if (!koleksiSoal || !koleksiSoal.user || koleksiSoal.user.id !== session.user.id) {
      return { success: false, error: "Not authorized" };
    }

    await prisma.koleksiSoal.delete({ where: { id: koleksiSoalId } });

    return { success: true, message: "Question collection deleted successfully" };
  } catch (error) {
    console.error("Delete koleksi soal error:", error);
    return { success: false, error: "Failed to delete question collection" };
  }
}

export async function deleteSoal(soalId: number) {
  try {
    const session = await assertAuthenticated();

    // Check ownership
    const soal = await prisma.soal.findUnique({
      where: { id: soalId },
      include: {
        koleksiSoal: {
          include: { user: { select: { id: true } } },
        },
      },
    });

    if (!soal || !soal.koleksiSoal || !soal.koleksiSoal.user || soal.koleksiSoal.user.id !== session.user.id) {
      return { success: false, error: "Not authorized" };
    }

    await prisma.soal.delete({ where: { id: soalId } });

    return { success: true, message: "Question deleted successfully" };
  } catch (error) {
    console.error("Delete soal error:", error);
    return { success: false, error: "Failed to delete question" };
  }
}

// Reorder soals within a koleksiSoal
export async function reorderSoals(koleksiSoalId: number, soalOrders: { id: number; order: number }[]) {
  try {
    const session = await assertAuthenticated();

    // Check ownership via koleksiSoal
    const koleksiSoal = await prisma.koleksiSoal.findUnique({
      where: { id: koleksiSoalId },
      include: { user: { select: { id: true } } },
    });

    if (!koleksiSoal || !koleksiSoal.user || koleksiSoal.user.id !== session.user.id) {
      return { success: false, error: "Not authorized" };
    }

    // Update orders
    await Promise.all(
      soalOrders.map(({ id, order }) =>
        prisma.soal.update({
          where: { id },
          data: { order },
        })
      )
    );

    return { success: true, message: "Questions reordered successfully" };
  } catch (error) {
    console.error("Reorder soals error:", error);
    return { success: false, error: "Failed to reorder questions" };
  }
}

export async function deleteOpsi(opsiId: number) {
  try {
    const session = await assertAuthenticated();

    // Check ownership
    const opsi = await prisma.opsi.findUnique({
      where: { id: opsiId },
      include: {
        soal: {
          include: {
            koleksiSoal: {
              include: { user: { select: { id: true } } },
            },
          },
        },
      },
    });

    if (!opsi || !opsi.soal || !opsi.soal.koleksiSoal || !opsi.soal.koleksiSoal.user || opsi.soal.koleksiSoal.user.id !== session.user.id) {
      return { success: false, error: "Not authorized" };
    }

    await prisma.opsi.delete({ where: { id: opsiId } });

    return { success: true, message: "Option deleted successfully" };
  } catch (error) {
    console.error("Delete opsi error:", error);
    return { success: false, error: "Failed to delete option" };
  }
}

// Vocabulary management actions
export async function saveVocabularySet(kelasId: number | null, vocabSetData: {
  title: string;
  description?: string;
  icon?: string;
  isPublic: boolean;
  items: Array<{
    korean: string;
    indonesian: string;
    type: VocabularyType;
    pos?: PartOfSpeech;
    audioUrl?: string;
    exampleSentences: string[];
  }>;
}, vocabSetId?: number) {
  try {
    const session = await assertAuthenticated();

    let vocabSet;
    if (vocabSetId) {
      // Update existing vocabulary set
      vocabSet = await prisma.vocabularySet.update({
        where: { id: vocabSetId },
        data: {
          title: vocabSetData.title,
          description: vocabSetData.description,
          icon: vocabSetData.icon,
          isPublic: vocabSetData.isPublic,
        },
        include: { items: true },
      });
    } else {
      // Create new vocabulary set
      vocabSet = await prisma.vocabularySet.create({
        data: {
          title: vocabSetData.title,
          description: vocabSetData.description,
          icon: vocabSetData.icon,
          isPublic: vocabSetData.isPublic,
          userId: session.user.id,
          kelasId: kelasId,
          items: {
            create: vocabSetData.items.map((item, index) => ({
              korean: item.korean,
              indonesian: item.indonesian,
              type: item.type,
              pos: item.pos,
              audioUrl: item.audioUrl,
              exampleSentences: item.exampleSentences,
              order: index,
              creatorId: session.user.id,
            })),
          },
        },
        include: { items: true },
      });
    }

    return { success: true, data: vocabSet };
  } catch (error) {
    console.error("Save vocabulary set error:", error);
    return { success: false, error: "Failed to save vocabulary set" };
  }
}

export async function updateVocabularyItem(vocabItemId: number, itemData: {
  korean?: string;
  indonesian?: string;
  type?: VocabularyType;
  pos?: PartOfSpeech;
  audioUrl?: string;
  exampleSentences?: string[];
}) {
  try {
    const session = await assertAuthenticated();

    // Check ownership via vocabulary item
    const vocabItem = await prisma.vocabularyItem.findUnique({
      where: { id: vocabItemId },
      include: {
        collection: {
          include: { user: { select: { id: true } } },
        },
      },
    });

    if (!vocabItem || !vocabItem.collection || !vocabItem.collection.user || vocabItem.collection.user.id !== session.user.id) {
      return { success: false, error: "Not authorized" };
    }

    const updatedItem = await prisma.vocabularyItem.update({
      where: { id: vocabItemId },
      data: {
        korean: itemData.korean,
        indonesian: itemData.indonesian,
        type: itemData.type,
        pos: itemData.pos,
        audioUrl: itemData.audioUrl,
        exampleSentences: itemData.exampleSentences,
      },
    });

    return { success: true, data: updatedItem };
  } catch (error) {
    console.error("Update vocabulary item error:", error);
    return { success: false, error: "Failed to update vocabulary item" };
  }
}

export async function deleteVocabularySet(vocabSetId: number) {
  try {
    const session = await assertAuthenticated();

    // Check ownership
    const vocabSet = await prisma.vocabularySet.findUnique({
      where: { id: vocabSetId },
      include: { user: { select: { id: true } } },
    });

    if (!vocabSet || !vocabSet.user || vocabSet.user.id !== session.user.id) {
      return { success: false, error: "Not authorized" };
    }

    await prisma.vocabularySet.delete({ where: { id: vocabSetId } });

    return { success: true, message: "Vocabulary set deleted successfully" };
  } catch (error) {
    console.error("Delete vocabulary set error:", error);
    return { success: false, error: "Failed to delete vocabulary set" };
  }
}

export async function deleteVocabularyItem(vocabItemId: number) {
  try {
    const session = await assertAuthenticated();

    // Check ownership
    const vocabItem = await prisma.vocabularyItem.findUnique({
      where: { id: vocabItemId },
      include: {
        collection: {
          include: { user: { select: { id: true } } },
        },
      },
    });

    if (!vocabItem || !vocabItem.collection || !vocabItem.collection.user || vocabItem.collection.user.id !== session.user.id) {
      return { success: false, error: "Not authorized" };
    }

    await prisma.vocabularyItem.delete({ where: { id: vocabItemId } });

    return { success: true, message: "Vocabulary item deleted successfully" };
  } catch (error) {
    console.error("Delete vocabulary item error:", error);
    return { success: false, error: "Failed to delete vocabulary item" };
  }
}

export async function reorderVocabularyItems(vocabSetId: number, itemOrders: { id: number; order: number }[]) {
  try {
    const session = await assertAuthenticated();

    // Check ownership via vocabulary set
    const vocabSet = await prisma.vocabularySet.findUnique({
      where: { id: vocabSetId },
      include: { user: { select: { id: true } } },
    });

    if (!vocabSet || !vocabSet.user || vocabSet.user.id !== session.user.id) {
      return { success: false, error: "Not authorized" };
    }

    // Update orders
    await Promise.all(
      itemOrders.map(({ id, order }) =>
        prisma.vocabularyItem.update({
          where: { id },
          data: { order },
        })
      )
    );

    return { success: true, message: "Vocabulary items reordered successfully" };
  } catch (error) {
    console.error("Reorder vocabulary items error:", error);
    return { success: false, error: "Failed to reorder vocabulary items" };
  }
}
