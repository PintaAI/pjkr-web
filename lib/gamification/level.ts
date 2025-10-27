/**
 * Level System for Gamification
 * Handles level calculations, XP requirements, and progress tracking
 */

export interface LevelProgress {
  currentLevel: number;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpProgress: number; // Percentage progress to next level (0-100)
  xpRemaining: number; // XP needed to reach next level
  totalXP: number; // Total XP accumulated
}

/**
 * Calculate level based on XP using the formula: level = Math.floor(Math.sqrt(xp / 100)) + 1
 * @param totalXP The total XP accumulated
 * @returns The calculated level
 */
export function calculateLevel(totalXP: number): number {
  if (totalXP < 0) return 1;
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
}

/**
 * Calculate the total XP required to reach a specific level
 * @param level The target level
 * @returns The total XP needed to reach the level
 */
export function calculateXPForLevel(level: number): number {
  if (level <= 1) return 0;
  // Reverse the level formula: xp = (level - 1)² * 100
  return Math.pow(level - 1, 2) * 100;
}

/**
 * Calculate the XP required to go from current level to the next level
 * @param level The current level
 * @returns The XP needed to reach the next level
 */
export function calculateXPToNextLevel(level: number): number {
  const currentLevelXP = calculateXPForLevel(level);
  const nextLevelXP = calculateXPForLevel(level + 1);
  return nextLevelXP - currentLevelXP;
}

/**
 * Get detailed level progress information
 * @param totalXP The total XP accumulated
 * @returns Complete level progress information
 */
export function getLevelProgress(totalXP: number): LevelProgress {
  const currentLevel = calculateLevel(totalXP);
  const xpForCurrentLevel = calculateXPForLevel(currentLevel);
  const xpForNextLevel = calculateXPForLevel(currentLevel + 1);
  
  const xpProgress = totalXP >= xpForNextLevel 
    ? 100 
    : ((totalXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
  
  const xpRemaining = xpForNextLevel - totalXP;
  
  return {
    currentLevel,
    currentXP: totalXP,
    xpForCurrentLevel,
    xpForNextLevel,
    xpProgress: Math.min(100, Math.max(0, xpProgress)),
    xpRemaining: Math.max(0, xpRemaining),
    totalXP,
  };
}

/**
 * Check if a user has leveled up
 * @param previousXP The previous total XP
 * @param newXP The new total XP
 * @returns True if the user leveled up
 */
export function hasLeveledUp(previousXP: number, newXP: number): boolean {
  const previousLevel = calculateLevel(previousXP);
  const newLevel = calculateLevel(newXP);
  return newLevel > previousLevel;
}

/**
 * Get the number of levels gained
 * @param previousXP The previous total XP
 * @param newXP The new total XP
 * @returns The number of levels gained
 */
export function getLevelsGained(previousXP: number, newXP: number): number {
  const previousLevel = calculateLevel(previousXP);
  const newLevel = calculateLevel(newXP);
  return newLevel - previousLevel;
}

/**
 * Calculate how much XP is needed to reach a specific level from current XP
 * @param currentXP The current total XP
 * @param targetLevel The target level to reach
 * @returns The XP needed to reach the target level
 */
export function calculateXPToReachLevel(currentXP: number, targetLevel: number): number {
  const targetXP = calculateXPForLevel(targetLevel);
  return Math.max(0, targetXP - currentXP);
}

/**
 * Get level milestones (levels at specific XP thresholds)
 * @returns Array of level milestones
 */
export function getLevelMilestones(): Array<{ level: number; xpRequired: number }> {
  const milestones = [];
  for (let level = 1; level <= 100; level++) {
    milestones.push({
      level,
      xpRequired: calculateXPForLevel(level),
    });
  }
  return milestones;
}

/**
 * Check if a level is a milestone level (every 5 levels)
 * @param level The level to check
 * @returns True if the level is a milestone
 */
export function isMilestoneLevel(level: number): boolean {
  return level > 0 && level % 5 === 0;
}

/**
 * Get the next milestone level
 * @param currentLevel The current level
 * @returns The next milestone level
 */
export function getNextMilestoneLevel(currentLevel: number): number {
  return Math.ceil((currentLevel + 1) / 5) * 5;
}

/**
 * Format level progress for display
 * @param progress The level progress object
 * @returns Formatted string representation
 */
export function formatLevelProgress(progress: LevelProgress): string {
  return `Level ${progress.currentLevel} (${Math.floor(progress.xpProgress)}%) - ${progress.xpRemaining} XP to next level`;
}