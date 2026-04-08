import { Text } from '@/components/ui/text';
import { useColors } from '@/context/theme-context';
import { Colors } from '@/constants/theme';
import { Radius, Spacing } from '@/constants/tokens';
import { FontFamily } from '@/constants/typography';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

type TxType = 'debit' | 'credit';

interface AmountInputProps {
  value: string;
  txType: TxType;
  onTypeChange: (t: TxType) => void;
  onKeyPress: (key: string) => void;
  onContinue: () => void;
  loading?: boolean;
}

const NUMPAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '⌫'],
];

function NumKey({ label, onPress }: { label: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.key,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { backgroundColor: colors.surfaceHighlight },
      ]}
      onPress={onPress}
    >
      <Text
        variant="h2"
        color="primary"
        style={{ fontFamily: FontFamily.regular, fontSize: 22 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function formatDisplay(raw: string): string {
  if (!raw || raw === '0') return '0';
  const parts = raw.split('.');
  const intPart = parseInt(parts[0], 10).toLocaleString('en-IN');
  return parts.length > 1 ? `${intPart}.${parts[1]}` : intPart;
}

export function AmountInput({ value, txType, onTypeChange, onKeyPress, onContinue, loading }: AmountInputProps) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      {/* Type toggle — centered at top */}
      <View style={styles.topSection}>
        <View style={[styles.toggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable
            style={[styles.toggleBtn, txType === 'debit' && styles.toggleBtnDebit]}
            onPress={() => onTypeChange('debit')}
          >
            <Text
              variant="bodyMedium"
              style={{ color: txType === 'debit' ? '#FFF' : colors.textSecondary, fontFamily: FontFamily.semibold }}
            >
              Expense
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, txType === 'credit' && styles.toggleBtnCredit]}
            onPress={() => onTypeChange('credit')}
          >
            <Text
              variant="bodyMedium"
              style={{ color: txType === 'credit' ? '#FFF' : colors.textSecondary, fontFamily: FontFamily.semibold }}
            >
              Income
            </Text>
          </Pressable>
        </View>

        {/* Amount display — centered */}
        <View style={styles.display}>
          <Text
            variant="h3"
            style={{ fontSize: 32, lineHeight: 48, color: txType === 'debit' ? Colors.error + 'AA' : Colors.success + 'AA' }}
          >
            ₹
          </Text>
          <Text
            style={[
              styles.amountText,
              { color: txType === 'debit' ? Colors.error : Colors.success },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatDisplay(value)}
          </Text>
        </View>
      </View>

      {/* Numpad + CTA at bottom */}
      <View style={styles.bottomSection}>
        <View style={styles.numpad}>
          {NUMPAD.map((row, ri) => (
            <View key={ri} style={styles.numRow}>
              {row.map(key => (
                <NumKey key={key} label={key} onPress={() => onKeyPress(key)} />
              ))}
            </View>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: colors.accent },
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
          ]}
          onPress={onContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.accentForeground} size="small" />
          ) : (
            <Text variant="bodyMedium" style={{ color: colors.accentForeground, fontFamily: FontFamily.semibold, letterSpacing: 0.2 }}>
              Continue
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  toggle: {
    flexDirection: 'row',
    borderRadius: Radius.full,
    padding: 4,
    borderWidth: 1,
  },
  toggleBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  toggleBtnDebit: {
    backgroundColor: Colors.error,
  },
  toggleBtnCredit: {
    backgroundColor: Colors.success,
  },
  display: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  amountText: {
    fontSize: 52,
    lineHeight: 60,
    fontFamily: FontFamily.bold,
    letterSpacing: -1,
  },
  bottomSection: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  numpad: {
    gap: 6,
  },
  numRow: {
    flexDirection: 'row',
    gap: 6,
  },
  key: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  cta: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginTop: Spacing.xs,
  },
});
