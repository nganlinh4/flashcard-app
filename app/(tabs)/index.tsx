import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getProgress, UserProgress } from '@/services/progressService';
import { Flashcard } from '@/types/flashcard';
import { generateFlashcards } from '@/services/aiService';
import { HelloWave } from '@/components/HelloWave';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [todayCards, setTodayCards] = useState<Flashcard[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const userProgress = await getProgress();
        const previewCards = await generateFlashcards(3);
        
        setProgress(userProgress);
        setTodayCards(previewCards);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const calculateLevel = (): number => {
    if (!progress) return 1;
    
    // Fix the type issue by ensuring we're working with numbers
    const totalCards = Object.entries(progress.cardsByLevel).reduce(
      (acc, [_, value]) => acc + (typeof value === 'number' ? value : 0), 
      0
    );
    
    return Math.min(5, Math.floor(totalCards / 20) + 1);
  };
  
  const getDailyGoalProgress = () => {
    const cardsToday = 20; // Mock value or can come from progress
    const dailyGoal = 30;
    return Math.min(100, Math.round((cardsToday / dailyGoal) * 100));
  };
  
  const navigateToStudy = () => {
    router.push('/(tabs)/flashcards');
  };
  
  const navigateToCategories = () => {
    router.push('/(tabs)/categories');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.welcomeContainer}>
              <HelloWave style={styles.helloWave} />
              <ThemedText type="title" style={styles.welcomeText}>
                안녕하세요!
              </ThemedText>
            </View>
            <ThemedText type="subtitle">
              {progress?.streak ? `${progress.streak} day streak! 🔥` : 'Welcome to your Korean studies'}
            </ThemedText>
          </View>
        </View>
        
        {/* Daily goal progress */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.goalContainer}>
          <View style={styles.goalHeader}>
            <ThemedText type="subtitle">Daily Goal Progress</ThemedText>
            <ThemedText type="default">{getDailyGoalProgress()}%</ThemedText>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${getDailyGoalProgress()}%` }
              ]} 
            />
          </View>
          <ThemedText style={styles.goalText}>
            20/30 cards reviewed today
          </ThemedText>
        </Animated.View>
        
        {/* Quick actions */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quick Actions
          </ThemedText>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={navigateToStudy}
            >
              <LinearGradient 
                colors={['#4c66ef', '#3b5fe2']} 
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="book" size={24} color="white" />
                <ThemedText style={styles.actionText}>Study Now</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={navigateToCategories}
            >
              <LinearGradient 
                colors={['#f5576c', '#f093fb']} 
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="grid" size={24} color="white" />
                <ThemedText style={styles.actionText}>Categories</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient 
                colors={['#43e97b', '#38f9d7']} 
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="create" size={24} color="white" />
                <ThemedText style={styles.actionText}>Create Cards</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
        
        {/* Stats overview */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Your Progress
          </ThemedText>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons 
                name="flame" 
                size={28} 
                color={colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint} 
              />
              <ThemedText type="title" style={styles.statValue}>
                {progress?.streak || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Day Streak</ThemedText>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons 
                name="school" 
                size={28} 
                color={colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint} 
              />
              <ThemedText type="title" style={styles.statValue}>
                {calculateLevel()}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Current Level</ThemedText>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons 
                name="checkmark-circle" 
                size={28} 
                color={colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint} 
              />
              <ThemedText type="title" style={styles.statValue}>
                {progress?.totalCardsReviewed || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Cards Mastered</ThemedText>
            </View>
          </View>
        </Animated.View>
        
        {/* Today's cards preview */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <View style={styles.previewHeaderRow}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Today's Preview
            </ThemedText>
            <TouchableOpacity onPress={navigateToStudy}>
              <ThemedText style={styles.seeAllText}>See All</ThemedText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.previewCards}>
            {todayCards.map((card, index) => (
              <Animated.View 
                key={card.id} 
                entering={SlideInRight.delay(500 + index * 100).springify()}
                style={styles.previewCard}
              >
                <ThemedText style={styles.previewKorean}>{card.korean}</ThemedText>
                <ThemedText style={styles.previewEnglish}>{card.english}</ThemedText>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
        
        {/* Achievement unlocked */}
        {progress?.achievements?.length > 0 && (
          <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.achievementContainer}>
            <View style={styles.achievementContent}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <View style={styles.achievementTextContainer}>
                <ThemedText type="subtitle">Achievement Unlocked!</ThemedText>
                <ThemedText>{progress.achievements[progress.achievements.length - 1]}</ThemedText>
              </View>
            </View>
          </Animated.View>
        )}
        
        {/* Bottom padding */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    marginBottom: 10,
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: 28,
    marginLeft: 10,
  },
  helloWave: {
    height: 32,
    width: 32,
  },
  goalContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ffffff10',
    borderRadius: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#ffffff20',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.light.tint,
    borderRadius: 4,
  },
  goalText: {
    fontSize: 12,
    opacity: 0.7,
  },
  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionGradient: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff10',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  seeAllText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  previewCards: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  previewCard: {
    backgroundColor: '#ffffff10',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  previewKorean: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  previewEnglish: {
    opacity: 0.7,
  },
  achievementContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  achievementContent: {
    flexDirection: 'row',
    backgroundColor: '#ffffff10',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD70020',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
});
