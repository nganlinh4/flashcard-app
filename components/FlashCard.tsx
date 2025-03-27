import { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  runOnJS,
  withSpring, 
  interpolate,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Flashcard } from '@/types/flashcard';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

type FlashCardProps = {
  card: Flashcard;
  mnemonicImage: string | null;
  onFlip: () => void;
  onSwipe: (rating: number) => void;
};

export function FlashCard({ card, mnemonicImage, onFlip, onSwipe }: FlashCardProps) {
  // Animation values
  const flipAnimation = useSharedValue(0);
  const cardPosition = useSharedValue(0);
  const cardRotation = useSharedValue(0);
  const cardScale = useSharedValue(1);

  // Handle card flip
  const handleFlip = useCallback(() => {
    if (flipAnimation.value === 0) {
      flipAnimation.value = withSpring(180, { damping: 10 });
    } else {
      flipAnimation.value = withSpring(0, { damping: 10 });
    }
    onFlip();
  }, [flipAnimation, onFlip]);

  // Animation styles
  const animatedFrontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipAnimation.value, [0, 180], [0, 180]);
    return {
      transform: [
        { translateX: cardPosition.value },
        { rotate: `${cardRotation.value}deg` },
        { scale: cardScale.value },
        { rotateY: `${rotateY}deg` },
        { perspective: 1000 }
      ],
      backfaceVisibility: 'hidden' as const,
      opacity: flipAnimation.value <= 90 ? 1 : 0,
    };
  });

  const animatedBackStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipAnimation.value, [0, 180], [180, 360]);
    return {
      transform: [
        { translateX: cardPosition.value },
        { rotate: `${cardRotation.value}deg` },
        { scale: cardScale.value },
        { rotateY: `${rotateY}deg` },
        { perspective: 1000 }
      ],
      backfaceVisibility: 'hidden' as const,
    };
  });

  // Gesture handler for card swiping
  const cardGestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = cardPosition.value;
    },
    onActive: (event, ctx) => {
      cardPosition.value = ctx.startX + event.translationX;
      cardRotation.value = (event.translationX / SCREEN_WIDTH) * 15; // rotate slightly while dragging
    },
    onEnd: (event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        // Swipe passed threshold - complete the swipe animation
        const direction = event.translationX > 0 ? 1 : -1;
        const rating = direction > 0 ? 4 : 2; // high rating for right, low for left
        
        cardPosition.value = withSpring(direction * SCREEN_WIDTH * 1.5, { duration: 300 }, () => {
          runOnJS(onSwipe)(rating);
        });
      } else {
        // Return to center
        cardPosition.value = withSpring(0);
        cardRotation.value = withSpring(0);
      }
    },
  });

  // Card front content
  const renderFrontContent = () => (
    <View style={styles.cardContent}>
      <ThemedText type="title" style={styles.cardText}>
        {card.korean}
      </ThemedText>
      
      <View style={styles.posIndicator}>
        <ThemedText style={styles.posText}>
          {card.example ? 'Example' : ''}
        </ThemedText>
      </View>
      
      <ThemedText style={styles.hintText}>
        Tap to flip, or swipe to rate
      </ThemedText>
    </View>
  );

  // Card back content
  const renderBackContent = () => (
    <View style={styles.cardContent}>
      <ThemedText type="title" style={styles.cardText}>
        {card.english}
      </ThemedText>
      
      {card.example && (
        <ThemedText style={styles.exampleText}>
          "{card.example}"
        </ThemedText>
      )}
      
      {mnemonicImage && (
        <Image 
          source={{ uri: mnemonicImage }} 
          style={styles.mnemonicImage}
          resizeMode="contain"
        />
      )}
    </View>
  );

  return (
    <PanGestureHandler onGestureEvent={cardGestureHandler}>
      <Animated.View style={styles.cardContainer}>
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={handleFlip}
          style={styles.cardTouchable}
        >
          <Animated.View style={[styles.card, animatedFrontStyle]}>
            <LinearGradient
              colors={['#ffffff10', '#ffffff05'] as const}
              style={styles.cardGradient}
            >
              {renderFrontContent()}
            </LinearGradient>
          </Animated.View>

          <Animated.View style={[styles.card, styles.cardFlipped, animatedBackStyle]}>
            <LinearGradient
              colors={['#ffffff10', '#ffffff05'] as const}
              style={styles.cardGradient}
            >
              {renderBackContent()}
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    minHeight: 350,
    position: 'relative',
    alignItems: 'center',
    marginTop: 10,
  },
  cardTouchable: {
    width: '100%',
    minHeight: 350,
  },
  card: {
    width: '100%',
    minHeight: 350,
    backgroundColor: '#ffffff05',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffffff15',
  },
  cardGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardFlipped: {
    backgroundColor: '#ffffff05',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cardContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
  },
  posIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#ffffff15',
    marginBottom: 20,
  },
  posText: {
    fontSize: 12,
    opacity: 0.7,
  },
  hintText: {
    fontSize: 14,
    opacity: 0.5,
    position: 'absolute',
    bottom: 10,
  },
  exampleText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
    marginBottom: 20,
    lineHeight: 22,
  },
  mnemonicImage: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 10,
  },
});