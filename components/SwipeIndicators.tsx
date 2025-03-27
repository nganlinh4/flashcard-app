import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

export function SwipeIndicators() {
  return (
    <View style={styles.swipeIndicators}>
      <View style={styles.swipeIndicator}>
        <Ionicons name="close-circle" size={24} color="#f45b69" />
        <ThemedText style={styles.swipeText}>Hard</ThemedText>
      </View>
      <View style={styles.swipeIndicator}>
        <Ionicons name="checkmark-circle" size={24} color="#6BCB77" />
        <ThemedText style={styles.swipeText}>Easy</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    marginBottom: 10,
  },
  swipeIndicator: {
    alignItems: 'center',
  },
  swipeText: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
});