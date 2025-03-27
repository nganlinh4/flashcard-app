export type Flashcard = {
  id: string;
  korean: string;
  english: string;
  example: string;
  difficulty: number;
  lastReviewed: Date | null;
  nextReview: Date | null;
};