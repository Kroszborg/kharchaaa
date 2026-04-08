import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { Radius, Spacing } from '@/constants/tokens';
import { FontFamily } from '@/constants/typography';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Analytics01Icon, Invoice02Icon, Shield01Icon } from '@hugeicons/core-free-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const { width: W } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: Invoice02Icon,
    iconColor: '#9D5FFF',
    title: 'Track every rupee',
    body: 'Log expenses in seconds. Kharchaaa auto-categorises by merchant so you never have to think about it.',
  },
  {
    id: '2',
    icon: Analytics01Icon,
    iconColor: '#00C2CB',
    title: 'Insights that matter',
    body: 'See where your money actually goes — not just totals, but patterns and trends across months.',
  },
  {
    id: '3',
    icon: Shield01Icon,
    iconColor: '#00D97E',
    title: 'Private by default',
    body: 'Your data lives on your device first. Sync is opt-in, encrypted end-to-end, and always yours.',
  },
] as const;

function Dot({ active }: { active: boolean }) {
  const width = useSharedValue(active ? 20 : 6);

  // Animate on active change (not during render)
  useEffect(() => {
    width.value = withSpring(active ? 20 : 6, { damping: 18, stiffness: 300 });
  }, [active]);

  const style = useAnimatedStyle(() => ({
    width: width.value,
    height: 6,
    borderRadius: 3,
    backgroundColor: active ? Colors.accentBright : Colors.border,
  }));
  return <Animated.View style={style} />;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
    }
  ).current;

  async function next() {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      await AsyncStorage.setItem('kh_onboarding_done', 'done');
      router.replace('/(tabs)');
    }
  }

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={s => s.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={[styles.iconCircle, { borderColor: item.iconColor + '30' }]}>
              <View style={[styles.iconBg, { backgroundColor: item.iconColor + '15' }]}>
                <HugeiconsIcon icon={item.icon} size={36} color={item.iconColor} strokeWidth={1.5} />
              </View>
            </View>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideBody}>{item.body}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => <Dot key={i} active={i === index} />)}
      </View>

      {/* CTA */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
          onPress={next}
        >
          <Text style={styles.primaryBtnText}>
            {index < SLIDES.length - 1 ? 'Next' : 'Get Started'}
          </Text>
        </Pressable>

        {index === SLIDES.length - 1 && (
          <Pressable
            onPress={async () => {
              await AsyncStorage.setItem('kh_onboarding_done', 'done');
              router.replace('/(auth)/login');
            }}
            hitSlop={12}
          >
            <Text style={styles.skipText}>Already have an account? Sign in</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  slide: {
    width: W,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.base,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTitle: {
    fontSize: 28,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  slideBody: {
    fontSize: 15,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    letterSpacing: -0.2,
    lineHeight: 23,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingBottom: Spacing.lg,
  },
  actions: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  primaryBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 15,
    fontFamily: FontFamily.semibold,
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
  skipText: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingBottom: Spacing.sm,
  },
});
