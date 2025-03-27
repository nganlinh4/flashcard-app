import { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Flashcard } from '@/types/flashcard';
import { generateFlashcards } from '@/services/aiService';
import { generateMnemonicImage } from '@/services/imageGenerationService';
import { speakKorean } from '@/services/ttsService';
import { updateProgress, getProgress, UserProgress } from '@/services/progressService';
import ProgressDisplay from '@/components/ProgressDisplay';
import { FlashCard } from '@/components/FlashCard';
import { CardControls } from '@/components/CardControls';
import { SwipeIndicators } from '@/components/SwipeIndicators';

export default function FlashcardsScreen() {
  const { category } = useLocalSearchParams();
  
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mnemonicImage, setMnemonicImage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Handle card loading based on category
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const categoryId = category as string | undefined;
        
        const [cards, progress] = await Promise.all([
          generateFlashcards(10, categoryId ? parseInt(categoryId.charAt(0)) : 1),
          getProgress()
        ]);
        
        setCards(cards);
        setUserProgress(progress);
        
        if (cards.length > 0) {
          const image = await generateMnemonicImage(
            cards[0].korean, 
            cards[0].english
          );
          setMnemonicImage(image.url);
        }
      } catch (err) {
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [category]);

  // Handle card flip
  const handleFlip = useCallback(() => {
    setIsFlipped(!isFlipped);
    setShowAnswer(!showAnswer);
  }, [isFlipped, showAnswer]);

  // Handle pronunciation
  const handleSpeak = async () => {
    if (cards.length === 0 || currentIndex >= cards.length) return;
    
    try {
      setIsSpeaking(true);
      await speakKorean(cards[currentIndex].korean);
    } catch (err) {
      console.error('TTS Error:', err);
    } finally {
      setIsSpeaking(false);
    }
  };

  // Handle user rating and progress tracking
  const handleRating = async (rating: number) => {
    const updatedCards = [...cards];
    const currentCard = updatedCards[currentIndex];
    
    // Update card difficulty
    currentCard.difficulty = Math.max(1, Math.min(5, 
      currentCard.difficulty + (rating < 3 ? 1 : -0.5)));
    
    currentCard.lastReviewed = new Date();
    const daysToAdd = Math.pow(2, currentCard.difficulty - 1);
    currentCard.nextReview = new Date();
    currentCard.nextReview.setDate(currentCard.nextReview.getDate() + daysToAdd);
    
    setCards(updatedCards);
    
    // Show confetti for good ratings
    if (rating >= 4) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
    
    // Update user progress
    if (userProgress) {
      const newProgress = await updateProgress(currentCard);
      setUserProgress(newProgress);
    }
    
    goToNextCard();
  };

  // Move to next card
  const goToNextCard = async () => {
    const nextIndex = (currentIndex + 1) % cards.length;
    setCurrentIndex(nextIndex);
    setShowAnswer(false);
    setIsFlipped(false);
    
    if (cards.length > 0) {
      const image = await generateMnemonicImage(
        cards[nextIndex].korean, 
        cards[nextIndex].english
      );
      setMnemonicImage(image.url);
    }
  };

  // Refresh deck
  const refreshDeck = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const newCards = await generateFlashcards(10);
      setCards(newCards);
      setCurrentIndex(0);
      setShowAnswer(false);
      
      if (newCards.length > 0) {
        const image = await generateMnemonicImage(
          newCards[0].korean, 
          newCards[0].english
        );
        setMnemonicImage(image.url);
      }
    } catch (err) {
      setError('Failed to refresh deck. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <ThemedText style={styles.loadingText}>Loading your Korean flashcards...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText type="title" style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={refreshDeck}>
          <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemedView style={styles.mainContainer}>
        {/* Progress display */}
        {userProgress && 
          <Animated.View entering={FadeInDown.springify()}>
            <ProgressDisplay progress={userProgress} />
          </Animated.View>
        }
        
        {/* Swipe indicators */}
        <SwipeIndicators />
        
        {cards.length > 0 && (
          <View style={styles.contentContainer}>
            {/* Card */}
            {cards[currentIndex] && (
              <FlashCard
                card={cards[currentIndex]}
                mnemonicImage={mnemonicImage}
                onFlip={handleFlip}
                onSwipe={handleRating}
              />
            )}
            {/* Controls */}
            <CardControls
              currentIndex={currentIndex}
              totalCards={cards.length}
              showAnswer={showAnswer}
              isSpeaking={isSpeaking}
              onSpeak={handleSpeak}
              onRating={handleRating}
              onRefresh={refreshDeck}
            />
          </View>
        )}
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  mainContainer: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    padding: 15,
    backgroundColor: Colors.light.buttonPrimary,
    borderRadius: 10,
  },
  retryButtonText: {
    color: 'white',
  },
});