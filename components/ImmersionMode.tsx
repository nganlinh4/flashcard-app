import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Image, ImageBackground } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { speakKorean } from '@/services/ttsService';
import Animated, { FadeIn, FadeOut, SlideInUp } from 'react-native-reanimated';
import { Flashcard } from '@/types/flashcard';
import { Audio } from 'expo-av';

interface ImmersionModeProps {
  isVisible: boolean;
  onClose: () => void;
  cards: Flashcard[];
}

/**
 * A full immersion learning experience that combines visual, audio and interactive elements
 * to create a more engaging and effective language learning environment.
 */
export function ImmersionMode({ isVisible, onClose, cards }: ImmersionModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ambientSound, setAmbientSound] = useState<Audio.Sound | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [backgroundScene, setBackgroundScene] = useState('cafe');
  
  const scenes = {
    cafe: {
      image: require('@/assets/images/react-logo.png'), // Replace with actual scene images
      audio: null, // Replace with actual audio files when available
      name: 'Café'
    },
    market: {
      image: require('@/assets/images/react-logo.png'),
      audio: null,
      name: 'Market'
    },
    office: {
      image: require('@/assets/images/react-logo.png'),
      audio: null,
      name: 'Office'
    },
  };
  
  // Play ambient sound when immersion mode is active
  useEffect(() => {
    if (isVisible) {
      loadAndPlayAmbient();
    } else {
      stopAmbient();
    }
    
    return () => {
      stopAmbient();
    };
  }, [isVisible, backgroundScene]);
  
  const loadAndPlayAmbient = async () => {
    try {
      // This would be actual ambient sound in a real implementation
      // const { sound } = await Audio.Sound.createAsync(scenes[backgroundScene].audio);
      // setAmbientSound(sound);
      // await sound.playAsync();
    } catch (error) {
      console.error("Error loading ambient sound:", error);
    }
  };
  
  const stopAmbient = async () => {
    if (ambientSound) {
      await ambientSound.stopAsync();
      await ambientSound.unloadAsync();
    }
  };
  
  const speakPhrase = async () => {
    if (cards.length > 0 && currentIndex < cards.length) {
      await speakKorean(cards[currentIndex].korean);
    }
  };
  
  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowTranslation(false);
    }
  };
  
  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowTranslation(false);
    }
  };
  
  const toggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };
  
  const changeScene = (scene: string) => {
    setBackgroundScene(scene);
  };
  
  if (!isVisible || cards.length === 0) return null;
  
  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <ImageBackground
        source={scenes[backgroundScene as keyof typeof scenes].image}
        style={styles.background}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close-circle" size={32} color="white" />
            </TouchableOpacity>
            <ThemedText style={styles.sceneTitle}>
              {scenes[backgroundScene as keyof typeof scenes].name} Immersion
            </ThemedText>
          </View>
          
          <View style={styles.sceneSelector}>
            {Object.keys(scenes).map((scene) => (
              <TouchableOpacity
                key={scene}
                style={[
                  styles.sceneButton,
                  backgroundScene === scene && styles.activeSceneButton
                ]}
                onPress={() => changeScene(scene)}
              >
                <ThemedText style={styles.sceneText}>
                  {scenes[scene as keyof typeof scenes].name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
          
          <Animated.View
            entering={SlideInUp}
            style={styles.contentContainer}
          >
            <View style={styles.phraseCard}>
              <ThemedText type="title" style={styles.korean}>
                {cards[currentIndex].korean}
              </ThemedText>
              
              {showTranslation && (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                  <ThemedText style={styles.english}>
                    {cards[currentIndex].english}
                  </ThemedText>
                  
                  {cards[currentIndex].example && (
                    <ThemedText style={styles.example}>
                      "{cards[currentIndex].example}"
                    </ThemedText>
                  )}
                </Animated.View>
              )}
              
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={toggleTranslation}
                >
                  <Ionicons name={showTranslation ? "eye-off" : "eye"} size={24} color="white" />
                  <ThemedText style={styles.actionText}>
                    {showTranslation ? "Hide" : "Show"} Translation
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={speakPhrase}
                >
                  <Ionicons name="volume-high" size={24} color="white" />
                  <ThemedText style={styles.actionText}>
                    Speak Phrase
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.navigation}>
              <TouchableOpacity
                style={[styles.navButton, currentIndex === 0 && styles.disabledButton]}
                onPress={prevCard}
                disabled={currentIndex === 0}
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
              
              <ThemedText style={styles.pageIndicator}>
                {currentIndex + 1} / {cards.length}
              </ThemedText>
              
              <TouchableOpacity
                style={[styles.navButton, currentIndex === cards.length - 1 && styles.disabledButton]}
                onPress={nextCard}
                disabled={currentIndex === cards.length - 1}
              >
                <Ionicons name="chevron-forward" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ImageBackground>
    </Modal>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 20,
  },
  closeButton: {
    padding: 5,
  },
  sceneTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  sceneSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  sceneButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeSceneButton: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  sceneText: {
    color: 'white',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phraseCard: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 30,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  korean: {
    fontSize: 32,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  english: {
    fontSize: 24,
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  example: {
    fontSize: 16,
    color: 'white',
    fontStyle: 'italic',
    opacity: 0.8,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 30,
    justifyContent: 'space-around',
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 30,
  },
  actionText: {
    color: 'white',
    marginLeft: 8,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '60%',
    marginTop: 30,
  },
  navButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.4,
  },
  pageIndicator: {
    color: 'white',
    fontSize: 16,
  },
});