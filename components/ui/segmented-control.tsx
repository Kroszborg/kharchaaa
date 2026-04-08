import { useColors } from '@/context/theme-context';
import { FontFamily } from '@/constants/typography';
import { Radius, Spacing, Spring } from '@/constants/tokens';
import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface SegmentedControlProps<T extends string> {
  options: readonly { label: string; value: T }[];
  selected: T;
  onChange: (value: T) => void;
  style?: ViewStyle;
  /** When true the control fills its parent width (profile, auth screens) */
  fullWidth?: boolean;
}

export function SegmentedControl<T extends string>({
  options,
  selected,
  onChange,
  style,
  fullWidth = false,
}: SegmentedControlProps<T>) {
  const colors = useColors();
  const [containerWidth, setContainerWidth] = useState(0);
  const layoutsRef = useRef<Record<string, { x: number; width: number }>>({});
  const hasLaidOut = useRef(false);

  const sliderX = useSharedValue(0);
  const sliderWidth = useSharedValue(0);

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sliderX.value }],
    width: sliderWidth.value,
  }));

  const animateToSelected = (value: T) => {
    const layout = layoutsRef.current[value];
    if (!layout || !hasLaidOut.current) return;
    sliderX.value = withSpring(layout.x, Spring.snappy);
    sliderWidth.value = withSpring(layout.width, Spring.snappy);
  };

  React.useEffect(() => {
    if (hasLaidOut.current) animateToSelected(selected);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, containerWidth]);

  return (
    <Animated.View
      style={[
        styles.container,
        fullWidth && styles.containerFull,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View style={[styles.slider, { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderStrong }, sliderStyle]} />
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          style={[styles.option, fullWidth && styles.optionFull]}
          onPress={() => onChange(opt.value)}
          onLayout={(e) => {
            layoutsRef.current[opt.value] = {
              x: e.nativeEvent.layout.x,
              width: e.nativeEvent.layout.width,
            };
            const allMeasured = options.every(o => layoutsRef.current[o.value]);
            if (allMeasured && !hasLaidOut.current) {
              hasLaidOut.current = true;
              const layout = layoutsRef.current[selected];
              if (layout) {
                sliderX.value = layout.x;
                sliderWidth.value = layout.width;
              }
            }
          }}
        >
          <Animated.Text
            style={[
              styles.label,
              selected === opt.value
                ? { color: colors.textPrimary }
                : { color: colors.textTertiary },
            ]}
          >
            {opt.label}
          </Animated.Text>
        </Pressable>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: Radius.full,
    borderWidth: 1,
    padding: 3,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  containerFull: {
    alignSelf: 'stretch',
  },
  slider: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  option: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  optionFull: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontFamily: FontFamily.medium,
    letterSpacing: 0.1,
  },
});
