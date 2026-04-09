import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { ToastContainer } from '@/components/ui/toast';
import { AppThemeProvider } from '@/context/theme-context';
import { initDatabase } from '@/lib/db/database';
import { runMigrations } from '@/lib/db/migrations';
import { useTransactionStore, useUIStore, useAccountStore } from '@/store';
import type { ColorScheme } from '@/constants/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const ONBOARDING_KEY = 'kh_onboarding_done';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [dbReady, setDbReady]           = useState(false);
  const [onboardingDone, setOnboarding] = useState<boolean | null>(null);
  const [authToken, setAuthToken]       = useState<string | null | undefined>(undefined);
  const initializeStore = useTransactionStore(s => s.initialize);
  const initializeAccounts = useAccountStore(s => s.initialize);
  const setThemeMode = useUIStore(s => s.setThemeMode);
  const themeMode = useUIStore(s => s.themeMode);
  const hasBootstrapped = useRef(false);

  useEffect(() => {
    if (hasBootstrapped.current) return;
    hasBootstrapped.current = true;

    async function bootstrap() {
      try {
        // Check first-run flag + auth token in parallel
        const [flag, token, savedTheme] = await Promise.all([
          AsyncStorage.getItem(ONBOARDING_KEY),
          AsyncStorage.getItem('kh_auth_token'),
          AsyncStorage.getItem('kh_theme_mode'),
        ]);

        setOnboarding(flag === 'done');
        setAuthToken(token);

        if (savedTheme === 'light' || savedTheme === 'dark') {
          setThemeMode(savedTheme as ColorScheme);
        }

        // DB init (no demo seeding — done only via "Continue without account")
        const db = await initDatabase();
        await runMigrations(db);
        await Promise.all([initializeStore(), initializeAccounts()]);
      } catch (e) {
        console.error('[Bootstrap]', e);
        setOnboarding(true);
        setAuthToken(null);
      } finally {
        setDbReady(true);
      }
    }

    bootstrap();
  }, []);

  useEffect(() => {
    if (fontsLoaded && dbReady && onboardingDone !== null && authToken !== undefined) {
      SplashScreen.hideAsync().catch(() => {});
      if (!onboardingDone) {
        router.replace('/onboarding');
      } else if (!authToken) {
        router.replace('/(auth)/login');
      }
      // else: has token → stay on (tabs)
    }
  }, [fontsLoaded, dbReady, onboardingDone, authToken]);

  if (!fontsLoaded || !dbReady || onboardingDone === null || authToken === undefined) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppThemeProvider>
      <ThemeProvider value={themeMode === 'light' ? DefaultTheme : DarkTheme}>
        <Stack>
          {/* ── Main app ── */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* ── First-run flow ── */}
          <Stack.Screen
            name="onboarding"
            options={{ headerShown: false, animation: 'fade' }}
          />

          {/* ── Auth ── */}
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />

          {/* ── Modals ── */}
          <Stack.Screen
            name="add-transaction"
            options={{ presentation: 'modal', headerShown: false, gestureEnabled: true }}
          />
          <Stack.Screen
            name="add-account"
            options={{ presentation: 'modal', headerShown: false, gestureEnabled: true }}
          />
          <Stack.Screen
            name="notifications"
            options={{ presentation: 'modal', headerShown: false, gestureEnabled: true }}
          />
          <Stack.Screen
            name="modal"
            options={{ presentation: 'modal', headerShown: false }}
          />
        </Stack>

        {/* ── Global Toast overlay ── */}
        <ToastContainer />

        <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />
      </ThemeProvider>
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}
