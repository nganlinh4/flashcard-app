import { Flashcard } from '@/types/flashcard';

export interface UserProgress {
  totalCardsReviewed: number;
  cardsByLevel: Record<number, number>;
  streakDays: number;
  lastReviewDate: Date | null;
  achievements: string[];
}

const PROGRESS_KEY = '@korean-flashcards-progress';

// Default progress state
const defaultProgress: UserProgress = {
  totalCardsReviewed: 0,
  cardsByLevel: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
  streakDays: 0,
  lastReviewDate: null,
  achievements: []
};

// Achievement definitions
const ACHIEVEMENTS = {
  FIRST_CARD: 'First Card Reviewed',
  STREAK_3: '3 Day Streak',
  STREAK_7: '7 Day Streak',
  LEVEL_UP: 'Reached Level 5',
  MASTER: 'Mastered 100 Cards'
};

export const getProgress = async (): Promise<UserProgress> => {
  // TODO: Implement actual storage
  return defaultProgress;
};

export const updateProgress = async (card: Flashcard): Promise<UserProgress> => {
  const progress = await getProgress();
  
  // Update basic stats
  progress.totalCardsReviewed += 1;
  progress.cardsByLevel[card.difficulty] = (progress.cardsByLevel[card.difficulty] || 0) + 1;
  
  // Update streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (progress.lastReviewDate) {
    const lastDate = new Date(progress.lastReviewDate);
    lastDate.setHours(0, 0, 0, 0);
    
    const dayDiff = (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (dayDiff === 1) {
      progress.streakDays += 1;
    } else if (dayDiff > 1) {
      progress.streakDays = 1; // Reset streak
    }
  } else {
    progress.streakDays = 1;
  }
  
  progress.lastReviewDate = new Date();
  
  // Check achievements
  if (progress.totalCardsReviewed === 1 && !progress.achievements.includes(ACHIEVEMENTS.FIRST_CARD)) {
    progress.achievements.push(ACHIEVEMENTS.FIRST_CARD);
  }
  
  if (progress.streakDays >= 3 && !progress.achievements.includes(ACHIEVEMENTS.STREAK_3)) {
    progress.achievements.push(ACHIEVEMENTS.STREAK_3);
  }
  
  if (progress.streakDays >= 7 && !progress.achievements.includes(ACHIEVEMENTS.STREAK_7)) {
    progress.achievements.push(ACHIEVEMENTS.STREAK_7);
  }
  
  if (card.difficulty >= 5 && !progress.achievements.includes(ACHIEVEMENTS.LEVEL_UP)) {
    progress.achievements.push(ACHIEVEMENTS.LEVEL_UP);
  }
  
  if (progress.totalCardsReviewed >= 100 && !progress.achievements.includes(ACHIEVEMENTS.MASTER)) {
    progress.achievements.push(ACHIEVEMENTS.MASTER);
  }
  
  return progress;
};

export const resetProgress = async (): Promise<UserProgress> => {
  return defaultProgress;
};