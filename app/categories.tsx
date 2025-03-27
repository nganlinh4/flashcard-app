import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import ParallaxScrollView from '@/components/ParallaxScrollView';

type Category = {
  id: string;
  title: string;
  description: string;
  count: number;
  image: any;
  colors: readonly [string, string]; // Fixed to match LinearGradient's expected type
};

// Mock categories data
const categories: Category[] = [
  {
    id: 'basics',
    title: 'Basics',
    description: 'Essential Korean vocabulary for beginners',
    count: 100,
    image: require('@/assets/images/react-logo.png'),
    colors: ['#FF9F59', '#FFC259'] as const
  },
  {
    id: 'travel',
    title: 'Travel',
    description: 'Useful phrases for your Korean trip',
    count: 75,
    image: require('@/assets/images/react-logo.png'),
    colors: ['#4FACFE', '#00F2FE'] as const
  },
  {
    id: 'food',
    title: 'Food & Dining',
    description: 'Restaurant vocabulary and food names',
    count: 60,
    image: require('@/assets/images/react-logo.png'),
    colors: ['#B465DA', '#CF6CC9'] as const
  },
  {
    id: 'business',
    title: 'Business Korean',
    description: 'Professional vocabulary for work',
    count: 50,
    image: require('@/assets/images/react-logo.png'),
    colors: ['#43E97B', '#38F9D7'] as const
  },
  {
    id: 'slang',
    title: 'Slang & Expressions',
    description: 'Modern Korean slang and expressions',
    count: 40,
    image: require('@/assets/images/react-logo.png'),
    colors: ['#FA709A', '#FEE140'] as const
  },
];

export default function CategoriesScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Navigate to flashcards with the selected category
    router.push({
      pathname: '/flashcards',
      params: { category: categoryId }
    });
  };

  const renderCategoryItem = ({ item, index }: { item: Category; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.animatedContainer}
    >
      <TouchableOpacity
        style={styles.categoryCard}
        activeOpacity={0.8}
        onPress={() => handleCategoryPress(item.id)}
      >
        <LinearGradient
          colors={item.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <ThemedText type="title" style={styles.categoryTitle}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.categoryDescription}>
            {item.description}
          </ThemedText>
          <ThemedText style={styles.categoryCount}>
            {item.count} cards
          </ThemedText>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <ThemedView style={styles.container}>
      <ParallaxScrollView
        headerImage={
          <ThemedText type="title" style={styles.headerTitle}>
            Categories
          </ThemedText>
        }
        headerBackgroundColor={{
          light: Colors.light.background,
          dark: Colors.dark.background,
        }}
      >
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          scrollEnabled={false}
        />
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
  list: {
    paddingHorizontal: 16,
  },
  animatedContainer: {
    marginBottom: 16,
  },
  categoryCard: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    // Replace shadow properties with boxShadow for web compatibility
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3, // Keep elevation for Android
  },
  gradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  categoryDescription: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  categoryCount: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
});