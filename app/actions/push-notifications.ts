"use server";

import { prisma } from "@/lib/db";
import { assertAuthenticated, assertRole } from "@/lib/auth-actions";
import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { z } from "zod";

// Validation schemas
const registerPushTokenSchema = z.object({
  pushToken: z.string().min(1),
  deviceId: z.string().optional(),
  deviceType: z.enum(["ios", "android"]).optional(),
});

const sendPushNotificationSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1).max(255),
  body: z.string().min(1).max(1000),
  data: z.any().optional(),
});

/**
 * Register or update an Expo push token for the authenticated user
 */
export async function registerPushToken(
  pushToken: string,
  deviceId?: string,
  deviceType?: "ios" | "android"
) {
  try {
    console.log("[PUSH NOTIFICATION] Starting registerPushToken");
    console.log("[PUSH NOTIFICATION] Input data:", { pushToken, deviceId, deviceType });

    const session = await assertAuthenticated();
    console.log("[PUSH NOTIFICATION] Authenticated user:", session.user.id, session.user.email);

    const validData = registerPushTokenSchema.parse({ pushToken, deviceId, deviceType });
    console.log("[PUSH NOTIFICATION] Validated data:", validData);

    // Check if token already exists for this user
    const existingToken = await prisma.expoPushToken.findUnique({
      where: { pushToken: validData.pushToken },
    });

    let expoPushToken;

    if (existingToken) {
      console.log("[PUSH NOTIFICATION] Token already exists:", existingToken.id);
      // Update existing token if it belongs to same user
      if (existingToken.userId === session.user.id) {
        expoPushToken = await prisma.expoPushToken.update({
          where: { id: existingToken.id },
          data: {
            deviceId: validData.deviceId,
            deviceType: validData.deviceType,
            isActive: true,
            lastUsedAt: new Date(),
          },
        });
        console.log("[PUSH NOTIFICATION] Updated existing token");
      } else {
        // Token belongs to another user, create a new one
        console.log("[PUSH NOTIFICATION] Token belongs to another user, creating new token");
        expoPushToken = await prisma.expoPushToken.create({
          data: {
            pushToken: validData.pushToken,
            userId: session.user.id,
            deviceId: validData.deviceId,
            deviceType: validData.deviceType,
            isActive: true,
            lastUsedAt: new Date(),
          },
        });
      }
    } else {
      // Create new token
      console.log("[PUSH NOTIFICATION] Creating new token");
      expoPushToken = await prisma.expoPushToken.create({
        data: {
          pushToken: validData.pushToken,
          userId: session.user.id,
          deviceId: validData.deviceId,
          deviceType: validData.deviceType,
          isActive: true,
          lastUsedAt: new Date(),
        },
      });
    }

    console.log("[PUSH NOTIFICATION] Token registered successfully:", expoPushToken.id);
    return { success: true, data: expoPushToken };
  } catch (error) {
    console.error("[PUSH NOTIFICATION] Register push token error:", error);
    return { success: false, error: "Failed to register push token" };
  }
}

/**
 * Get all active push tokens for the authenticated user
 */
export async function getUserPushTokens() {
  try {
    const session = await assertAuthenticated();

    const pushTokens = await prisma.expoPushToken.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: {
        lastUsedAt: "desc",
      },
    });

    return { success: true, data: pushTokens };
  } catch (error) {
    console.error("[PUSH NOTIFICATION] Get user push tokens error:", error);
    return { success: false, error: "Failed to fetch push tokens" };
  }
}

/**
 * Delete a specific push token (user can only delete their own)
 */
export async function deletePushToken(tokenId: string) {
  try {
    console.log("[PUSH NOTIFICATION] Starting deletePushToken:", tokenId);
    const session = await assertAuthenticated();

    // Check if token exists and belongs to user
    const token = await prisma.expoPushToken.findUnique({
      where: { id: tokenId },
    });

    if (!token) {
      console.log("[PUSH NOTIFICATION] Token not found:", tokenId);
      return { success: false, error: "Push token not found" };
    }

    // Only allow users to delete their own tokens
    if (token.userId !== session.user.id) {
      console.log("[PUSH NOTIFICATION] Forbidden: token belongs to another user");
      return { success: false, error: "Forbidden" };
    }

    // Delete token
    await prisma.expoPushToken.delete({
      where: { id: tokenId },
    });

    console.log("[PUSH NOTIFICATION] Token deleted successfully:", tokenId);
    return { success: true };
  } catch (error) {
    console.error("[PUSH NOTIFICATION] Delete push token error:", error);
    return { success: false, error: "Failed to delete push token" };
  }
}

