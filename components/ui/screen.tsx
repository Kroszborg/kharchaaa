import { useColors } from '@/context/theme-context';
import { Spacing } from '@/constants/tokens';
import React from 'react';
import { ScrollView, type ScrollViewProps, StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  scrollable?: boolean;
  scrollProps?: ScrollViewProps;
  noPadding?: boolean;
}

export function Screen({ children, scrollable = false, scrollProps, noPadding = false, style, ...props }: ScreenProps) {
  const colors = useColors();
  const paddingStyle = noPadding ? undefined : { paddingHorizontal: Spacing.base };

  if (scrollable) {
    return (
      <SafeAreaView style={[{ flex: 1, backgroundColor: colors.background }]} edges={['top']}>
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.background }}
          contentContainerStyle={[{ flexGrow: 1, paddingBottom: 110 }, paddingStyle]}
          showsVerticalScrollIndicator={false}
          {...scrollProps}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: colors.background }, style]} edges={['top']} {...props}>
      <View style={[{ flex: 1 }, paddingStyle]}>
        {children}
      </View>
    </SafeAreaView>
  );
}
