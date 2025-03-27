import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Flashcard } from '@/types/flashcard';
import { generateFlashcards } from '@/services/aiService';
import { generateMnemonicImage } from '@/services/imageGenerationService';
import { speakKorean } from '@/services/ttsService';
import { updateProgress, getProgress, UserProgress } from '@/services/progressService';
import ProgressDisplay from '@/components/ProgressDisplay';

export default function FlashcardsScreen() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mnemonicImage, setMnemonicImage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [cards, progress] = await Promise.all([
          generateFlashcards(10),
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
  }, []);

  // Handle card flip
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowAnswer(!showAnswer);
  };

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
        <ActivityIndicator size="large" />
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
    <ThemedView style={styles.mainContainer}>
      {userProgress && <ProgressDisplay progress={userProgress} />}

      {cards.length > 0 && (
        <>
          <TouchableOpacity 
            style={[styles.card, isFlipped && styles.cardFlipped]}
            onPress={handleFlip}
            activeOpacity={0.7}
          >
            <ThemedText type="title" style={styles.cardText}>
              {showAnswer ? cards[currentIndex].english : cards[currentIndex].korean}
            </ThemedText>
            
            {showAnswer && (
              <>
                <ThemedText type="default" style={styles.exampleText}>
                  {cards[currentIndex].example}
                </ThemedText>
                
                {mnemonicImage && (
                  <Image 
                    source={{ uri: mnemonicImage }} 
                    style={styles.mnemonicImage}
                    resizeMode="contain"
                  />
                )}
              </>
            )}
          </TouchableOpacity>

          <View style={styles.pronunciationContainer}>
            <TouchableOpacity 
              style={styles.speakButton}
              onPress={handleSpeak}
              disabled={isSpeaking}
            >
              <ThemedText style={styles.speakButtonText}>
                {isSpeaking ? 'Speaking...' : 'Hear Pronunciation'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer}>
            <ThemedText type="default">
              Card {currentIndex + 1} of {cards.length}
            </ThemedText>
          </View>
        </>
      )}

      {showAnswer && (
        <View style={styles.ratingContainer}>
          <ThemedText type="subtitle" style={styles.ratingText}>
            How well did you know this?
          </ThemedText>
          <View style={styles.ratingButtons}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <TouchableOpacity
                key={rating}
                style={styles.ratingButton}
                onPress={() => handleRating(rating)}
              >
                <ThemedText>{rating}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.refreshButton} onPress={refreshDeck}>
        <ThemedText style={styles.refreshButtonText}>New Deck</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#007AFF',
    borderRadius: 10,
  },
  retryButtonText: {
    color: 'white',
  },
  card: {
    width: '100%',
    minHeight: 300,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  cardFlipped: {
    backgroundColor: '#f0f0f0',
  },
  cardText: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  exampleText: {
    marginTop: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  mnemonicImage: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 10,
  },
  pronunciationContainer: {
    marginBottom: 20,
  },
  speakButton: {
    padding: 10,
    backgroundColor: '#34C759',
    borderRadius: 5,
    alignItems: 'center',
  },
  speakButtonText: {
    color: 'white',
  },
  progressContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  ratingContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  ratingText: {
    marginBottom: 10,
  },
  ratingButtons: {
    flexDirection: 'row',
  },
  ratingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  refreshButton: {
    padding: 10,
    backgroundColor: '#FF9500',
    borderRadius: 5,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
  },
});