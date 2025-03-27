import React, { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';

interface TouchableWrapperProps {
  pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';
  children: ReactNode;
  style?: ViewStyle;
}

/**
 * A wrapper component that properly handles pointerEvents as a style prop
 * to avoid the "props.pointerEvents is deprecated" warning.
 */
export function TouchableWrapper({ pointerEvents, children, style = {} }: TouchableWrapperProps) {
  return (
    <View
      style={{
        ...style,
        pointerEvents,
      }}
    >
      {children}
    </View>
  );
}