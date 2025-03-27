import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { getProgress } from '@/services/progressService';
import { useState, useEffect } from 'react';

type ChartData = {
  label: string;
  value: number;
  color: string;
};

export default function StatisticsScreen() {
  const colorScheme = useColorScheme();
  const [stats, setStats] = useState({
    totalCards: 0,
    cardsReviewed: 0,
    streak: 0,
    retention: 0,
    avgTimePerCard: 0,
    cardsByLevel: {} as Record<string, number>,
    studyHistory: [
      { date: '03/22', count: 15 },
      { date: '03/23', count: 22 },
      { date: '03/24', count: 18 },
      { date: '03/25', count: 25 },
      { date: '03/26', count: 32 },
      { date: '03/27', count: 28 },
      { date: '03/28', count: 20 },
    ],
  });
  
  useEffect(() => {
    const loadStats = async () => {
      const progress = await getProgress();
      setStats(prev => ({
        ...prev,
        cardsReviewed: progress.totalCardsReviewed,
        streak: progress.streakDays,
        cardsByLevel: progress.cardsByLevel,
      }));
    };
    
    loadStats();
  }, []);

  const renderStatCard = (title: string, value: string | number, description: string, delay: number = 0) => (
    <Animated.View entering={FadeInRight.delay(delay).springify()} style={styles.statCard}>
      <ThemedText type="subtitle" style={styles.statTitle}>{title}</ThemedText>
      <ThemedText type="title" style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statDescription}>{description}</ThemedText>
    </Animated.View>
  );

  const renderBarChart = () => {
    const maxValue = Math.max(...stats.studyHistory.map(day => day.count));

    return (
      <View style={styles.chartContainer}>
        <ThemedText type="subtitle" style={styles.chartTitle}>Study History</ThemedText>
        <View style={styles.barChart}>
          {stats.studyHistory.map((day, index) => (
            <View key={day.date} style={styles.barColumn}>
              <Animated.View 
                entering={FadeIn.delay(index * 100).springify()}
                style={[
                  styles.barValue,
                  {
                    height: `${(day.count / maxValue) * 100}%`,
                    backgroundColor: day.count > 25 ? '#4CAF50' : day.count > 15 ? '#2196F3' : '#FFC107'
                  }
                ]}
              />
              <ThemedText style={styles.barLabel}>{day.date}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderLevelDistribution = () => {
    const total = Object.values(stats.cardsByLevel).reduce((sum, val) => sum + val, 0) || 1;
    
    const data: ChartData[] = [
      { label: 'Level 1', value: stats.cardsByLevel[1] || 0, color: '#FF6B6B' },
      { label: 'Level 2', value: stats.cardsByLevel[2] || 0, color: '#FFD93D' },
      { label: 'Level 3', value: stats.cardsByLevel[3] || 0, color: '#6BCB77' },
      { label: 'Level 4', value: stats.cardsByLevel[4] || 0, color: '#4D96FF' },
      { label: 'Level 5', value: stats.cardsByLevel[5] || 0, color: '#9B5DE5' },
    ];
    
    return (
      <View style={styles.distributionContainer}>
        <ThemedText type="subtitle" style={styles.chartTitle}>Level Distribution</ThemedText>
        <View style={styles.progressBars}>
          {data.map((item, index) => (
            <View key={item.label} style={styles.progressBarRow}>
              <ThemedText style={styles.progressLabel}>{item.label}</ThemedText>
              <View style={styles.progressBarContainer}>
                <Animated.View 
                  entering={FadeInRight.delay(index * 100).springify()}
                  style={[
                    styles.progressBarFill,
                    { 
                      width: `${(item.value / total) * 100}%`,
                      backgroundColor: item.color
                    }
                  ]}
                />
              </View>
              <ThemedText style={styles.progressValue}>{item.value}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ParallaxScrollView
        headerImage={
          <ThemedText type="title" style={styles.headerTitle}>
            Statistics
          </ThemedText>
        }
        headerBackgroundColor={{
          light: Colors.light.background,
          dark: Colors.dark.background,
        }}
      >
        <View style={styles.statsContainer}>
          {renderStatCard('Days Streak', stats.streak, 'Consecutive study days', 100)}
          {renderStatCard('Cards Studied', stats.cardsReviewed, 'Total cards reviewed', 200)}
          {renderStatCard('Retention Rate', `${stats.retention || 85}%`, 'Successful recalls', 300)}
          
          {renderBarChart()}
          {renderLevelDistribution()}
        </View>
      </ParallaxScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    padding: 20,
  },
  statsContainer: {
    padding: 16,
  },
  statCard: {
    backgroundColor: '#ffffff10',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statTitle: {
    opacity: 0.7,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statDescription: {
    fontSize: 14,
    opacity: 0.5,
  },
  chartContainer: {
    backgroundColor: '#ffffff10',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    marginBottom: 16,
  },
  barChart: {
    flexDirection: 'row',
    height: 200,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  barValue: {
    width: '60%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 12,
  },
  distributionContainer: {
    backgroundColor: '#ffffff10',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressBars: {
    marginTop: 10,
  },
  progressBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    width: 60,
    fontSize: 12,
  },
  progressBarContainer: {
    flex: 1,
    height: 16,
    backgroundColor: '#ffffff20',
    borderRadius: 8,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 8,
  },
  progressValue: {
    width: 30,
    fontSize: 12,
    textAlign: 'right',
  },
});