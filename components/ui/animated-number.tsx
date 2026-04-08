import { FontFamily } from '@/constants/typography';
import React, { useEffect } from 'react';
import { StyleSheet, TextInput, type StyleProp, type TextStyle } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

// Must use TextInput (not Text) for animatedProps to work with string values
Animated.addWhitelistedNativeProps({ text: true });
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AnimatedNumberProps {
  value: number;
  format: (n: number) => string;
  style?: StyleProp<TextStyle>;
}

export function AnimatedNumber({ value, format, style }: AnimatedNumberProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withSpring(value, { damping: 28, stiffness: 120 });
  }, [value]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const animatedProps = useAnimatedProps(() => ({
    text: format(Math.round(progress.value)),
  })) as any;

  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      value={format(value)}          // fallback for SSR / first render
      animatedProps={animatedProps}
      style={[styles.base, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    padding: 0,
    fontFamily: FontFamily.bold,
    includeFontPadding: false,
  },
});
