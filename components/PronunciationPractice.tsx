import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';

import { speakKorean } from '@/services/ttsService';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors } from '@/constants/Colors';

interface PronunciationPracticeProps {
  koreanText: string;
  onClose: () => void;
}

export function PronunciationPractice({ koreanText, onClose }: PronunciationPracticeProps) {
  // Audio recording related state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [feedback, setFeedback] = useState<{
    score: number;
    feedback: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attempts, setAttempts] = useState(0);
  
  // Animation values
  const pulseValue = useSharedValue(1);
  const waveOpacity = useSharedValue(0);
  
  // Request permissions when component mounts
  useEffect(() => {
    if (permissionResponse && !permissionResponse.granted) {
      requestPermission();
    }
  }, [permissionResponse]);
  
  // Timer for recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);
  
  // Pulse animation when recording
  useEffect(() => {
    if (isRecording) {
      pulseValue.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Infinite repeat
        true // Reverse
      );
      
      waveOpacity.value = withTiming(1, { duration: 300 });
    } else {
      pulseValue.value = withTiming(1);
      waveOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isRecording, pulseValue, waveOpacity]);
  
  const animatedPulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseValue.value }],
    };
  });
  
  const animatedWaveStyle = useAnimatedStyle(() => {
    return {
      opacity: waveOpacity.value,
    };
  });
  
  const startRecording = async () => {
    try {
      if (!permissionResponse?.granted) {
        await requestPermission();
        return;
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      setFeedback(null);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };
  
  const stopRecording = async () => {
    if (!recording) return;
    
    setIsRecording(false);
    setIsProcessing(true);
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        // In a real app, you would send the audio to a server for analysis
        // Here we'll just simulate the analysis with a delay
        setTimeout(() => {
          analyzePronunciation();
          setAttempts(prev => prev + 1);
          setIsProcessing(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsProcessing(false);
    }
    
    setRecording(null);
  };
  
  const analyzePronunciation = () => {
    // Mock analysis - in a real app, this would come from a backend service
    const randomScore = Math.floor(Math.random() * 5) + 1;
    const feedbackMessages = [
      'Try to emphasize the first syllable more.',
      'Your pronunciation is getting better! Focus on the rhythm.',
      'Pay attention to the vowel sounds in the middle.',
      'Good job! Your tone is natural.',
      'Try to pronounce more slowly and clearly.'
    ];
    
    setFeedback({
      score: randomScore,
      feedback: feedbackMessages[randomScore - 1] || feedbackMessages[0]
    });
  };
  
  const playModel = async () => {
    await speakKorean(koreanText);
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Pronunciation Practice
        </ThemedText>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={Colors.light.tint} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.contentContainer}>
        <ThemedText type="subtitle" style={styles.instructions}>
          Listen to the correct pronunciation, then record yourself saying:
        </ThemedText>
        
        <ThemedText style={styles.koreanText}>
          {koreanText}
        </ThemedText>
        
        <View style={styles.modelContainer}>
          <TouchableOpacity style={styles.modelButton} onPress={playModel}>
            <Ionicons name="volume-high" size={24} color="white" />
            <ThemedText style={styles.modelText}>Listen to Model</ThemedText>
          </TouchableOpacity>
        </View>
        
        <Animated.View style={[styles.recordingContainer, animatedWaveStyle]}>
          <View style={styles.waveContainer}>
            {[...Array(5)].map((_, index) => (
              <View 
                key={`wave-${index}`} 
                style={[
                  styles.wave, 
                  { 
                    height: 10 + (index * 5), 
                    opacity: 1 - (index * 0.15),
                    backgroundColor: isRecording ? '#FF4F5B' : '#60606080'
                  }
                ]} 
              />
            ))}
          </View>
          
          {isRecording && (
            <ThemedText style={styles.recordingTime}>
              {formatTime(recordingDuration)}
            </ThemedText>
          )}
        </Animated.View>
        
        <View style={styles.controlsContainer}>
          <Animated.View style={animatedPulseStyle}>
            <TouchableOpacity
              style={[
                styles.recordButton, 
                isRecording && styles.stopButton
              ]}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Ionicons
                  name={isRecording ? "square" : "mic"}
                  size={24}
                  color="white"
                />
              )}
            </TouchableOpacity>
          </Animated.View>
          
          <ThemedText style={styles.recordingStatus}>
            {isProcessing 
              ? 'Analyzing your pronunciation...' 
              : isRecording 
                ? 'Recording... Tap to stop' 
                : 'Tap to start recording'}
          </ThemedText>
        </View>
        
        {feedback && (
          <Animated.View 
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.feedbackContainer}
          >
            <ThemedText type="subtitle">Feedback</ThemedText>
            
            <View style={styles.scoreContainer}>
              {[...Array(5)].map((_, index) => (
                <Ionicons 
                  key={`star-${index}`}
                  name={index < feedback.score ? "star" : "star-outline"}
                  size={24}
                  color="#FFD700"
                />
              ))}
            </View>
            
            <ThemedText style={styles.feedbackText}>
              {feedback.feedback}
            </ThemedText>
            
            <ThemedText style={styles.attemptsText}>
              You've made {attempts} {attempts === 1 ? 'attempt' : 'attempts'}
            </ThemedText>
            
            <TouchableOpacity 
              style={styles.tryAgainButton}
              onPress={startRecording}
            >
              <ThemedText style={styles.tryAgainText}>
                Try Again
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
  },
  closeButton: {
    padding: 5,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 20,
  },
  koreanText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  modelContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  modelButton: {
    flexDirection: 'row',
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
  },
  modelText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  recordingContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    height: 80,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    gap: 5,
  },
  wave: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: '#60606080',
  },
  recordingTime: {
    marginTop: 10,
    fontSize: 14,
    opacity: 0.7,
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF4F5B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 10,
  },
  stopButton: {
    backgroundColor: '#E63946',
  },
  recordingStatus: {
    textAlign: 'center',
    opacity: 0.7,
  },
  feedbackContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#ffffff10',
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  scoreContainer: {
    flexDirection: 'row',
    marginVertical: 15,
  },
  feedbackText: {
    textAlign: 'center',
    marginBottom: 15,
  },
  attemptsText: {
    opacity: 0.7,
    marginBottom: 20,
    fontSize: 14,
  },
  tryAgainButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 30,
  },
  tryAgainText: {
    color: 'white',
    fontWeight: 'bold',
  },
});