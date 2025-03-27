import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

// Interface for TTS response
interface TTSResponse {
  audioUrl?: string;
  duration: number;
  error?: string;
}

/**
 * Speaks a Korean phrase with appropriate voice settings
 * @param text The Korean text to be spoken
 */
export const speakKorean = async (text: string): Promise<void> => {
  try {
    // Stop any currently playing speech
    Speech.stop();
    
    // Use Korean voice if available, otherwise fall back to default
    await Speech.speak(text, {
      language: 'ko-KR',
      rate: 0.9, // Slightly slower for language learning
      pitch: 1.0,
      volume: 1.0,
    });
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error speaking Korean:', error);
    return Promise.reject(error);
  }
};

/**
 * Speaks an English phrase
 * @param text The English text to be spoken
 */
export const speakEnglish = async (text: string): Promise<void> => {
  try {
    // Stop any currently playing speech
    Speech.stop();
    
    await Speech.speak(text, {
      language: 'en-US',
      rate: 0.9,
      pitch: 1.0,
      volume: 1.0,
    });
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error speaking English:', error);
    return Promise.reject(error);
  }
};

/**
 * Checks if TTS is available on the device
 * @returns A promise that resolves to true if TTS is available
 */
export const isTTSAvailable = async (): Promise<boolean> => {
  return await Speech.isSpeakingAvailableAsync();
};

export const analyzePronunciation = async (audioBlob: Blob, targetText: string): Promise<{
  score: number;
  accuracy: number;
  fluency: number;
  feedback: string;
}> => {
  // TODO: Implement actual pronunciation analysis
  // Mock implementation
  return {
    score: Math.floor(Math.random() * 5) + 1,
    accuracy: Math.random() * 100,
    fluency: Math.random() * 100,
    feedback: 'Your pronunciation was decent. Try to emphasize the final consonants more.'
  };
};