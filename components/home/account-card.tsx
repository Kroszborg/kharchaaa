import { FontFamily } from '@/constants/typography';
import { Radius, Shadow, Spacing } from '@/constants/tokens';
import { useCurrency } from '@/hooks/use-currency';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface AccountCardProps {
  cardholderName: string;
  balance: number;
  maskedNumber?: string;
  accountLabel?: string;
  cardType?: string;
}

export function AccountCard({
  cardholderName,
  balance,
  maskedNumber = '•••• •••• •••• 0329',
  accountLabel = 'Primary Account',
  cardType = 'SAVINGS',
}: AccountCardProps) {
  const isPositive = balance >= 0;
  const [isHidden, setIsHidden] = useState(false);
  const { fmt } = useCurrency();

  const displayNumber = isHidden ? '•••• •••• •••• ••••' : maskedNumber;
  const displayBalance = isHidden ? '••••••' : fmt(Math.abs(balance));

  return (
    <LinearGradient
      colors={['#2E2E2E', '#101010']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, Shadow.md]}
    >
      {/* Subtle decorative circles */}
      <View style={styles.shimmer1} />
      <View style={styles.shimmer2} />

      {/* Top row */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.cardTypeLabel}>{cardType}</Text>
          <Text style={styles.accountLabel}>{accountLabel}</Text>
        </View>
        <View style={styles.topRight}>
          {/* Eye toggle */}
          <Pressable
            onPress={() => setIsHidden(v => !v)}
            hitSlop={12}
            style={styles.eyeBtn}
          >
            <HugeiconsIcon
              icon={isHidden ? ViewOffIcon : ViewIcon}
              size={16}
              color="rgba(255,255,255,0.5)"
              strokeWidth={1.5}
            />
          </Pressable>
          {/* Chip dots */}
          <View style={styles.chip}>
            <View style={styles.chipDot} />
            <View style={[styles.chipDot, styles.chipDotRight]} />
          </View>
        </View>
      </View>

      {/* Card number */}
      <Text style={styles.cardNumber}>{displayNumber}</Text>

      {/* Bottom row */}
      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.metaLabel}>CARDHOLDER</Text>
          <Text style={styles.metaValue}>{cardholderName.toUpperCase()}</Text>
        </View>
        <View style={styles.balanceBlock}>
          <Text style={styles.metaLabel}>NET BALANCE</Text>
          <Text style={[styles.balanceValue, !isPositive && !isHidden && { color: '#EF4444' }]}>
            {isHidden ? displayBalance : (isPositive ? '' : '−') + displayBalance}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius['2xl'],
    padding: Spacing.lg,
    minHeight: 188,
    overflow: 'hidden',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  shimmer1: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.03)',
    right: -80,
    top: -80,
  },
  shimmer2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.02)',
    left: -40,
    bottom: -50,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  eyeBtn: {
    padding: 2,
  },
  cardTypeLabel: {
    fontSize: 9,
    fontFamily: FontFamily.medium,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    marginBottom: 2,
  },
  accountLabel: {
    fontSize: 13,
    fontFamily: FontFamily.semibold,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  chipDotRight: {
    marginLeft: -8,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  cardNumber: {
    fontSize: 14,
    fontFamily: FontFamily.semibold,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 4,
    marginVertical: Spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontSize: 9,
    fontFamily: FontFamily.medium,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 12,
    fontFamily: FontFamily.semibold,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1,
  },
  balanceBlock: {
    alignItems: 'flex-end',
  },
  balanceValue: {
    fontSize: 22,
    fontFamily: FontFamily.bold,
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: -0.8,
  },
});
