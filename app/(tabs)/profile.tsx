import { InputField } from '@/components/ui/input-field';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Text } from '@/components/ui/text';
import { KharchaaaLogo } from '@/components/ui/kharchaaa-logo';
import { useDialog } from '@/components/ui/dialog';
import { useColors } from '@/context/theme-context';
import { Colors } from '@/constants/theme';
import { Radius, Spacing } from '@/constants/tokens';
import { FontFamily } from '@/constants/typography';
import { useCurrency } from '@/hooks/use-currency';
import {
  selectTransactions,
  useTransactionStore,
  useUserStore,
  selectUserProfile,
  useUIStore,
} from '@/store';
import { useThemeMode } from '@/hooks/use-theme-mode';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Invoice02Icon,
  Logout01Icon,
  Moon02Icon,
  Notification01Icon,
  Shield01Icon,
  Sun01Icon,
} from '@hugeicons/core-free-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PROFILE_MODES = [
  { label: 'Preview', value: 'overview' },
  { label: 'Edit', value: 'edit' },
] as const;

type ProfileMode = 'overview' | 'edit';

function InfoRow({ label, value, accent, colors }: { label: string; value: string; accent?: boolean; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: accent ? Colors.success : colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

function SettingRow({ icon, label, value, onPress, right, destructive, colors }: {
  icon: typeof Shield01Icon;
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  destructive?: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.settingRow, pressed && onPress && { opacity: 0.65 }]}
      onPress={onPress}
      disabled={!onPress && !right}
    >
      <View style={[
        styles.settingIcon,
        { backgroundColor: colors.surface },
        destructive && { backgroundColor: Colors.errorMuted },
      ]}>
        <HugeiconsIcon
          icon={icon}
          size={16}
          color={destructive ? Colors.error : colors.textSecondary}
          strokeWidth={1.5}
        />
      </View>
      <Text style={[styles.settingLabel, { color: destructive ? Colors.error : colors.textPrimary }]}>
        {label}
      </Text>
      {right ?? (value ? <Text style={[styles.settingValue, { color: colors.textTertiary }]}>{value}</Text> : null)}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const transactions = useTransactionStore(selectTransactions);
  const profile = useUserStore(selectUserProfile);
  const updateProfile = useUserStore(s => s.updateProfile);
  const showToast = useUIStore(s => s.showToast);
  const { mode: themeMode, toggle: toggleTheme } = useThemeMode();
  const { show: showDialog, element: dialogElement } = useDialog();
  const { fmt } = useCurrency();

  const [profileMode, setProfileMode] = useState<ProfileMode>('overview');
  const [activeTab, setActiveTab] = useState<ProfileMode>('overview');

  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editPassword, setEditPassword] = useState('');
  const [editConfirm, setEditConfirm] = useState('');

  const opacity    = useSharedValue(1);
  const translateY = useSharedValue(0);
  const switching  = useRef(false);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // ── Crash-safe tab switch via setTimeout (avoids worklet runOnJS issues) ──
  function switchTab(next: ProfileMode) {
    if (next === profileMode || switching.current) return;
    switching.current = true;
    setProfileMode(next);

    // Fade out
    opacity.value    = withTiming(0, { duration: 100 });
    translateY.value = withTiming(-6, { duration: 100 });

    setTimeout(() => {
      // Sync edit fields before showing form
      if (next === 'edit') {
        setEditName(profile.name);
        setEditEmail(profile.email);
        setEditPassword('');
        setEditConfirm('');
      }
      setActiveTab(next);

      // Fade back in
      translateY.value  = 6;
      opacity.value     = withSpring(1, { damping: 22, stiffness: 280 });
      translateY.value  = withSpring(0, { damping: 22, stiffness: 280 });
      switching.current = false;
    }, 110);
  }

  function handleUpdate() {
    if (!editName.trim()) { showToast('Name cannot be empty', 'error'); return; }
    if (!editEmail.includes('@')) { showToast('Enter a valid email', 'error'); return; }
    if (editPassword && editPassword !== editConfirm) {
      showToast('Passwords do not match', 'error'); return;
    }
    updateProfile({ name: editName.trim(), email: editEmail.trim() });
    showToast('Profile updated', 'success');
    switchTab('overview');
  }

  function handleLogout() {
    showDialog({
      title: 'Sign out',
      message: 'You\'ll need to sign back in to access your account.',
      actions: [
        { label: 'Cancel', style: 'cancel', onPress: () => {} },
        {
          label: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('kh_auth_token');
            router.replace('/(auth)/login');
          },
        },
      ],
    });
  }

  // Compute stats in a single pass
  const now = new Date();
  const nowMonth = now.getMonth();
  const nowYear  = now.getFullYear();
  let debitCount = 0, creditCount = 0, monthlySpend = 0, monthlyIncome = 0;
  for (const t of transactions) {
    const d = new Date(t.date);
    const isThisMonth = d.getMonth() === nowMonth && d.getFullYear() === nowYear;
    if (t.type === 'debit') {
      debitCount++;
      if (isThisMonth) monthlySpend += t.amount;
    } else {
      creditCount++;
      if (isThisMonth) monthlyIncome += t.amount;
    }
  }
  const netFlow = monthlyIncome - monthlySpend;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {dialogElement}
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <KharchaaaLogo size={36} />
          <Text style={[styles.appTitle, { color: colors.textPrimary }]}>Profile</Text>
          <Pressable
            style={[styles.iconBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            hitSlop={12}
            onPress={() => router.push('/notifications')}
          >
            <HugeiconsIcon icon={Notification01Icon} size={18} color={colors.textSecondary} strokeWidth={1.5} />
            {/* Unread badge */}
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>2</Text>
            </View>
          </Pressable>
        </View>

        {/* ── Avatar ── */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarRing, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderStrong }]}>
            <Text style={[styles.avatarLetter, { color: colors.textPrimary }]}>{profile.avatarInitial}</Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={[styles.name, { color: colors.textPrimary }]}>{profile.name}</Text>
            <Text style={[styles.emailSub, { color: colors.textSecondary }]}>{profile.email}</Text>
          </View>
        </View>

        {/* ── Stats strip ── */}
        <View style={[styles.statsRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          {[
            { num: transactions.length, label: 'Total' },
            { num: debitCount, label: 'Expenses' },
            { num: creditCount, label: 'Credits' },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <View style={[styles.statDivider, { backgroundColor: colors.border }]} />}
              <View style={styles.statItem}>
                <Text style={[styles.statNum, { color: colors.textPrimary }]}>{s.num}</Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* ── Segmented control ── */}
        <SegmentedControl options={PROFILE_MODES} selected={profileMode} onChange={switchTab} fullWidth />

        {/* ── Animated content ── */}
        <Animated.View style={[styles.tabContent, animStyle]}>
          {activeTab === 'overview' ? (
            <>
              {/* Finance summary */}
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>THIS MONTH</Text>
                <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                  <InfoRow label="Monthly spending" value={fmt(monthlySpend)} colors={colors} />
                  <View style={[styles.sep, { backgroundColor: colors.border }]} />
                  <InfoRow label="Monthly income" value={fmt(monthlyIncome)} colors={colors} />
                  <View style={[styles.sep, { backgroundColor: colors.border }]} />
                  <InfoRow
                    label="Net flow"
                    value={`${netFlow >= 0 ? '+' : '−'}${fmt(Math.abs(netFlow))}`}
                    accent={netFlow >= 0}
                    colors={colors}
                  />
                </View>
              </View>

              {/* Account */}
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>ACCOUNT</Text>
                <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                  <InfoRow label="Email" value={profile.email} colors={colors} />
                  <View style={[styles.sep, { backgroundColor: colors.border }]} />
                  <InfoRow label="Member since" value="Apr 2025" colors={colors} />
                </View>
              </View>

              {/* Appearance */}
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>APPEARANCE</Text>
                <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                  <SettingRow
                    icon={themeMode === 'dark' ? Moon02Icon : Sun01Icon}
                    label={themeMode === 'dark' ? 'Dark mode' : 'Light mode'}
                    colors={colors}
                    right={
                      <Switch
                        value={themeMode === 'dark'}
                        onValueChange={toggleTheme}
                        trackColor={{ false: colors.border, true: colors.accentMuted }}
                        thumbColor={themeMode === 'dark' ? colors.accentBright : colors.textTertiary}
                      />
                    }
                  />
                </View>
              </View>

              {/* About */}
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>ABOUT</Text>
                <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                  <SettingRow icon={Shield01Icon} label="Privacy" value="Data stays on device" colors={colors} />
                  <View style={[styles.sep, { backgroundColor: colors.border }]} />
                  <SettingRow icon={Invoice02Icon} label="App version" value="1.0.0" colors={colors} />
                </View>
              </View>

              {/* Sign out — separate card with clear gap */}
              <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <SettingRow
                  icon={Logout01Icon}
                  label="Sign out"
                  onPress={handleLogout}
                  destructive
                  colors={colors}
                />
              </View>
            </>
          ) : (
            /* ── Edit mode ── */
            <View style={styles.editCard}>
              <InputField
                label="Full name"
                value={editName}
                onChange={setEditName}
                placeholder="Your full name"
                autoCapitalize="words"
              />
              <InputField
                label="Email"
                value={editEmail}
                onChange={setEditEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <InputField
                label="New password"
                value={editPassword}
                onChange={setEditPassword}
                placeholder="Leave blank to keep current"
                secure
                autoCapitalize="none"
              />
              <InputField
                label="Confirm password"
                value={editConfirm}
                onChange={setEditConfirm}
                placeholder="••••••••"
                secure
                autoCapitalize="none"
              />
              <PrimaryButton label="Update Details" onPress={handleUpdate} />
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.base,
    paddingBottom: 120,
    gap: Spacing.lg,
  },

  // ── Header ───────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
  },
  appTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.4,
    marginLeft: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  notifBadgeText: {
    fontSize: 8,
    fontFamily: FontFamily.bold,
    color: '#FFF',
    lineHeight: 12,
  },

  // ── Avatar ───────────────────────────────────────────────────────
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  avatarRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 24,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.5,
  },
  avatarInfo: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.5,
  },
  emailSub: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
  },

  // ── Stats ────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingVertical: Spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statNum: {
    fontSize: 22,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: FontFamily.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginVertical: 6,
  },

  // ── Animated content wrapper ──────────────────────────────────────
  tabContent: {
    gap: Spacing.lg,
  },

  // ── Section ──────────────────────────────────────────────────────
  section: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: FontFamily.medium,
    letterSpacing: 1.5,
    paddingLeft: 4,
  },

  // ── Card ─────────────────────────────────────────────────────────
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sep: {
    height: 1,
    marginLeft: Spacing.md + 32 + Spacing.md,
  },

  // ── Info rows ────────────────────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: FontFamily.semibold,
    maxWidth: '55%',
    textAlign: 'right',
  },

  // ── Setting rows ─────────────────────────────────────────────────
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    gap: Spacing.md,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: FontFamily.regular,
  },
  settingValue: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
  },

  // ── Edit form ────────────────────────────────────────────────────
  editCard: {
    gap: Spacing.md,
  },
});
