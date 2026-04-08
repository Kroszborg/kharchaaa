import { useColors } from '@/context/theme-context';
import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { View } from 'react-native';

interface KharchaaaLogoProps {
  size?: number;
}

export function KharchaaaLogo({ size = 36 }: KharchaaaLogoProps) {
  const colors = useColors();
  // Invert: dark bg in dark mode → white square; light bg → dark square
  const squareFill = colors.accent;         // white (dark) / black (light)
  const letterFill = colors.accentForeground; // black (dark) / white (light)

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 36 36">
        {/* Background rounded square */}
        <Rect x="0" y="0" width="36" height="36" rx="9" ry="9" fill={squareFill} />

        {/* K letterform — clean geometric */}
        {/* Vertical stroke */}
        <Rect x="9" y="9" width="3.5" height="18" rx="1.75" fill={letterFill} />
        {/* Upper diagonal arm */}
        <Path
          d="M12.5 17.5 L22 9.5 L25.5 9.5 L15.2 18.5 Z"
          fill={letterFill}
          opacity="0.95"
        />
        {/* Lower diagonal arm */}
        <Path
          d="M14.5 19.2 L25 26.5 L21.5 26.5 L11.5 19.8 Z"
          fill={letterFill}
          opacity="0.95"
        />
      </Svg>
    </View>
  );
}
