import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

interface CardControlsProps {
  currentIndex: number;
  totalCards: number;
  showAnswer: boolean;
  isSpeaking: boolean;
  onSpeak: () => void;
  onRating: (rating: number) => void;
  onRefresh: () => void;
}

export function CardControls({ 
  currentIndex, 
  totalCards, 
  showAnswer, 
  isSpeaking, 
  onSpeak, 
  onRating, 
  onRefresh 
}: CardControlsProps) {
  return (
    <View style={styles.controlsContainer}>
      {/* Pronunciation button */}
      <View style={styles.pronunciationContainer}>
        <TouchableOpacity 
          style={[styles.speakButton, isSpeaking && styles.speakingButton]}
          onPress={onSpeak}
          disabled={isSpeaking}
        >
          <Ionicons 
            name={isSpeaking ? "volume-high" : "volume-medium"} 
            size={22} 
            color="white" 
          />
          <ThemedText style={styles.speakButtonText}>
            {isSpeaking ? 'Playing...' : 'Pronunciation'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Card progress indicator */}
      <View style={styles.progressContainer}>
        <ThemedText type="default" style={styles.progressText}>
          Card {currentIndex + 1} of {totalCards}
        </ThemedText>
        
        <View style={styles.progressDots}>
          {Array.from({ length: Math.min(5, totalCards) }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentIndex % 5 && styles.activeDot,
              ]}
            />
          ))}
          {totalCards > 5 && <ThemedText style={styles.moreDots}>...</ThemedText>}
        </View>
      </View>

      {/* Rating buttons (shown when card is flipped) */}
      {showAnswer && (
        <Animated.View 
          entering={FadeInDown.springify()}
          style={styles.ratingContainer}
        >
          <ThemedText type="subtitle" style={styles.ratingText}>
            How well did you know this?
          </ThemedText>
          <View style={styles.ratingButtons}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[
                  styles.ratingButton,
                  { backgroundColor: getRatingColor(rating) }
                ]}
                onPress={() => onRating(rating)}
              >
                <ThemedText style={styles.ratingButtonText}>{rating}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}

      {/* New Deck button */}
      <TouchableOpacity 
        style={styles.refreshButton} 
        onPress={onRefresh}
      >
        <Ionicons name="refresh" size={16} color="white" />
        <ThemedText style={styles.refreshButtonText}>New Deck</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

// Helper function to get color for rating buttons
function getRatingColor(rating: number): string {
  switch (rating) {
    case 1: return '#f45b69'; // Red
    case 2: return '#f68e5f'; // Orange
    case 3: return '#f9c74f'; // Yellow
    case 4: return '#90be6d'; // Light green
    case 5: return '#43aa8b'; // Green
    default: return '#e0e0e0';
  }
}

const styles = StyleSheet.create({
  controlsContainer: {
    padding: 20,
  },
  pronunciationContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  speakButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.light.buttonPrimary,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  speakingButton: {
    backgroundColor: Colors.light.buttonSecondary,
  },
  speakButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  progressText: {
    marginBottom: 8,
  },
  progressDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff30',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: Colors.light.tint,
    transform: [{ scale: 1.2 }],
  },
  moreDots: {
    marginLeft: 4,
    fontSize: 12,
    opacity: 0.7,
  },
  ratingContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  ratingText: {
    marginBottom: 15,
  },
  ratingButtons: {
    flexDirection: 'row',
  },
  ratingButton: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  ratingButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 14,
    backgroundColor: Colors.light.buttonSecondary,
    borderRadius: 25,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
});