/**
 * Send push notification to a user (GURU or ADMIN only)
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: any
) {
  try {
    console.log("[PUSH NOTIFICATION] Starting sendPushNotification");
    console.log("[PUSH NOTIFICATION] Input data:", { userId, title, body, data });

    // Check if user has GURU or ADMIN role
    const session = await assertRole("GURU");
    console.log("[PUSH NOTIFICATION] Authenticated sender:", session.user.id, session.user.email);

    const validData = sendPushNotificationSchema.parse({ userId, title, body, data });
    console.log("[PUSH NOTIFICATION] Validated data:", validData);

    // Get all active push tokens for target user
    const pushTokens = await prisma.expoPushToken.findMany({
      where: {
        userId: validData.userId,
        isActive: true,
      },
    });

    console.log("[PUSH NOTIFICATION] Found push tokens:", {
      userId: validData.userId,
      count: pushTokens.length,
      tokens: pushTokens.map(t => ({ id: t.id, pushToken: t.pushToken.substring(0, 20) + "...", deviceType: t.deviceType }))
    });

    if (pushTokens.length === 0) {
      console.log("[PUSH NOTIFICATION] No active push tokens found for user:", validData.userId);
      return {
        success: true,
        sentCount: 0,
        failedCount: 0,
        errors: ["No active push tokens found for user"],
      };
    }

    // Create a new Expo SDK client
    const expo = new Expo();
    console.log("[PUSH NOTIFICATION] Expo SDK client created");

    // Create push messages
    const messages: ExpoPushMessage[] = pushTokens.map((token) => ({
      to: token.pushToken,
      sound: "default",
      title: validData.title,
      body: validData.body,
      data: validData.data || {},
    }));

    console.log("[PUSH NOTIFICATION] Created messages:", {
      count: messages.length,
      messages: messages.map(m => ({
        to: typeof m.to === 'string' ? m.to.substring(0, 20) + "..." : Array.isArray(m.to) ? `[${m.to.length} tokens]` : 'unknown',
        title: m.title,
        body: m.body
      }))
    });

    // Send notifications in chunks
    const chunks = expo.chunkPushNotifications(messages);
    console.log("[PUSH NOTIFICATION] Chunks created:", chunks.length);

    const tickets: any[] = [];
    const errors: string[] = [];

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const chunk = chunks[chunkIndex];
      console.log(`[PUSH NOTIFICATION] Sending chunk ${chunkIndex + 1}/${chunks.length} with ${chunk.length} messages`);
      
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(`[PUSH NOTIFICATION] Chunk ${chunkIndex + 1} response:`, ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(`[PUSH NOTIFICATION] Error sending chunk ${chunkIndex + 1}:`, error);
        errors.push("Failed to send notification chunk");
      }
    }

    console.log("[PUSH NOTIFICATION] Total tickets received:", tickets.length);

    // Check for invalid tokens and mark them as inactive
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      const token = pushTokens[i];

      console.log(`[PUSH NOTIFICATION] Processing ticket ${i + 1}/${tickets.length}:`, {
        status: ticket.status,
        token: token.pushToken.substring(0, 20) + "...",
        message: ticket.message,
        details: ticket.details
      });

      if (ticket.status === "error") {
        failedCount++;
        const errorMsg = `Error for token ${token.pushToken.substring(0, 20)}...: ${ticket.message}`;
        errors.push(errorMsg);
        console.error("[PUSH NOTIFICATION]", errorMsg, ticket.details);

        // If token is invalid, mark it as inactive
        if (
          ticket.details?.error === "DeviceNotRegistered" ||
          ticket.details?.error === "InvalidCredentials" ||
          ticket.details?.error === "MessageTooBig" ||
          ticket.details?.error === "MessageRateExceeded"
        ) {
          console.log("[PUSH NOTIFICATION] Marking token as inactive:", token.id);
          await prisma.expoPushToken.update({
            where: { id: token.id },
            data: { isActive: false },
          });
        }
      } else {
        sentCount++;
        console.log(`[PUSH NOTIFICATION] Successfully sent to token ${i + 1}`);
      }
    }

    const result = {
      success: true,
      sentCount,
      failedCount,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log("[PUSH NOTIFICATION] Final result:", result);
    return result;
  } catch (error) {
    console.error("[PUSH NOTIFICATION] Send push notification error:", error);
    return { success: false, error: "Failed to send push notification" };
  }
}
