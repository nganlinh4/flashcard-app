import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Animated, { FadeIn, SlideInRight, ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors } from '@/constants/Colors';

// Define challenge types
type ChallengeType = 'streak' | 'mastery' | 'speed' | 'immersion';

// Challenge structure
interface Challenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  target: number;
  progress: number;
  reward: string;
  icon: string;
  color: string;
}

// Component props
interface DailyChallengeProps {
  onCompleteChallenge: (challengeId: string) => void;
  onStartChallenge: (challengeId: string) => void;
}

export function DailyChallenge({ onCompleteChallenge, onStartChallenge }: DailyChallengeProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Get today's date in the format "YYYY-MM-DD"
  const today = new Date().toISOString().split('T')[0];
  
  // Generate daily challenges based on the current date
  useEffect(() => {
    generateDailyChallenges();
  }, [today]);
  
  const generateDailyChallenges = () => {
    // In a real app, these would come from a backend API or be generated based on user progress
    const dailyChallenges: Challenge[] = [
      {
        id: `${today}-streak`,
        type: 'streak',
        title: 'Keep Your Streak!',
        description: 'Review at least 20 cards today',
        target: 20,
        progress: 0,
        reward: 'Streak Badge',
        icon: 'flame',
        color: '#F9A826',
      },
      {
        id: `${today}-mastery`,
        type: 'mastery',
        title: 'Master New Words',
        description: 'Learn 5 new words with perfect recall',
        target: 5,
        progress: 0,
        reward: '50 XP Bonus',
        icon: 'star',
        color: '#4361EE',
      },
      {
        id: `${today}-speed`,
        type: 'speed',
        title: 'Speed Challenge',
        description: 'Complete a quick 2-minute review session',
        target: 1,
        progress: 0,
        reward: 'Speed Badge',
        icon: 'timer',
        color: '#E63946',
      },
      {
        id: `${today}-immersion`,
        type: 'immersion',
        title: 'Immersion Practice',
        description: 'Complete one immersion scene',
        target: 1,
        progress: 0,
        reward: 'Cultural Badge',
        icon: 'globe',
        color: '#2A9D8F',
      },
    ];
    
    setChallenges(dailyChallenges);
  };
  
  const updateChallengeProgress = (challengeId: string, progress: number) => {
    setChallenges(prevChallenges => 
      prevChallenges.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, progress: Math.min(challenge.target, challenge.progress + progress) }
          : challenge
      )
    );
    
    // Check if challenge is completed
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge && challenge.progress + progress >= challenge.target) {
      onCompleteChallenge(challengeId);
    }
  };
  
  const startChallenge = (challengeId: string) => {
    onStartChallenge(challengeId);
  };
  
  const getChallengeProgress = (challenge: Challenge) => {
    return Math.min(100, Math.round((challenge.progress / challenge.target) * 100));
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Daily Challenges</ThemedText>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={generateDailyChallenges}
        >
          <Ionicons name="refresh" size={22} color={Colors.light.tint} />
        </TouchableOpacity>
      </View>
      
      <ThemedText style={styles.subtitle}>
        Complete daily challenges to earn rewards and maintain your learning streak
      </ThemedText>
      
      <View style={styles.challengesList}>
        {challenges.map((challenge, index) => (
          <Animated.View 
            key={challenge.id}
            entering={SlideInRight.delay(index * 100).springify()}
            style={styles.challengeCard}
          >
            <View style={styles.challengeHeader}>
              <View 
                style={[
                  styles.iconContainer, 
                  { backgroundColor: challenge.color }
                ]}
              >
                <Ionicons name={challenge.icon as any} size={24} color="white" />
              </View>
              <View style={styles.titleContainer}>
                <ThemedText type="subtitle" style={styles.challengeTitle}>
                  {challenge.title}
                </ThemedText>
                <ThemedText style={styles.challengeDesc}>
                  {challenge.description}
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar,
                    { width: `${getChallengeProgress(challenge)}%`, backgroundColor: challenge.color }
                  ]}
                />
              </View>
              <ThemedText style={styles.progressText}>
                {challenge.progress} / {challenge.target}
              </ThemedText>
            </View>
            
            <View style={styles.challengeFooter}>
              <View style={styles.rewardContainer}>
                <Ionicons name="gift-outline" size={16} color={Colors.light.tint} />
                <ThemedText style={styles.rewardText}>
                  Reward: {challenge.reward}
                </ThemedText>
              </View>
              
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: challenge.color }]}
                onPress={() => startChallenge(challenge.id)}
              >
                <ThemedText style={styles.startButtonText}>
                  Start
                </ThemedText>
              </TouchableOpacity>
            </View>
            
            {challenge.progress === challenge.target && (
              <Animated.View 
                entering={ZoomIn}
                style={styles.completeBadge}
              >
                <Ionicons name="checkmark-circle" size={28} color={challenge.color} />
              </Animated.View>
            )}
          </Animated.View>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 15,
  },
  refreshButton: {
    padding: 5,
  },
  challengesList: {
    marginTop: 10,
  },
  challengeCard: {
    backgroundColor: '#ffffff0f',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    position: 'relative',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  titleContainer: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  challengeDesc: {
    fontSize: 13,
    opacity: 0.7,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#ffffff20',
    borderRadius: 3,
    marginBottom: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
    opacity: 0.7,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 13,
    marginLeft: 5,
    opacity: 0.8,
  },
  startButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  completeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});