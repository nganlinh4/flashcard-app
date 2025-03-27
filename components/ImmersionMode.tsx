import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeIn, 
  FadeOut,
  SlideInRight,
  useSharedValue,
  withTiming,
  useAnimatedStyle
} from 'react-native-reanimated';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors } from '@/constants/Colors';
import { Flashcard } from '@/types/flashcard';
import { speakKorean } from '@/services/ttsService';
import { PronunciationPractice } from './PronunciationPractice';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface ImmersionModeProps {
  isVisible: boolean;
  onClose: () => void;
  cards: Flashcard[];
}

// Mock scenarios for immersion learning
const scenarios = [
  {
    id: 'cafe',
    title: 'At the Café',
    description: 'Learn how to order drinks and food in Korean',
    imageUrl: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    phrases: [
      { korean: '커피 주세요', english: 'Coffee please', context: 'Ordering a coffee' },
      { korean: '얼마예요?', english: 'How much is it?', context: 'Asking for the price' },
      { korean: '여기서 먹을게요', english: 'I\'ll eat here', context: 'Dining in' },
      { korean: '포장해 주세요', english: 'Please wrap it up (to go)', context: 'Taking out' }
    ]
  },
  {
    id: 'transport',
    title: 'Public Transport',
    description: 'Useful phrases for navigating Korean public transportation',
    imageUrl: 'https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    phrases: [
      { korean: '이 버스가 어디로 가요?', english: 'Where does this bus go?', context: 'Asking for directions' },
      { korean: '지하철역이 어디예요?', english: 'Where is the subway station?', context: 'Looking for the subway' },
      { korean: '다음 정류장에서 내릴게요', english: 'I\'ll get off at the next stop', context: 'Telling the driver' },
      { korean: '교통카드 어디서 살 수 있어요?', english: 'Where can I buy a transportation card?', context: 'Asking about tickets' }
    ]
  },
  {
    id: 'shopping',
    title: 'Shopping',
    description: 'Learn how to shop and bargain in Korean markets',
    imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    phrases: [
      { korean: '이거 얼마예요?', english: 'How much is this?', context: 'Asking for price' },
      { korean: '좀 깎아 주세요', english: 'Please give me a discount', context: 'Bargaining' },
      { korean: '다른 색상 있어요?', english: 'Do you have other colors?', context: 'Looking for options' },
      { korean: '카드로 결제할게요', english: 'I\'ll pay with card', context: 'Paying' }
    ]
  }
];

