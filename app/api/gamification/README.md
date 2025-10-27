# Gamification API Documentation

## Table of Contents

- [Overview](#overview)
- [Core Mechanics](#core-mechanics)
  - [Experience Points (XP)](#experience-points-xp)
  - [Levels](#levels)
  - [Streaks](#streaks)
  - [Rewards](#rewards)
- [API Endpoints](#api-endpoints)
  - [Process Gamification Events](#process-gamification-events)
  - [Get Activity History](#get-activity-history)
  - [Get Leaderboard](#get-leaderboard)
- [Event Types & XP Values](#event-types--xp-values)
- [Database Schema](#database-schema)
- [Integration Guide](#integration-guide)
- [Testing Recommendations](#testing-recommendations)

---

## Overview

The gamification system provides a comprehensive engagement layer for the learning platform, rewarding users for educational activities, social interactions, and consistent daily engagement. The system tracks user progress through XP (Experience Points), levels, daily streaks, and provides leaderboards for competitive motivation.

### Purpose

- **Increase engagement**: Motivate users to return daily and complete learning activities
- **Track progress**: Provide clear metrics for learning achievements
- **Foster competition**: Enable healthy competition through leaderboards
- **Reward consistency**: Bonus rewards for maintaining daily streaks

### Key Features

- Real-time XP and level progression
- Daily streak tracking with bonus multipliers
- Activity history logging
- Global and filtered leaderboards (weekly, monthly, all-time)
- Milestone rewards for achievements
- Perfect score bonuses

---

## Core Mechanics

### Experience Points (XP)

XP is the primary currency of the gamification system. Users earn XP by completing various activities across the platform.

**XP Calculation Formula:**
```typescript
totalXP = baseXP * streakMultiplier
```

Where:
- `baseXP`: Base XP value for the event (see [Event Types](#event-types--xp-values))
- `streakMultiplier`: Bonus multiplier based on current streak (1.0x to 1.5x)

### Levels

Levels represent a user's overall progress and experience on the platform.

**Level Calculation Formula:**
```typescript
level = Math.floor(Math.sqrt(totalXP / 100)) + 1
```

**XP Required for Level:**
```typescript
xpRequired = (level - 1)² * 100
```

**Examples:**
| Level | Total XP Required | XP to Next Level |
|-------|-------------------|------------------|
| 1     | 0                 | 100              |
| 2     | 100               | 300              |
| 3     | 400               | 500              |
| 5     | 1,600             | 900              |
| 10    | 8,100             | 1,900            |

### Streaks

Daily streaks track consecutive days of user activity. Maintaining a streak provides XP multiplier bonuses.

**Streak Bonus Tiers:**
| Streak Days | Multiplier | Bonus   |
|-------------|------------|---------|
| 0-2         | 1.0x       | No bonus |
| 3-6         | 1.25x      | +25% XP |
| 7+          | 1.5x       | +50% XP |

**Streak Milestones:**
- 3 days: First milestone
- 7 days: Week streak
- 14 days: Two-week streak
- 30 days: Month streak
- 60 days: Two-month streak
- 100 days: Century streak

**Streak Rules:**
- Streak increments on first activity each day
- Streak resets if user is inactive for 24+ hours
- Streak is maintained within 24-hour window from last activity

### Rewards

The reward system combines base XP, streak bonuses, and milestone bonuses.

**Reward Components:**
1. **Base XP**: Event-specific XP value
2. **Streak Bonus**: Applied based on current streak
3. **Milestone Bonus**: Extra XP for reaching streak milestones (10 XP per streak day)
4. **Perfect Score Bonus**: 30 XP for achieving 100% on assessments

---

## API Endpoints

All endpoints require authentication via session token.

### Process Gamification Events

Track user activities and award XP.

**Endpoint:** `POST /api/gamification/events`

**Authentication:** Required

**Request Body:**
```typescript
{
  event: GameEvent;      // Event type (see Event Types section)
  metadata?: object;     // Optional event-specific metadata
}
```

**Request Example:**
```json
{
  "event": "COMPLETE_MATERI",
  "metadata": {
    "materiId": 123,
    "kelasId": 45
  }
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "event": "COMPLETE_MATERI",
    "baseXP": 10,
    "streakBonus": 2,
    "totalXP": 12,
    "previousLevel": 3,
    "newLevel": 3,
    "levelsGained": 0,
    "currentStreak": 5,
    "streakMilestoneReached": false,
    "levelProgress": {
      "currentLevel": 3,
      "currentXP": 412,
      "xpForCurrentLevel": 400,
      "xpForNextLevel": 900,
      "xpProgress": 2.4,
      "xpRemaining": 488
    },
    "activityId": "clxxx..."
  }
}
```

**Response Fields:**
- `event`: The game event that was processed
- `baseXP`: Base XP value for the event
- `streakBonus`: Additional XP from streak multiplier
- `totalXP`: Total XP awarded (baseXP + streakBonus)
- `previousLevel`: User's level before this event
- `newLevel`: User's level after this event
- `levelsGained`: Number of levels gained (0 if no level up)
- `currentStreak`: Current daily streak count
- `streakMilestoneReached`: Whether a streak milestone was reached
- `levelProgress`: Detailed progress information
- `activityId`: ID of the created activity log entry

**Error Responses:**

*401 Unauthorized:*
```json
{
  "success": false,
  "error": "Authentication required"
}
```

*400 Bad Request:*
```json
{
  "success": false,
  "error": "Invalid or missing event type"
}
```

*404 Not Found:*
```json
{
  "success": false,
  "error": "User not found"
}
```

*500 Internal Server Error:*
```json
{
  "success": false,
  "error": "Failed to process gamification event"
}
```

---

### Get Activity History

Retrieve user's activity history with filtering and pagination.

**Endpoint:** `GET /api/gamification/activity`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type   | Required | Default | Description                    |
|-----------|--------|----------|---------|--------------------------------|
| page      | number | No       | 1       | Page number (min: 1)           |
| limit     | number | No       | 20      | Items per page (1-100)         |
| type      | string | No       | -       | Filter by ActivityType         |
| from      | string | No       | -       | Start date (ISO 8601)          |
| to        | string | No       | -       | End date (ISO 8601)            |

**Request Example:**
```http
GET /api/gamification/activity?page=1&limit=10&type=COMPLETE_MATERI&from=2025-01-01T00:00:00Z
```

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx...",
      "type": "COMPLETE_MATERI",
      "xp": 12,
      "date": "2025-01-15T10:30:00Z",
      "description": "Completed complete materi",
      "streakUpdated": true,
      "previousStreak": 4,
      "newStreak": 5,
      "previousLevel": 3,
      "newLevel": 3,
      "metadata": {
        "materiId": 123,
        "kelasId": 45
      }
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

**Error Responses:**

*400 Bad Request (Invalid pagination):*
```json
{
  "success": false,
  "error": "Page must be greater than 0"
}
```

*400 Bad Request (Invalid limit):*
```json
{
  "success": false,
  "error": "Limit must be between 1 and 100"
}
```

*400 Bad Request (Invalid activity type):*
```json
{
  "success": false,
  "error": "Invalid activity type"
}
```

*400 Bad Request (Invalid date):*
```json
{
  "success": false,
  "error": "Invalid from date format"
}
```

---

### Get Leaderboard

Retrieve leaderboard rankings with filtering options.

**Endpoint:** `GET /api/gamification/leaderboard`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type   | Required | Default  | Description                           |
|-----------|--------|----------|----------|---------------------------------------|
| scope     | string | No       | alltime  | Time scope: weekly, monthly, alltime  |
| role      | string | No       | -        | Filter by role: MURID, GURU           |
| limit     | number | No       | 50       | Number of top users to return         |

**Request Example:**
```http
GET /api/gamification/leaderboard?scope=weekly&role=MURID&limit=10
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "user": {
          "id": "user123",
          "name": "John Doe",
          "email": "john@example.com",
          "image": "https://example.com/avatar.jpg",
          "role": "MURID"
        },
        "stats": {
          "xp": 5000,
          "level": 8,
          "currentStreak": 15,
          "lastActive": "2025-01-15T10:00:00Z",
          "periodXP": 500
        }
      }
    ],
    "currentUser": {
      "rank": 25,
      "user": {
        "id": "currentUserId",
        "name": "Current User",
        "email": "user@example.com",
        "image": "https://example.com/user-avatar.jpg",
        "role": "MURID"
      },
      "stats": {
        "xp": 2000,
        "level": 5,
        "currentStreak": 7,
        "lastActive": "2025-01-15T12:00:00Z",
        "periodXP": 200
      }
    },
    "meta": {
      "scope": "weekly",
      "role": "MURID",
      "totalInTop": 10,
      "userPosition": 25,
      "isInTop": false
    }
  }
}
```

**Response Fields:**
- `leaderboard`: Array of top users with rankings
- `currentUser`: Current user's ranking and stats
- `meta`: Metadata about the leaderboard query
- `periodXP`: XP earned in the specified time period (only for weekly/monthly scopes)

**Error Responses:**

*400 Bad Request (Invalid scope):*
```json
{
  "success": false,
  "error": "Invalid scope parameter"
}
```

*400 Bad Request (Invalid role):*
```json
{
  "success": false,
  "error": "Invalid role parameter"
}
```

---

## Event Types & XP Values

All available game events and their XP rewards:

### Learning Activities
| Event Type           | XP Value | Description                          |
|----------------------|----------|--------------------------------------|
| COMPLETE_MATERI      | 10       | Complete a materi/lesson             |
| COMPLETE_SOAL        | 15       | Complete a quiz/question set         |
| COMPLETE_VOCABULARY  | 5        | Complete vocabulary practice         |
| COMPLETE_ASSESSMENT  | 25       | Complete a formal assessment         |

### Daily Engagement
| Event Type      | XP Value | Description                 |
|-----------------|----------|-----------------------------|
| DAILY_LOGIN     | 5        | First login of the day      |

### Social Activities
| Event Type      | XP Value | Description                 |
|-----------------|----------|-----------------------------|
| CREATE_POST     | 10       | Create a discussion post    |
| LIKE_POST       | 2        | Like a post                 |
| COMMENT_POST    | 5        | Comment on a post           |

### Class Activities
| Event Type   | XP Value | Description              |
|--------------|----------|--------------------------|
| JOIN_KELAS   | 20       | Join a new class         |

### Achievement Bonuses
| Event Type        | XP Value | Description                      |
|-------------------|----------|----------------------------------|
| PERFECT_SCORE     | 30       | Achieve 100% on assessment       |
| STREAK_MILESTONE  | 50       | Reach a streak milestone         |

**TypeScript Type:**
```typescript
type GameEvent = 
  | 'COMPLETE_MATERI'
  | 'COMPLETE_SOAL'
  | 'COMPLETE_VOCABULARY'
  | 'DAILY_LOGIN'
  | 'CREATE_POST'
  | 'LIKE_POST'
  | 'COMMENT_POST'
  | 'JOIN_KELAS'
  | 'COMPLETE_ASSESSMENT'
  | 'PERFECT_SCORE'
  | 'STREAK_MILESTONE';
```

---

## Database Schema

### User Model Updates

The following fields were added to the [`User`](../../../prisma/schema.prisma:102) model:

```prisma
model User {
  // ... existing fields
  
  // Gamification fields
  lastActive    DateTime? @default(now())
  currentStreak Int       @default(0)
  xp            Int       @default(0)
  level         Int       @default(1)
  
  // Relations
  activityLogs  ActivityLog[]
}
```

### ActivityLog Model

New model for tracking all user activities and gamification events:

```prisma
model ActivityLog {
  id             String       @id @default(cuid())
  userId         String
  type           ActivityType
  description    String?
  xpEarned       Int?
  streakUpdated  Boolean      @default(false)
  previousStreak Int?
  newStreak      Int?
  previousLevel  Int?
  newLevel       Int?
  metadata       Json?        @db.JsonB
  createdAt      DateTime     @default(now())
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([type])
  @@index([createdAt])
  @@index([userId, type])
  @@index([userId, createdAt])
  @@index([type, createdAt])
  @@index([xpEarned])
}
```

### ActivityType Enum

```prisma
enum ActivityType {
  LOGIN
  COMPLETE_MATERI
  COMPLETE_KELAS
  COMPLETE_QUIZ
  VOCABULARY_PRACTICE
  DAILY_CHALLENGE
  PARTICIPATE_LIVE_SESSION
  PLAY_GAME
  CREATE_POST
  COMMENT_POST
  LIKE_POST
  LIKE_COMMENT
  SHARE_POST
  OTHER
}
```

---

## Integration Guide

### For Mobile Apps (React Native / Expo)

#### 1. Setup API Service

Create a gamification service:

```typescript
// lib/api/gamification-service.ts
import { authFetch } from './auth-fetch';

export interface ProcessEventRequest {
  event: string;
  metadata?: Record<string, any>;
}

export interface ActivityHistoryParams {
  page?: number;
  limit?: number;
  type?: string;
  from?: string;
  to?: string;
}

export interface LeaderboardParams {
  scope?: 'weekly' | 'monthly' | 'alltime';
  role?: 'MURID' | 'GURU';
  limit?: number;
}

export const gamificationService = {
  // Process a gamification event
  async processEvent(data: ProcessEventRequest) {
    return authFetch('/api/gamification/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get activity history
  async getActivityHistory(params?: ActivityHistoryParams) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.from) queryParams.append('from', params.from);
    if (params?.to) queryParams.append('to', params.to);

    return authFetch(`/api/gamification/activity?${queryParams.toString()}`);
  },

  // Get leaderboard
  async getLeaderboard(params?: LeaderboardParams) {
    const queryParams = new URLSearchParams();
    if (params?.scope) queryParams.append('scope', params.scope);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return authFetch(`/api/gamification/leaderboard?${queryParams.toString()}`);
  },
};
```

#### 2. Track Events

Track events when users complete activities:

```typescript
// Example: Track materi completion
import { gamificationService } from '@/lib/api/gamification-service';

async function handleMateriCompletion(materiId: number, kelasId: number) {
  try {
    const response = await gamificationService.processEvent({
      event: 'COMPLETE_MATERI',
      metadata: { materiId, kelasId }
    });

    if (response.success) {
      const { data } = response;
      
      // Show XP notification
      showNotification(`+${data.totalXP} XP earned!`);
      
      // Check for level up
      if (data.levelsGained > 0) {
        showLevelUpModal(data.newLevel);
      }
      
      // Check for streak milestone
      if (data.streakMilestoneReached) {
        showStreakMilestoneModal(data.currentStreak);
      }
    }
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}
```

#### 3. Display User Progress

Create a progress component:

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { gamificationService } from '@/lib/api/gamification-service';

export function UserProgress() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserProgress();
  }, []);

  async function loadUserProgress() {
    // Get user data from your auth context or API
    const userData = await getUserData();
    setUser(userData);
  }

  if (!user) return null;

  const progressPercent = (user.levelProgress.xpProgress || 0);

  return (
    <View>
      <Text>Level {user.level}</Text>
      <ProgressBar progress={progressPercent} />
      <Text>{user.xp} XP</Text>
      <Text>🔥 {user.currentStreak} day streak</Text>
    </View>
  );
}
```

### For Web Apps (Next.js)

#### 1. Create React Hook

```typescript
// hooks/use-gamification.ts
import useSWR from 'swr';

export function useActivityHistory(params?: ActivityHistoryParams) {
  const queryString = new URLSearchParams(params as any).toString();
  const { data, error, mutate } = useSWR(
    `/api/gamification/activity?${queryString}`
  );

  return {
    activities: data?.data,
    meta: data?.meta,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useLeaderboard(params?: LeaderboardParams) {
  const queryString = new URLSearchParams(params as any).toString();
  const { data, error, mutate } = useSWR(
    `/api/gamification/leaderboard?${queryString}`
  );

  return {
    leaderboard: data?.data?.leaderboard,
    currentUser: data?.data?.currentUser,
    meta: data?.data?.meta,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
```

#### 2. Track Events in Server Actions

```typescript
// app/actions/gamification.ts
'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function trackEvent(event: string, metadata?: any) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return { success: false, error: 'Not authenticated' };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/gamification/events`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': await headers().then(h => h.get('cookie') || '')
      },
      body: JSON.stringify({ event, metadata })
    }
  );

  return response.json();
}
```

---

## Testing Recommendations

### Unit Tests

Test core gamification logic:

```typescript
// __tests__/lib/gamification/reward.test.ts
import { processReward, UserGameData } from '@/lib/gamification/reward';

describe('Reward System', () => {
  it('should calculate base XP correctly', () => {
    const userData: UserGameData = {
      totalXP: 100,
      streakData: {
        currentStreak: 0,
        lastActiveDate: null,
        longestStreak: 0,
        streakHistory: []
      }
    };

    const result = processReward('COMPLETE_MATERI', userData);
    
    expect(result.baseXP).toBe(10);
    expect(result.totalXP).toBe(10);
  });

  it('should apply streak bonus correctly', () => {
    const userData: UserGameData = {
      totalXP: 100,
      streakData: {
        currentStreak: 7,
        lastActiveDate: new Date(),
        longestStreak: 7,
        streakHistory: []
      }
    };

    const result = processReward('COMPLETE_MATERI', userData);
    
    expect(result.baseXP).toBe(10);
    expect(result.totalXP).toBe(15); // 10 * 1.5 = 15
    expect(result.streakBonus).toBe(5);
  });
});
```

### Integration Tests

Test API endpoints:

```typescript
// __tests__/api/gamification/events.test.ts
import { POST } from '@/app/api/gamification/events/route';

describe('POST /api/gamification/events', () => {
  it('should process valid event', async () => {
    const request = new Request('http://localhost:3000/api/gamification/events', {
      method: 'POST',
      body: JSON.stringify({
        event: 'COMPLETE_MATERI',
        metadata: { materiId: 1 }
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.event).toBe('COMPLETE_MATERI');
    expect(data.data.totalXP).toBeGreaterThan(0);
  });

  it('should reject invalid event type', async () => {
    const request = new Request('http://localhost:3000/api/gamification/events', {
      method: 'POST',
      body: JSON.stringify({
        event: 'INVALID_EVENT'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});
```

### Manual Testing Checklist

- [ ] Create a test user account
- [ ] Track various events and verify XP is awarded correctly
- [ ] Verify level progression calculations
- [ ] Test daily streak incrementation
- [ ] Test streak reset after 24+ hours of inactivity
- [ ] Verify streak bonus multipliers (1.25x at 3 days, 1.5x at 7 days)
- [ ] Test milestone rewards at 3, 7, 14, 30, 60, 100 day streaks
- [ ] Verify activity history pagination
- [ ] Test leaderboard with different scopes (weekly, monthly, all-time)
- [ ] Test leaderboard role filtering
- [ ] Verify error handling for unauthenticated requests
- [ ] Test concurrent event processing

### Performance Testing

- [ ] Test leaderboard query performance with large datasets (10k+ users)
- [ ] Verify activity log query performance with filters
- [ ] Test transaction handling for concurrent event processing
- [ ] Monitor database index usage on ActivityLog table
- [ ] Profile API response times under load

---

## Additional Resources

- **Event Registry**: [`lib/gamification/eventRegistry.ts`](../../../lib/gamification/eventRegistry.ts:1)
- **Reward Logic**: [`lib/gamification/reward.ts`](../../../lib/gamification/reward.ts:1)
- **Level System**: [`lib/gamification/level.ts`](../../../lib/gamification/level.ts:1)
- **Streak Logic**: [`lib/gamification/streak.ts`](../../../lib/gamification/streak.ts:1)
- **Database Schema**: [`prisma/schema.prisma`](../../../prisma/schema.prisma:102)

---

**Last Updated**: January 27, 2025  
**API Version**: 1.0  
**Maintainer**: Development Team