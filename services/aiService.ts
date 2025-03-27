import { Flashcard } from '../types/flashcard';

// Mock Korean vocabulary database
const koreanVocabulary = [
  { korean: '사과', english: 'apple', pos: 'noun', level: 1 },
  { korean: '학교', english: 'school', pos: 'noun', level: 1 },
  { korean: '가다', english: 'to go', pos: 'verb', level: 1 },
  { korean: '먹다', english: 'to eat', pos: 'verb', level: 1 },
  { korean: '크다', english: 'to be big', pos: 'adjective', level: 2 },
  { korean: '작다', english: 'to be small', pos: 'adjective', level: 2 },
  { korean: '비행기', english: 'airplane', pos: 'noun', level: 2 },
  { korean: '여행', english: 'travel', pos: 'noun', level: 3 },
  { korean: '경험', english: 'experience', pos: 'noun', level: 3 },
  { korean: '발전', english: 'development', pos: 'noun', level: 4 },
];

// Mock Korean sentence patterns
const sentencePatterns = [
  '{noun}을/를 {verb}',
  '{noun}이/가 {adjective}',
  '{noun}에서 {noun}을/를 {verb}',
  '{noun}과/와 {noun}을/를 {verb}',
];

export const generateFlashcards = async (count: number, level: number = 1): Promise<Flashcard[]> => {
  // Filter vocabulary by level
  const filteredVocab = koreanVocabulary.filter(word => word.level <= level);
  
  // Generate flashcards
  const flashcards: Flashcard[] = [];
  
  for (let i = 0; i < count; i++) {
    if (filteredVocab.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * filteredVocab.length);
    const word = filteredVocab[randomIndex];
    
    // Generate example sentence
    let example = '';
    if (word.pos === 'noun') {
      example = `${word.korean}이/가 있습니다.`;
    } else if (word.pos === 'verb') {
      example = `저는 ${word.korean}아요/어요.`;
    } else if (word.pos === 'adjective') {
      example = `이것은 ${word.korean}아요/어요.`;
    }
    
    flashcards.push({
      id: `ai-${Date.now()}-${i}`,
      korean: word.korean,
      english: word.english,
      example: example,
      difficulty: word.level,
      lastReviewed: null,
      nextReview: null,
    });
  }
  
  return flashcards;
};

export const analyzePronunciation = async (audioBlob: Blob): Promise<{ score: number, feedback: string }> => {
  // Mock pronunciation analysis
  return {
    score: Math.floor(Math.random() * 5) + 1,
    feedback: 'Your pronunciation was decent. Try to emphasize the final consonants more.'
  };
};

export const generateMnemonicImagePrompt = (word: string): string => {
  return `Create a visual mnemonic to help remember the Korean word "${word}". The image should be simple, colorful, and memorable.`;
};