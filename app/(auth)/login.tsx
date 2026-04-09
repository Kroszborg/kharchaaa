import { InputField } from '@/components/ui/input-field';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useColors } from '@/context/theme-context';
import { Colors, Gradients } from '@/constants/theme';
import { MOCK_TRANSACTIONS } from '@/lib/mock-data';
import { transactionService } from '@/lib/services/transaction-service';
import { syncService } from '@/lib/services/sync-service';
import { Radius, Spacing } from '@/constants/tokens';
import { FontFamily } from '@/constants/typography';
import { useUserStore } from '@/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AUTH_MODES = [
  { label: 'Sign In', value: 'signin' },
  { label: 'Sign Up', value: 'signup' },
] as const;

type AuthMode = 'signin' | 'signup';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const updateProfile = useUserStore(s => s.updateProfile);

  const [mode, setMode] = useState<AuthMode>('signin');
  const [activeForm, setActiveForm] = useState<AuthMode>('signin');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const formOpacity = useSharedValue(1);
  const formTranslateY = useSharedValue(0);
  const switchingRef = useRef(false);

  const formAnimStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  function switchMode(next: AuthMode) {
    if (next === mode || switchingRef.current) return;
    switchingRef.current = true;
    setMode(next);

    formOpacity.value = withTiming(0, { duration: 110 });
    formTranslateY.value = withTiming(-10, { duration: 110 });

    setTimeout(() => {
      setActiveForm(next);
      formTranslateY.value = 10;
      formOpacity.value = withSpring(1, { damping: 22, stiffness: 220 });
      formTranslateY.value = withSpring(0, { damping: 22, stiffness: 220 });
      setTimeout(() => { switchingRef.current = false; }, 300);
    }, 120);
  }

  function validateSignIn(): string | null {
    if (!email.includes('@')) return 'Enter a valid email address';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return null;
  }

  function validateSignUp(): string | null {
    if (!name.trim()) return 'Enter your full name';
    if (!email.includes('@')) return 'Enter a valid email address';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  }

  async function handleSignIn() {
    const err = validateSignIn();
    if (err) { Alert.alert('Error', err); return; }
    setLoading(true);
    try {
      // Try backend if configured; otherwise fall back to local session
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      if (apiUrl) {
        const res = await fetch(`${apiUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message ?? 'Login failed');
        // Backend returns { data: { accessToken, refreshToken, user } }
        const data = json.data ?? json;
        if (data.accessToken) await AsyncStorage.setItem('kh_auth_token', data.accessToken);
        if (data.refreshToken) await AsyncStorage.setItem('kh_refresh_token', data.refreshToken);
        if (data.user?.name) updateProfile({ name: data.user.name, email: data.user.email ?? email });
      } else {
        // Offline / no backend — create local session
        await AsyncStorage.setItem('kh_auth_token', 'local');
        const displayName = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'User';
        updateProfile({ name: displayName, email });
      }
      // Start background sync
      syncService.startBackgroundSync();
      router.replace('/(tabs)');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Something went wrong';
      Alert.alert('Sign in failed', message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    const err = validateSignUp();
    if (err) { Alert.alert('Error', err); return; }
    setLoading(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      if (apiUrl) {
        const res = await fetch(`${apiUrl}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message ?? 'Registration failed');
        const data = json.data ?? json;
        if (data.accessToken) await AsyncStorage.setItem('kh_auth_token', data.accessToken);
        if (data.refreshToken) await AsyncStorage.setItem('kh_refresh_token', data.refreshToken);
      } else {
        await AsyncStorage.setItem('kh_auth_token', 'local');
      }
      if (name.trim()) updateProfile({ name: name.trim(), email });
      // Start background sync
      syncService.startBackgroundSync();
      router.replace('/(tabs)');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Something went wrong';
      Alert.alert('Sign up failed', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background, paddingTop: insets.top }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Logo + Title ── */}
        <View style={styles.hero}>
          <LinearGradient
            colors={Gradients.accent}
            style={styles.logoBox}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.logoLetter}>K</Text>
          </LinearGradient>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome to Kharchaaa</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Understand your money like never before</Text>
        </View>

        {/* ── Segmented Control ── */}
        <SegmentedControl
          options={AUTH_MODES}
          selected={mode}
          onChange={switchMode}
          fullWidth
        />

        {/* ── Form Card ── */}
        <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Animated.View style={[styles.formInner, formAnimStyle]}>
            {activeForm === 'signup' && (
              <InputField
                label="Full name"
                value={name}
                onChange={setName}
                placeholder="Alex Yu"
                autoCapitalize="words"
                autoComplete="name"
              />
            )}
            <InputField
              label="Email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <InputField
              label="Password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              secure
              autoCapitalize="none"
              autoComplete={activeForm === 'signin' ? 'current-password' : 'new-password'}
            />
            {activeForm === 'signup' && (
              <InputField
                label="Confirm password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="••••••••"
                secure
                autoCapitalize="none"
                autoComplete="new-password"
              />
            )}
            {activeForm === 'signin' && (
              <Pressable style={styles.forgotRow}>
                <Text style={[styles.forgotText, { color: colors.accentBright }]} onPress={() => Alert.alert('Coming soon', 'Password reset will be available soon.')}>
                  Forgot password?
                </Text>
              </Pressable>
            )}
          </Animated.View>
        </View>

        {/* ── Primary action ── */}
        <PrimaryButton
          label={mode === 'signin' ? 'Sign In' : 'Create Account'}
          onPress={mode === 'signin' ? handleSignIn : handleSignUp}
          loading={loading}
        />

        {/* ── Divider ── */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* ── Continue without account ── */}
        <PrimaryButton
          label="Continue without account"
          variant="outline"
          onPress={async () => {
            await AsyncStorage.setItem('kh_auth_token', 'demo');
            await transactionService.seedDemoData(MOCK_TRANSACTIONS);
            router.replace('/(tabs)');
          }}
        />

        {/* ── Terms (sign up only) ── */}
        {mode === 'signup' && (
          <Text style={[styles.terms, { color: colors.textTertiary }]}>
            By continuing you agree to our Terms of Service and Privacy Policy
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingBottom: 48,
    gap: Spacing.lg,
  },
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  logoLetter: {
    fontSize: 28,
    fontFamily: FontFamily.bold,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 24,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  formInner: {
    gap: Spacing.md,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotText: {
    fontSize: 13,
    fontFamily: FontFamily.medium,
    color: Colors.accentBright,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    color: Colors.textTertiary,
  },
  terms: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
