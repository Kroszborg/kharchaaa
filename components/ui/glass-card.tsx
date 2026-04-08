import { Colors } from '@/constants/theme';
import { Radius, Shadow, Spacing } from '@/constants/tokens';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, View, type ViewProps } from 'react-native';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  gradient?: [string, string];
  intensity?: number;
  noPadding?: boolean;
}

export function GlassCard({
  children,
  gradient = ['rgba(28, 28, 46, 0.9)', 'rgba(20, 20, 32, 0.7)'],
  intensity = 20,
  noPadding = false,
  style,
  ...props
}: GlassCardProps) {
  return (
    <View style={[styles.container, Shadow.md, style]} {...props}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      ) : null}
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, styles.gradient]}
      />
      <View style={[styles.content, noPadding && styles.noPadding]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gradient: {
    borderRadius: Radius['2xl'],
  },
  content: {
    padding: Spacing.base,
  },
  noPadding: {
    padding: 0,
  },
});
