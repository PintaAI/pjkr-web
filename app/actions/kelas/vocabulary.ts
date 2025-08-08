"use server";

import { prisma } from "@/lib/db";
import { assertAuthenticated } from "@/lib/auth-actions";
import { VocabularyType, PartOfSpeech } from "@prisma/client";

// Helper function to sync vocabulary items
async function syncVocabularyItems(vocabSetId: number, newItems: any[], existingItems: any[]) {
  const session = await assertAuthenticated();
  
  // Update or create items
  for (const [index, newItem] of newItems.entries()) {
    const existingItem = existingItems.find(item => item.order === index);
    
    if (existingItem) {
      // Update existing item
      await prisma.vocabularyItem.update({
        where: { id: existingItem.id },
        data: {
          korean: newItem.korean,
          indonesian: newItem.indonesian,
          type: newItem.type,
          pos: newItem.pos,
          audioUrl: newItem.audioUrl,
          exampleSentences: newItem.exampleSentences,
          order: index,
        },
      });
    } else {
      // Create new item
      await prisma.vocabularyItem.create({
        data: {
          korean: newItem.korean,
          indonesian: newItem.indonesian,
          type: newItem.type,
          pos: newItem.pos,
          audioUrl: newItem.audioUrl,
          exampleSentences: newItem.exampleSentences,
          order: index,
          creatorId: session.user.id,
          collectionId: vocabSetId,
        },
      });
    }
  }
  
  // Remove items that are no longer in the input
  const existingOrders = existingItems.map(item => item.order);
  const inputOrders = newItems.map((_, index) => index);
  const ordersToRemove = existingOrders.filter(order => !inputOrders.includes(order));
  
  for (const order of ordersToRemove) {
    const itemToRemove = existingItems.find(item => item.order === order);
    if (itemToRemove) {
      await prisma.vocabularyItem.delete({
        where: { id: itemToRemove.id },
      });
    }
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
      // Update existing vocabulary set and sync items
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
      
      // Sync vocabulary items
      await syncVocabularyItems(vocabSetId, vocabSetData.items, vocabSet.items);
      
    } else {
      // Create new vocabulary set with items
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
    return { success: false, error: error instanceof Error ? error.message : "Failed to save vocabulary set" };
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