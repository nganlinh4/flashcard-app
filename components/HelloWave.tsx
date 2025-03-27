import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface HelloWaveProps {
  style?: any;
  size?: number;
}

export function HelloWave({ style, size = 32 }: HelloWaveProps) {
  const colorScheme = useColorScheme();
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withDelay(
      500,
      withRepeat(
        withTiming(1, {
          duration: 800,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
        2,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `-${rotation.value * 30}deg` },
        { translateX: rotation.value * 2 },
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, style, animatedStyle]}>
      <Ionicons
        name="hand-left"
        size={size}
        color={colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
