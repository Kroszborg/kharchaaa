import * as Haptics from 'expo-haptics';
import React from 'react';
import { type PressableProps, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface AnimatedPressableProps extends Omit<PressableProps, 'onPress'> {
  children: React.ReactNode;
  onPress?: () => void;
  scale?: number;
  haptic?: boolean;
  style?: PressableProps['style'];
}

export function AnimatedPressable({
  children,
  onPress,
  scale = 0.97,
  haptic = true,
  style,
  ...props
}: AnimatedPressableProps) {
  const pressed = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed.value ? scale : 1, { damping: 20, stiffness: 400 }) }],
  }));

  const gesture = Gesture.Tap()
    .onBegin(() => {
      pressed.value = true;
    })
    .onFinalize(() => {
      pressed.value = false;
    })
    .onEnd(() => {
      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress?.();
    });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[animatedStyle, style as object]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

export const styles = StyleSheet.create({});
