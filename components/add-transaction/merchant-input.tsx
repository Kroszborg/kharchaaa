import { Text } from '@/components/ui/text';
import { useColors } from '@/context/theme-context';
import { Radius, Spacing } from '@/constants/tokens';
import { FontFamily } from '@/constants/typography';
import type { Category } from '@/lib/mock-data';
import { detectCategory } from '@/lib/services/category-service';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface FieldProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'words' | 'sentences' | 'characters';
}

function Field({ label, value, onChange, placeholder, multiline = false, autoCapitalize = 'words' }: FieldProps) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text variant="captionMedium" color="secondary" style={{ marginBottom: 6 }}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
          multiline && styles.inputMultiline,
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        autoCapitalize={autoCapitalize}
        returnKeyType={multiline ? 'default' : 'next'}
      />
    </View>
  );
}

interface MerchantInputProps {
  merchant: string;
  note: string;
  onMerchantChange: (v: string) => void;
  onNoteChange: (v: string) => void;
  /** Fires whenever category detection produces a new result — parent can pre-select */
  onCategoryDetected?: (category: Category) => void;
}

export function MerchantInput({
  merchant,
  note,
  onMerchantChange,
  onNoteChange,
  onCategoryDetected,
}: MerchantInputProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!onCategoryDetected || !merchant.trim()) return;

    debounceRef.current && clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const detected = detectCategory(merchant.trim());
      onCategoryDetected(detected);
    }, 350);

    return () => {
      debounceRef.current && clearTimeout(debounceRef.current);
    };
  }, [merchant]);

  return (
    <View style={styles.container}>
      <Field
        label="Merchant / Person"
        value={merchant}
        onChange={onMerchantChange}
        placeholder="e.g. Swiggy, Amazon, Rahul"
      />
      <Field
        label="Note (optional)"
        value={note}
        onChange={onNoteChange}
        placeholder="What was this for?"
        multiline
        autoCapitalize="sentences"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.base,
  },
  field: {},
  input: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 14,
    fontFamily: FontFamily.regular,
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
});