export function ImmersionMode({ isVisible, onClose, cards }: ImmersionModeProps) {
  const [selectedScenario, setSelectedScenario] = useState<typeof scenarios[0] | null>(null);
  const [showPractice, setShowPractice] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState<string>('');
  
  // Animation values
  const backdropOpacity = useSharedValue(0);
  
  useEffect(() => {
    if (isVisible) {
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isVisible]);
  
  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });
  
  const handleScenarioPress = (scenario: typeof scenarios[0]) => {
    setSelectedScenario(scenario);
  };
  
  const handleBackPress = () => {
    setSelectedScenario(null);
  };
  
  const handlePhrasePress = (phrase: typeof scenarios[0]['phrases'][0]) => {
    speakKorean(phrase.korean);
  };
  
  const handlePracticePress = (phrase: string) => {
    setSelectedPhrase(phrase);
    setShowPractice(true);
  };
  
  const renderScenarioList = () => {
    return (
      <ScrollView style={styles.scenarioList} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.title}>
          Immersion Mode
        </ThemedText>
        
        <ThemedText style={styles.description}>
          Practice Korean in real-life scenarios. Choose a situation below to start learning useful phrases.
        </ThemedText>
        
        {scenarios.map((scenario) => (
          <TouchableOpacity 
            key={scenario.id}
            style={styles.scenarioCard}
            onPress={() => handleScenarioPress(scenario)}
          >
            <Image 
              source={{ uri: scenario.imageUrl }} 
              style={styles.scenarioImage}
            />
            <View style={styles.scenarioContent}>
              <ThemedText type="subtitle" style={styles.scenarioTitle}>
                {scenario.title}
              </ThemedText>
              <ThemedText style={styles.scenarioDescription}>
                {scenario.description}
              </ThemedText>
              <View style={styles.scenarioButton}>
                <ThemedText style={styles.scenarioButtonText}>Start</ThemedText>
                <Ionicons name="chevron-forward" size={16} color={Colors.light.tint} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };
  
  const renderScenarioDetail = () => {
    if (!selectedScenario) return null;
    
    return (
      <Animated.View 
        entering={SlideInRight.springify()} 
        style={styles.detailContainer}
      >
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.light.tint} />
            <ThemedText style={styles.backText}>Back</ThemedText>
          </TouchableOpacity>
          <ThemedText type="subtitle" numberOfLines={1} style={styles.detailTitle}>
            {selectedScenario.title}
          </ThemedText>
        </View>
        
        <ScrollView style={styles.detailContent}>
          <Image 
            source={{ uri: selectedScenario.imageUrl }} 
            style={styles.detailImage}
          />
          
          <ThemedText style={styles.detailDescription}>
            {selectedScenario.description}
          </ThemedText>
          
          <ThemedText type="subtitle" style={styles.phrasesTitle}>
            Useful Phrases
          </ThemedText>
          
          {selectedScenario.phrases.map((phrase, index) => (
            <View key={`phrase-${index}`} style={styles.phraseCard}>
              <View style={styles.phraseTextContainer}>
                <ThemedText style={styles.phraseKorean}>
                  {phrase.korean}
                </ThemedText>
                <ThemedText style={styles.phraseEnglish}>
                  {phrase.english}
                </ThemedText>
                <ThemedText style={styles.phraseContext}>
                  {phrase.context}
                </ThemedText>
              </View>
              
              <View style={styles.phraseActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handlePhrasePress(phrase)}
                >
                  <Ionicons name="volume-high-outline" size={22} color={Colors.light.tint} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handlePracticePress(phrase.korean)}
                >
                  <Ionicons name="mic-outline" size={22} color={Colors.light.tint} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    );
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.container, backdropStyle]}>
        <ThemedView style={styles.content}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.light.tint} />
          </TouchableOpacity>
          
          {!selectedScenario ? renderScenarioList() : renderScenarioDetail()}
        </ThemedView>
        
        {/* Pronunciation Practice Modal */}
        {showPractice && (
          <Modal
            visible={showPractice}
            animationType="slide"
            onRequestClose={() => setShowPractice(false)}
          >
            <PronunciationPractice
              koreanText={selectedPhrase}
              onClose={() => setShowPractice(false)}
            />
          </Modal>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  content: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    marginBottom: 15,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  description: {
    marginBottom: 25,
    lineHeight: 22,
    paddingHorizontal: 20,
    opacity: 0.8,
  },
  scenarioList: {
    flex: 1,
  },
  scenarioCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#ffffff08',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scenarioImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  scenarioContent: {
    padding: 15,
  },
  scenarioTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  scenarioDescription: {
    opacity: 0.7,
    marginBottom: 15,
    fontSize: 14,
  },
  scenarioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scenarioButtonText: {
    color: Colors.light.tint,
    fontWeight: '600',
    marginRight: 5,
  },
  detailContainer: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff10',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  backText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  detailTitle: {
    fontSize: 18,
    flex: 1,
  },
  detailContent: {
    flex: 1,
  },
  detailImage: {
    width: SCREEN_WIDTH,
    height: 200,
  },
  detailDescription: {
    padding: 20,
    lineHeight: 22,
    opacity: 0.8,
  },
  phrasesTitle: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  phraseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#ffffff08',
    borderRadius: 12,
  },
  phraseTextContainer: {
    flex: 1,
  },
  phraseKorean: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  phraseEnglish: {
    marginBottom: 5,
  },
  phraseContext: {
    fontSize: 12,
    opacity: 0.6,
  },
  phraseActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    backgroundColor: '#ffffff10',
    borderRadius: 20,
  },
});