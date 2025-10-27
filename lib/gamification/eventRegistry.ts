/**
 * Event Registry for Gamification System
 * Maps different user actions to their corresponding XP values
 */

export type GameEvent = 
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

export interface EventXPMapping {
  [key: string]: number;
}

/**
 * Default XP values for different events
 * These values can be adjusted based on game balance requirements
 */
export const DEFAULT_EVENT_XP: EventXPMapping = {
  // Learning activities
  COMPLETE_MATERI: 10,
  COMPLETE_SOAL: 15,
  COMPLETE_VOCABULARY: 5,
  COMPLETE_ASSESSMENT: 25,
  
  // Daily engagement
  DAILY_LOGIN: 5,
  
  // Social activities
  CREATE_POST: 10,
  LIKE_POST: 2,
  COMMENT_POST: 5,
  
  // Class activities
  JOIN_KELAS: 20,
  
  // Achievement bonuses
  PERFECT_SCORE: 30,
  STREAK_MILESTONE: 50,
};

/**
 * Get the XP value for a specific event
 * @param event The game event
 * @param customMapping Optional custom XP mapping
 * @returns The XP value for the event
 */
export function getEventXP(event: GameEvent, customMapping?: EventXPMapping): number {
  const mapping = customMapping || DEFAULT_EVENT_XP;
  return mapping[event] || 0;
}

/**
 * Check if an event is valid
 * @param event The event to check
 * @returns True if the event is valid
 */
export function isValidEvent(event: string): event is GameEvent {
  return Object.keys(DEFAULT_EVENT_XP).includes(event);
}

/**
 * Get all available events
 * @returns Array of all valid game events
 */
export function getAllEvents(): GameEvent[] {
  return Object.keys(DEFAULT_EVENT_XP) as GameEvent[];
}