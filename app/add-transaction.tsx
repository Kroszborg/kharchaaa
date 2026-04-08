import { AmountInput } from '@/components/add-transaction/amount-input';
import { CategoryPicker } from '@/components/add-transaction/category-picker';
import { MerchantInput } from '@/components/add-transaction/merchant-input';
import { CalendarPicker } from '@/components/ui/calendar-picker';
import { Text } from '@/components/ui/text';
import { useColors } from '@/context/theme-context';
import { Colors } from '@/constants/theme';
import { Radius, Spacing } from '@/constants/tokens';
import { FontFamily } from '@/constants/typography';
import type { Category } from '@/lib/mock-data';
import { useTransactionStore, useUIStore } from '@/store';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Calendar01Icon } from '@hugeicons/core-free-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Step = 'amount' | 'details';

export default function AddTransactionModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const addTransaction = useTransactionStore(s => s.addTransaction);
  const showToast = useUIStore(s => s.showToast);

  const [step, setStep] = useState<Step>('amount');
  const [isSaving, setIsSaving] = useState(false);
  const [amount, setAmount] = useState('0');
  const [txType, setTxType] = useState<'debit' | 'credit'>('debit');
  const [category, setCategory] = useState<Category | null>(null);
  const [merchant, setMerchant] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  function handleKeyPress(key: string) {
    if (key === '⌫') {
      setAmount(prev => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
      return;
    }
    if (key === '.' && amount.includes('.')) return;
    const afterDot = amount.split('.')[1];
    if (afterDot && afterDot.length >= 2) return;
    setAmount(prev => (prev === '0' && key !== '.' ? key : prev + key));
  }

  function goToDetails() {
    if (!amount || parseFloat(amount) === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    setStep('details');
  }

  async function handleSave() {
    if (!category) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Select a category', 'Please pick a category.');
      return;
    }
    if (!merchant.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Add merchant', 'Who did you pay / receive from?');
      return;
    }

    setIsSaving(true);
    try {
      await addTransaction({
        amount: parseFloat(amount),
        type: txType,
        merchant: merchant.trim(),
        category,
        note: note.trim() || undefined,
        source: 'manual',
        date: date.toISOString(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Transaction saved', 'success');
      router.dismiss();
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  const formattedDate = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <>
      <CalendarPicker
        visible={showCalendar}
        value={date}
        onChange={setDate}
        onDismiss={() => setShowCalendar(false)}
        maxDate={new Date()}
      />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + Spacing.md, paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={() => (step === 'details' ? setStep('amount') : router.dismiss())}
              hitSlop={12}
            >
              <Text variant="bodyMedium" style={{ color: colors.textSecondary, fontFamily: FontFamily.medium }}>
                {step === 'details' ? '← Back' : 'Cancel'}
              </Text>
            </Pressable>

            <Text variant="h3" color="primary">
              {step === 'amount' ? 'New Transaction' : 'Add Details'}
            </Text>

            {/* Step indicators */}
            <View style={styles.steps}>
              <View style={[styles.step, { backgroundColor: step === 'amount' ? colors.accent : colors.border }]} />
              <View style={[styles.step, { backgroundColor: step === 'details' ? colors.accent : colors.border }]} />
            </View>
          </View>

          {/* Content */}
          {step === 'amount' ? (
            <AmountInput
              value={amount}
              txType={txType}
              onTypeChange={setTxType}
              onKeyPress={handleKeyPress}
              onContinue={goToDetails}
            />
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.detailsScroll}
            >
              {/* Date picker row */}
              <Pressable
                style={[styles.dateRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                onPress={() => setShowCalendar(true)}
              >
                <HugeiconsIcon icon={Calendar01Icon} size={17} color={colors.textSecondary} strokeWidth={1.5} />
                <Text style={[styles.dateText, { color: colors.textPrimary, flex: 1 }]}>
                  {formattedDate}
                </Text>
                <Text style={[styles.dateTap, { color: colors.textTertiary }]}>Tap to change</Text>
              </Pressable>

              <CategoryPicker selected={category} onSelect={setCategory} />
              <MerchantInput
                merchant={merchant}
                note={note}
                onMerchantChange={setMerchant}
                onNoteChange={setNote}
                onCategoryDetected={(detected) => {
                  if (!category) setCategory(detected);
                }}
              />

              {/* CTA */}
              <Pressable
                style={({ pressed }) => [
                  styles.cta,
                  { backgroundColor: colors.accent },
                  pressed && styles.ctaPressed,
                ]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={colors.accentForeground} size="small" />
                ) : (
                  <Text variant="bodyMedium" style={{ color: colors.accentForeground, fontFamily: FontFamily.semibold, letterSpacing: 0.2 }}>
                    Save Transaction
                  </Text>
                )}
              </Pressable>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  steps: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  step: {
    width: 20,
    height: 4,
    borderRadius: Radius.full,
  },
  detailsScroll: {
    gap: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  dateText: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
  },
  dateTap: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
  },
  cta: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  ctaPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
