/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#7fd8ff';

export const Colors = {
  light: {
    text: '#1a1a1a',
    background: '#f8f9fa',
    tint: tintColorLight,
    icon: '#5e6c84',
    tabIconDefault: '#5e6c84',
    tabIconSelected: tintColorLight,
    cardBackground: '#ffffff',
    buttonPrimary: '#2563eb',
    buttonSecondary: '#4b5563',
  },
  dark: {
    text: '#f3f4f6',
    background: '#111827',
    tint: tintColorDark,
    icon: '#9ca3af',
    tabIconDefault: '#9ca3af',
    tabIconSelected: tintColorDark,
    cardBackground: '#1f2937',
    buttonPrimary: '#3b82f6',
    buttonSecondary: '#6b7280',
  },
};
