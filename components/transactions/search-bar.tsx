import { useColors } from '@/context/theme-context';
import { Radius, Spacing } from '@/constants/tokens';
import { FontFamily } from '@/constants/typography';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Cancel01Icon, Search01Icon } from '@hugeicons/core-free-icons';
import React, { useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
  onDismiss: () => void;
}

export function SearchBar({ value, onChange, onDismiss }: SearchBarProps) {
  const colors = useColors();
  const inputRef = useRef<TextInput>(null);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[
      styles.container,
      { backgroundColor: colors.surface, borderColor: colors.borderStrong },
      animStyle,
    ]}>
      <HugeiconsIcon icon={Search01Icon} size={18} color={colors.textTertiary} strokeWidth={1.5} />
      <TextInput
        ref={inputRef}
        style={[styles.input, { color: colors.textPrimary }]}
        value={value}
        onChangeText={onChange}
        placeholder="Search transactions..."
        placeholderTextColor={colors.textTertiary}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChange('')} hitSlop={8}>
          <HugeiconsIcon icon={Cancel01Icon} size={16} color={colors.textTertiary} strokeWidth={1.5} />
        </Pressable>
      )}
      <Pressable onPress={onDismiss} hitSlop={8} style={{ marginLeft: Spacing.xs }}>
        <View style={styles.cancelBtn}>
          <Animated.Text style={[styles.cancelText, { color: colors.accentBright }]}>Cancel</Animated.Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: FontFamily.regular,
    padding: 0,
  },
  cancelBtn: {
    paddingLeft: Spacing.sm,
  },
  cancelText: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
  },
});
