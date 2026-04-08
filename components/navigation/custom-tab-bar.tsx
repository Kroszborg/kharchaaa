import { useColors } from '@/context/theme-context';
import { useUIStore } from '@/store';
import { Radius, Shadow, Spacing } from '@/constants/tokens';
import { FontFamily } from '@/constants/typography';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Analytics01Icon,
  Home01Icon,
  Invoice02Icon,
  UserIcon,
} from '@hugeicons/core-free-icons';
import Svg, { Path as SvgPath } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

type TabConfig = { name: string; label: string; icon: typeof Home01Icon };

const TABS: TabConfig[] = [
  { name: 'index',        label: 'Home',     icon: Home01Icon },
  { name: 'transactions', label: 'Spends',   icon: Invoice02Icon },
  { name: 'insights',     label: 'Balances', icon: Analytics01Icon },
  { name: 'profile',      label: 'Profile',  icon: UserIcon },
];

function TabButton({ config, isActive, onPress }: { config: TabConfig; isActive: boolean; onPress: () => void }) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      style={styles.tabItem}
      onPress={() => {
        scale.value = withSpring(0.86, { damping: 16, stiffness: 420 }, () => {
          scale.value = withSpring(1, { damping: 16, stiffness: 420 });
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <Animated.View style={[styles.tabInner, animStyle]}>
        <HugeiconsIcon
          icon={config.icon}
          size={22}
          color={isActive ? colors.accentBright : colors.textTertiary}
          strokeWidth={isActive ? 2 : 1.5}
        />
        <Text style={[styles.tabLabel, { color: isActive ? colors.accentBright : colors.textTertiary }]}>
          {config.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function AddButton() {
  const router = useRouter();
  const colors = useColors();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      style={styles.addTabItem}
      onPress={() => {
        scale.value = withSpring(0.82, { damping: 14, stiffness: 380 }, () => {
          scale.value = withSpring(1, { damping: 20, stiffness: 380 });
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/add-transaction');
      }}
    >
      <Animated.View style={[styles.addButton, Shadow.accentSoft, { backgroundColor: colors.accent, borderColor: colors.accentBorder }, animStyle]}>
        <Svg width={18} height={18} viewBox="0 0 18 18">
          <SvgPath d="M9 1.5v15M1.5 9h15" stroke={colors.accentForeground} strokeWidth="2.5" strokeLinecap="round" />
        </Svg>
      </Animated.View>
    </Pressable>
  );
}

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const themeMode = useUIStore(s => s.themeMode);

  const bar = (
    <View style={styles.bar}>
      {TABS.map((config, idx) => {
        const addBtn = idx === 2 ? <AddButton key="add" /> : null;
        const route = state.routes.find(r => r.name === config.name);
        const isActive = route ? state.index === state.routes.indexOf(route) : false;
        return (
          <React.Fragment key={config.name}>
            {addBtn}
            <TabButton
              config={config}
              isActive={isActive}
              onPress={() => route && navigation.navigate(route.name)}
            />
          </React.Fragment>
        );
      })}
    </View>
  );

  const pillStyle = [styles.pill, { marginBottom: insets.bottom + 12, borderColor: colors.borderStrong }];

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {Platform.OS === 'ios' ? (
        <BlurView tint={themeMode === 'light' ? 'light' : 'dark'} intensity={60} style={pillStyle}>
          {bar}
        </BlurView>
      ) : (
        <View style={[pillStyle, { backgroundColor: colors.surfaceElevated }]}>{bar}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  pill: {
    marginHorizontal: 20,
    borderRadius: Radius['3xl'],
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabInner: {
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: FontFamily.medium,
    letterSpacing: 0.3,
  },
  addTabItem: {
    flex: 1,
    alignItems: 'center',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
