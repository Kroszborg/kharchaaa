import type { Category } from '@/lib/mock-data';
import { CATEGORY_COLORS } from '@/lib/mock-data';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Car01Icon,
  Coffee01Icon,
  FlashIcon,
  GameController01Icon,
  Money01Icon,
  PillIcon,
  ShoppingBag01Icon,
  Tag01Icon,
} from '@hugeicons/core-free-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const CATEGORY_ICONS: Record<Category, typeof Coffee01Icon> = {
  food: Coffee01Icon,
  transport: Car01Icon,
  shopping: ShoppingBag01Icon,
  utilities: FlashIcon,
  entertainment: GameController01Icon,
  health: PillIcon,
  salary: Money01Icon,
  other: Tag01Icon,
};

interface CategoryIconProps {
  category: Category;
  size?: number;
  iconSize?: number;
}

export function CategoryIcon({ category, size = 40, iconSize = 18 }: CategoryIconProps) {
  const color = CATEGORY_COLORS[category];
  const icon = CATEGORY_ICONS[category];

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2.5,
          backgroundColor: color + '25',
        },
      ]}
    >
      <HugeiconsIcon icon={icon} size={iconSize} color={color} strokeWidth={1.8} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
