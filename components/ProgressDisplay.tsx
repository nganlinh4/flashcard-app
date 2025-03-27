import { View, Text, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { UserProgress } from '@/services/progressService';

interface ProgressDisplayProps {
  progress: UserProgress;
}

export default function ProgressDisplay({ progress }: ProgressDisplayProps) {
  const calculateLevel = (): number => {
    const totalCards = Object.values(progress.cardsByLevel).reduce(
      (a: number, b: number) => a + b, 0
    );
    return Math.min(5, Math.floor(totalCards / 20) + 1);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <ThemedText type="title">{progress.totalCardsReviewed}</ThemedText>
          <ThemedText type="default">Cards</ThemedText>
        </View>
        
        <View style={styles.statItem}>
          <ThemedText type="title">{progress.streakDays}</ThemedText>
          <ThemedText type="default">Day Streak</ThemedText>
        </View>
        
        <View style={styles.statItem}>
          <ThemedText type="title">{calculateLevel()}</ThemedText>
          <ThemedText type="default">Level</ThemedText>
        </View>
      </View>

      {progress.achievements.length > 0 && (
        <View style={styles.achievementsContainer}>
          <ThemedText type="subtitle">Recent Achievements</ThemedText>
          {progress.achievements.slice(-3).map((achievement: string, index: number) => (
            <View key={index} style={styles.achievementItem}>
              <ThemedText>🏆 {achievement}</ThemedText>
            </View>
          ))}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  achievementsContainer: {
    marginTop: 10,
  },
  achievementItem: {
    padding: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 5,
    marginTop: 5,
  },
});