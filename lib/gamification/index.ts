/**
 * Gamification System
 * Complete gamification utilities for XP, levels, and streaks
 */

// Event Registry
export type { GameEvent, EventXPMapping } from './eventRegistry';
export {
  DEFAULT_EVENT_XP,
  getEventXP,
  isValidEvent,
  getAllEvents,
} from './eventRegistry';

// Streak Management
export type { StreakData, StreakBonus } from './streak';
export {
  DEFAULT_STREAK_BONUSES,
  isStreakActive,
  hasLostStreak,
  updateStreak,
  getStreakBonus,
  applyStreakBonus,
  hasReachedMilestone,
} from './streak';

// Level System
export type { LevelProgress } from './level';
export {
  calculateLevel,
  calculateXPForLevel,
  calculateXPToNextLevel,
  getLevelProgress,
  hasLeveledUp,
  getLevelsGained,
  calculateXPToReachLevel,
  getLevelMilestones,
  isMilestoneLevel,
  getNextMilestoneLevel,
  formatLevelProgress,
} from './level';

// Reward System
export type { RewardResult, UserGameData } from './reward';
export {
  processReward,
  processMultipleRewards,
  processDailyLoginReward,
  processStreakMilestoneReward,
  processPerfectScoreReward,
  formatRewardSummary,
  getEligibleSpecialRewards,
} from './reward';

// Utility Functions
export {
  formatNumber,
  formatXP,
  formatDateForStreak,
  getStartOfDay,
  getEndOfDay,
  isSameDay,
  isToday,
  isYesterday,
  getDaysBetween,
  getStreakDescription,
  getLevelDescription,
  getLevelBadgeColor,
  getStreakBadgeColor,
  getEventDisplayName,
  getEventIcon,
  getTimeUntilStreakReset,
  formatTimeUntilStreakReset,
  validateGameEvent,
  createDefaultStreakData,
  clamp,
  safePercentage,
} from './utils';