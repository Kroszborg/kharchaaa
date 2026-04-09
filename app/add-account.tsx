import { Text } from '@/components/ui/text';
import { useColors } from '@/context/theme-context';
import { Radius, Spacing } from '@/constants/tokens';
import { FontFamily } from '@/constants/typography';
import { useAccountStore, useUIStore } from '@/store';
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
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACCOUNT_TYPES = [
  { label: 'Savings', value: 'savings' as const },
  { label: 'Current', value: 'current' as const },
  { label: 'Credit', value: 'credit' as const },
  { label: 'Wallet', value: 'wallet' as const },
  { label: 'Cash', value: 'cash' as const },
];

const CARD_COLORS = [
  '#6366F1', // indigo
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#F97316', // orange
  '#22C55E', // green
  '#06B6D4', // cyan
  '#EAB308', // yellow
  '#78716C', // stone
];

const POPULAR_BANKS = ['HDFC', 'SBI', 'ICICI', 'Axis', 'Kotak', 'PNB', 'BOB', 'Canara', 'Yes Bank', 'IDFC'];

export default function AddAccountModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const addAccount = useAccountStore(s => s.addAccount);
  const showToast = useUIStore(s => s.showToast);

  const [accountType, setAccountType] = useState<'savings' | 'current' | 'credit' | 'wallet' | 'cash'>('savings');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [lastFour, setLastFour] = useState('');
  const [balance, setBalance] = useState('');
  const [selectedColor, setSelectedColor] = useState(CARD_COLORS[0]);
  const [isSaving, setIsSaving] = useState(false);

  const needsCardNumber = accountType === 'savings' || accountType === 'current' || accountType === 'credit';
  const displayName = accountName.trim() || (bankName ? `${bankName} ${accountType.charAt(0).toUpperCase() + accountType.slice(1)}` : '');

  async function handleSave() {
    if (!displayName) {
      Alert.alert('Account name required', 'Enter a bank name or custom account name.');
      return;
    }
    const bal = parseFloat(balance) || 0;

    setIsSaving(true);
    try {
      await addAccount({
        name: displayName,
        type: accountType,
        bank: bankName.trim(),
        balance: bal,
        lastFour: lastFour.slice(-4),
        color: selectedColor,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Account added', 'success');
      router.dismiss();
    } catch {
      Alert.alert('Error', 'Could not save account. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, {
        backgroundColor: colors.background,
        paddingTop: insets.top + Spacing.md,
        paddingBottom: Math.max(insets.bottom, Spacing.md),
      }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.dismiss()} hitSlop={12}>
            <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>Cancel</Text>
          </Pressable>
          <Text variant="h3" color="primary">Add Account</Text>
          <View style={{ width: 52 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Card preview */}
          <View style={[styles.cardPreview, { backgroundColor: selectedColor }]}>
            <View style={styles.cardPreviewShimmer} />
            <Text style={styles.cardPreviewType}>{accountType.toUpperCase()}</Text>
            <Text style={styles.cardPreviewName} numberOfLines={1}>
              {displayName || 'Account Name'}
            </Text>
            {needsCardNumber && (
              <Text style={styles.cardPreviewNum}>
                •••• •••• •••• {lastFour || '0000'}
              </Text>
            )}
            <Text style={styles.cardPreviewBal}>
              ₹{parseFloat(balance || '0').toLocaleString('en-IN')}
            </Text>
          </View>

          {/* Account type */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Account Type</Text>
            <View style={styles.typeRow}>
              {ACCOUNT_TYPES.map(t => (
                <Pressable
                  key={t.value}
                  style={[
                    styles.typeChip,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                    accountType === t.value && { backgroundColor: colors.accent, borderColor: colors.accent },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setAccountType(t.value);
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    fontFamily: FontFamily.medium,
                    color: accountType === t.value ? colors.accentForeground : colors.textSecondary,
                    includeFontPadding: false,
                  }}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Bank name */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Bank</Text>
            <View style={styles.bankRow}>
              {POPULAR_BANKS.slice(0, 5).map(b => (
                <Pressable
                  key={b}
                  style={[
                    styles.bankChip,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                    bankName === b && { backgroundColor: colors.accent, borderColor: colors.accent },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setBankName(prev => prev === b ? '' : b);
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    fontFamily: FontFamily.medium,
                    color: bankName === b ? colors.accentForeground : colors.textSecondary,
                    includeFontPadding: false,
                  }}>
                    {b}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surface }]}
              placeholder="Or type bank name..."
              placeholderTextColor={colors.textTertiary}
              value={bankName}
              onChangeText={setBankName}
              autoCapitalize="words"
            />
          </View>

          {/* Custom name */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Custom name (optional)</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surface }]}
              placeholder="e.g. HDFC Salary Account"
              placeholderTextColor={colors.textTertiary}
              value={accountName}
              onChangeText={setAccountName}
              autoCapitalize="words"
            />
          </View>

          {/* Last 4 digits */}
          {needsCardNumber && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Last 4 digits</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surface }]}
                placeholder="0000"
                placeholderTextColor={colors.textTertiary}
                value={lastFour}
                onChangeText={t => setLastFour(t.replace(/\D/g, '').slice(0, 4))}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
          )}

          {/* Opening balance */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Current balance (₹)</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surface }]}
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
              value={balance}
              onChangeText={t => setBalance(t.replace(/[^0-9.]/g, ''))}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Color */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Card color</Text>
            <View style={styles.colorRow}>
              {CARD_COLORS.map(c => (
                <Pressable
                  key={c}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    selectedColor === c && styles.colorDotSelected,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedColor(c);
                  }}
                />
              ))}
            </View>
          </View>

          {/* Save */}
          <Pressable
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: colors.accent },
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.accentForeground} size="small" />
            ) : (
              <Text style={{ fontSize: 15, fontFamily: FontFamily.semibold, color: colors.accentForeground }}>
                Add Account
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
    gap: Spacing.base,
  },
  cardPreview: {
    borderRadius: Radius['2xl'],
    padding: Spacing.lg,
    minHeight: 150,
    justifyContent: 'space-between',
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  cardPreviewShimmer: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
    right: -60,
    top: -60,
  },
  cardPreviewType: {
    fontSize: 9,
    fontFamily: FontFamily.medium,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
  },
  cardPreviewName: {
    fontSize: 16,
    fontFamily: FontFamily.semibold,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  cardPreviewNum: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
  },
  cardPreviewBal: {
    fontSize: 22,
    fontFamily: FontFamily.bold,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  section: { gap: Spacing.sm },
  label: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    letterSpacing: 0.1,
  },
  input: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: 14,
    fontFamily: FontFamily.regular,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  bankRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  bankChip: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  colorRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  saveBtn: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
});
