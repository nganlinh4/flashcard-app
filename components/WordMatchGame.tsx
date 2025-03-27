import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withDelay,
  Easing,
  FadeInDown,
  FadeOut,
  FlipInYRight
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Flashcard } from '@/types/flashcard';
import { Colors } from '@/constants/Colors';

interface WordMatchGameProps {
  cards: Flashcard[];
  onComplete: (score: number) => void;
  onExit: () => void;
}

// Types for match cards
interface MatchCard {
  id: string;
  text: string;
  type: 'korean' | 'english';
  flipped: boolean;
  matched: boolean;
  originalIndex: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const FLIP_DURATION = 300;

export function WordMatchGame({ cards, onComplete, onExit }: WordMatchGameProps) {
  // Game state
  const [matchCards, setMatchCards] = useState<MatchCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<MatchCard[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds game
  
  // Animation values
  const shakeValue = useSharedValue(0);
  
  // Initialize game
  useEffect(() => {
    if (cards.length === 0) return;
    
    // Take up to 6 cards for a total of 12 match cards (6 pairs)
    const gameCards = cards.slice(0, 6);
    
    // Create match cards - Korean and English versions for each card
    const koreanCards: MatchCard[] = gameCards.map((card, index) => ({
      id: `k-${card.id}`,
      text: card.korean,
      type: 'korean',
      flipped: false,
      matched: false,
      originalIndex: index
    }));
    
    const englishCards: MatchCard[] = gameCards.map((card, index) => ({
      id: `e-${card.id}`,
      text: card.english,
      type: 'english',
      flipped: false,
      matched: false,
      originalIndex: index
    }));
    
    // Combine and shuffle
    const allCards = [...koreanCards, ...englishCards]
      .sort(() => Math.random() - 0.5);
    
    setMatchCards(allCards);
  }, [cards]);
  
  // Game timer
  useEffect(() => {
    if (timeLeft <= 0 || gameComplete) {
      onComplete(score);
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft, gameComplete, score]);
  
  // Check for game completion
  useEffect(() => {
    if (matchCards.length > 0 && matchCards.every(card => card.matched)) {
      setGameComplete(true);
      onComplete(score);
    }
  }, [matchCards, score]);
  
  // Check selected cards for matches
  useEffect(() => {
    if (selectedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [first, second] = selectedCards;
      
      if (first.originalIndex === second.originalIndex) {
        // Match found
        setTimeout(() => {
          setMatchCards(prevCards => 
            prevCards.map(card => 
              card.id === first.id || card.id === second.id
                ? { ...card, matched: true }
                : card
            )
          );
          
          setScore(prev => prev + 10);
          setSelectedCards([]);
        }, 500);
      } else {
        // No match
        shakeValue.value = withSequence(
          withTiming(10, { duration: 100, easing: Easing.linear }),
          withTiming(-10, { duration: 100, easing: Easing.linear }),
          withTiming(10, { duration: 100, easing: Easing.linear }),
          withTiming(0, { duration: 100, easing: Easing.linear })
        );
        
        // Flip back
        setTimeout(() => {
          setMatchCards(prevCards => 
            prevCards.map(card => 
              card.id === first.id || card.id === second.id
                ? { ...card, flipped: false }
                : card
            )
          );
          
          setSelectedCards([]);
        }, 1000);
      }
    }
  }, [selectedCards, shakeValue]);
  
  // Handle card flip
  const handleCardPress = (card: MatchCard) => {
    if (selectedCards.length >= 2 || card.flipped || card.matched) return;
    
    // Flip the card
    setMatchCards(prevCards => 
      prevCards.map(c => 
        c.id === card.id
          ? { ...c, flipped: true }
          : c
      )
    );
    
    // Add to selected cards
    setSelectedCards(prev => [...prev, card]);
  };
  
  const shakingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeValue.value }],
    };
  });
  
  // Get background color for card based on status
  const getCardBackgroundColor = (card: MatchCard) => {
    if (card.matched) {
      return card.type === 'korean' ? '#4361EE60' : '#2A9D8F60';
    }
    
    if (card.flipped) {
      return card.type === 'korean' ? '#4361EE' : '#2A9D8F';
    }
    
    return '#ffffff15';
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.stats}>
          <ThemedText style={styles.statText}>
            Moves: {moves}
          </ThemedText>
          <ThemedText style={styles.statText}>
            Score: {score}
          </ThemedText>
          <ThemedText style={styles.statText}>
            Time: {timeLeft}s
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.exitButton} onPress={onExit}>
          <Ionicons name="close" size={24} color={Colors.light.tint} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.gameContainer}>
        <ThemedText type="subtitle" style={styles.gameTitle}>
          Match Korean Words to Their Meanings
        </ThemedText>
        
        <Animated.View style={[styles.cardGrid, shakingStyle]}>
          {matchCards.map((card, index) => (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.card,
                { backgroundColor: getCardBackgroundColor(card) }
              ]}
              onPress={() => handleCardPress(card)}
              disabled={selectedCards.length >= 2 || card.flipped || card.matched}
            >
              {card.flipped || card.matched ? (
                <Animated.View 
                  entering={FlipInYRight.duration(FLIP_DURATION)}
                  style={styles.cardContent}
                >
                  <ThemedText 
                    style={[
                      styles.cardText,
                      card.type === 'korean' ? styles.koreanText : styles.englishText
                    ]}
                  >
                    {card.text}
                  </ThemedText>
                </Animated.View>
              ) : (
                <Ionicons 
                  name="help-circle-outline" 
                  size={32} 
                  color="#ffffff70" 
                />
              )}
              
              {card.matched && (
                <View style={styles.matchedOverlay}>
                  <Ionicons name="checkmark-circle" size={32} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>
      
      {gameComplete && (
        <Animated.View 
          entering={FadeInDown}
          style={styles.gameCompleteContainer}
        >
          <ThemedText type="title" style={styles.gameCompleteText}>
            Game Complete!
          </ThemedText>
          <ThemedText style={styles.completeStats}>
            Score: {score} | Moves: {moves}
          </ThemedText>
          <TouchableOpacity 
            style={styles.playAgainButton}
            onPress={onExit}
          >
            <ThemedText style={styles.playAgainText}>
              Exit Game
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      )}
      
      {timeLeft <= 0 && !gameComplete && (
        <Animated.View 
          entering={FadeInDown}
          style={styles.gameCompleteContainer}
        >
          <ThemedText type="title" style={styles.gameCompleteText}>
            Time's Up!
          </ThemedText>
          <ThemedText style={styles.completeStats}>
            Score: {score} | Moves: {moves}
          </ThemedText>
          <TouchableOpacity 
            style={styles.playAgainButton}
            onPress={onExit}
          >
            <ThemedText style={styles.playAgainText}>
              Exit Game
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    gap: 15,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
  },
  exitButton: {
    padding: 5,
  },
  gameContainer: {
    flex: 1,
  },
  gameTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  card: {
    width: (SCREEN_WIDTH - 60) / 3,
    height: (SCREEN_WIDTH - 60) / 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    margin: 5,
    position: 'relative',
  },
  cardContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  cardText: {
    textAlign: 'center',
  },
  koreanText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  englishText: {
    color: 'white',
    fontSize: 14,
  },
  matchedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameCompleteContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameCompleteText: {
    color: 'white',
    fontSize: 28,
    marginBottom: 15,
  },
  completeStats: {
    color: 'white',
    fontSize: 18,
    marginBottom: 30,
  },
  playAgainButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 30,
  },
  playAgainText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});