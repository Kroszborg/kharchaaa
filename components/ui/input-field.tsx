import { useColors } from '@/context/theme-context';
import { FontFamily } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/tokens';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';

interface InputFieldProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  secure?: boolean;
  autoComplete?: TextInputProps['autoComplete'];
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  error?: string;
  style?: ViewStyle;
}

export function InputField({
  label,
  value,
  onChange,
  placeholder,
  secure = false,
  autoComplete,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error,
  style,
}: InputFieldProps) {
  const colors = useColors();
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      <View
        style={[
          styles.inputRow,
          { backgroundColor: colors.surface, borderColor: colors.border },
          focused && { borderColor: colors.accentBorder },
          !!error && { borderColor: colors.error },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secure && !showPassword}
          autoComplete={autoComplete}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={colors.accent}
        />
        {secure && (
          <Pressable
            onPress={() => setShowPassword(v => !v)}
            hitSlop={8}
            style={styles.eyeBtn}
          >
            <HugeiconsIcon
              icon={showPassword ? ViewOffIcon : ViewIcon}
              size={18}
              color={colors.textTertiary}
              strokeWidth={1.5}
            />
          </Pressable>
        )}
      </View>
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: FontFamily.regular,
    paddingVertical: 0,
  },
  eyeBtn: {
    paddingLeft: Spacing.sm,
  },
  error: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
  },
});
