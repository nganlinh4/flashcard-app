import { Flashcard } from '@/types/flashcard';

interface KoreanAnalysis {
  word: string;
  pos: string; // part of speech
  pronunciation: string;
  hanja?: string;
  frequency: number;
  difficulty: number;
}

export const analyzeKoreanWord = async (word: string): Promise<KoreanAnalysis> => {
  // TODO: Connect to actual Korean NLP API
  // For now, return mock data
  return {
    word,
    pos: 'noun', // default
    pronunciation: word, // simple mock
    frequency: 1,
    difficulty: 1
  };
};

export const generateContextualSentence = async (word: string, level: number = 1): Promise<string> => {
  // TODO: Connect to GPT API for sentence generation
  // Mock implementation
  const sentences: Record<string, string[]> = {
    'noun': [
      `이 ${word} 매우 맛있어요.`,
      `${word} 어디에서 샀어요?`,
      `저 ${word} 좋아해요.`
    ],
    'verb': [
      `저는 매일 ${word}아요/어요.`,
      `내일 ${word}을/를 계획이에요.`,
      `어제 ${word}았어/었어요.`
    ],
    'adjective': [
      `이것은 정말 ${word}아요/어요.`,
      `저는 ${word}아/어 보여요.`,
      `그 ${word} 것 같아요.`
    ]
  };

  const pos = (await analyzeKoreanWord(word)).pos;
  const options = sentences[pos] || sentences['noun'];
  return options[Math.floor(Math.random() * options.length)];
};

export const enhanceFlashcardWithAI = async (flashcard: Flashcard): Promise<Flashcard> => {
  const analysis = await analyzeKoreanWord(flashcard.korean);
  const enhancedExample = await generateContextualSentence(flashcard.korean, flashcard.difficulty);
  
  return {
    ...flashcard,
    example: enhancedExample,
    difficulty: analysis.difficulty
  };
};