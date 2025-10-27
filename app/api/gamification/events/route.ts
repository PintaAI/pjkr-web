import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { ActivityType } from '@prisma/client'
import {
  GameEvent,
  isValidEvent,
  getEventXP
} from '@/lib/gamification/eventRegistry'
import {
  processReward,
  UserGameData
} from '@/lib/gamification/reward'
import {
  StreakData
} from '@/lib/gamification/streak'

// POST /api/gamification/events - Process gamified user actions
export async function POST(request: NextRequest) {
  try {
    // Get authenticated session
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { event, metadata } = body

    // Validate event type
    if (!event || !isValidEvent(event)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing event type' },
        { status: 400 }
      )
    }

    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        xp: true,
        level: true,
        currentStreak: true,
        lastActive: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Prepare user game data for reward processing
    const streakData: StreakData = {
      currentStreak: user.currentStreak,
      lastActiveDate: user.lastActive,
      longestStreak: user.currentStreak, // We'll need to track this separately in a real implementation
      streakHistory: [] // This would need to be tracked separately
    }

    const userData: UserGameData = {
      totalXP: user.xp,
      streakData
    }

    // Process the reward
    const rewardResult = processReward(event, userData)

    // Get the base XP for the event
    const baseXP = getEventXP(event)

    // Start a transaction for data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update user's XP, level, and streak
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: {
          xp: rewardResult.levelProgress.totalXP,
          level: rewardResult.levelProgress.currentLevel,
          currentStreak: rewardResult.streakData.currentStreak,
          lastActive: new Date()
        }
      })

      // Map GameEvent to ActivityType
      const mapGameEventToActivityType = (gameEvent: GameEvent): ActivityType => {
        const eventMap: Record<GameEvent, ActivityType> = {
          COMPLETE_MATERI: ActivityType.COMPLETE_MATERI,
          COMPLETE_SOAL: ActivityType.COMPLETE_QUIZ,
          COMPLETE_VOCABULARY: ActivityType.VOCABULARY_PRACTICE,
          DAILY_LOGIN: ActivityType.LOGIN,
          CREATE_POST: ActivityType.CREATE_POST,
          LIKE_POST: ActivityType.LIKE_POST,
          COMMENT_POST: ActivityType.COMMENT_POST,
          JOIN_KELAS: ActivityType.OTHER, // No direct equivalent in ActivityType
          COMPLETE_ASSESSMENT: ActivityType.COMPLETE_QUIZ, // Using COMPLETE_QUIZ as closest equivalent
          PERFECT_SCORE: ActivityType.OTHER, // No direct equivalent in ActivityType
          STREAK_MILESTONE: ActivityType.OTHER, // No direct equivalent in ActivityType
        };
        
        return eventMap[gameEvent] || ActivityType.OTHER;
      };

      // Create activity log entry
      const activityLog = await tx.activityLog.create({
        data: {
          userId: session.user.id,
          type: mapGameEventToActivityType(event),
          description: `Completed ${event.replace(/_/g, ' ').toLowerCase()}`,
          xpEarned: rewardResult.totalXP,
          streakUpdated: rewardResult.streakData.currentStreak !== user.currentStreak,
          previousStreak: user.currentStreak,
          newStreak: rewardResult.streakData.currentStreak,
          previousLevel: user.level,
          newLevel: rewardResult.levelProgress.currentLevel,
          metadata: metadata || {}
        }
      })

      // Check for streak milestone and award bonus if reached
      if (rewardResult.streakMilestoneReached) {
        const milestoneXP = rewardResult.streakData.currentStreak * 10 // 10 XP per streak day
        
        await tx.user.update({
          where: { id: session.user.id },
          data: {
            xp: updatedUser.xp + milestoneXP
          }
        })

        await tx.activityLog.create({
          data: {
            userId: session.user.id,
            type: ActivityType.OTHER,
            description: `Streak milestone: ${rewardResult.streakData.currentStreak} days`,
            xpEarned: milestoneXP,
            metadata: {
              type: 'STREAK_MILESTONE',
              streak: rewardResult.streakData.currentStreak
            }
          }
        })
      }

      return {
        user: updatedUser,
        activityLog
      }
    })

    // Format response
    const response = {
      success: true,
      data: {
        event,
        baseXP,
        streakBonus: rewardResult.streakBonus,
        totalXP: rewardResult.totalXP,
        previousLevel: rewardResult.previousLevel,
        newLevel: rewardResult.newLevel,
        levelsGained: rewardResult.levelsGained,
        currentStreak: rewardResult.streakData.currentStreak,
        streakMilestoneReached: rewardResult.streakMilestoneReached,
        levelProgress: {
          currentLevel: rewardResult.levelProgress.currentLevel,
          currentXP: rewardResult.levelProgress.currentXP,
          xpForCurrentLevel: rewardResult.levelProgress.xpForCurrentLevel,
          xpForNextLevel: rewardResult.levelProgress.xpForNextLevel,
          xpProgress: rewardResult.levelProgress.xpProgress,
          xpRemaining: rewardResult.levelProgress.xpRemaining
        },
        activityId: result.activityLog.id
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error processing gamification event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process gamification event' },
      { status: 500 }
    )
  }
}