import { useColors } from '@/context/theme-context';
import { Colors } from '@/constants/theme';
import { FontFamily } from '@/constants/typography';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

function scoreColor(score: number): string {
  if (score < 580) return Colors.error;
  if (score < 670) return Colors.warning;
  return Colors.success;
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  'worklet';
  const toRad = (d: number) => (d * Math.PI) / 180;
  const sx = cx + r * Math.cos(toRad(startDeg));
  const sy = cy + r * Math.sin(toRad(startDeg));
  const ex = cx + r * Math.cos(toRad(endDeg));
  const ey = cy + r * Math.sin(toRad(endDeg));
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`;
}

interface CreditGaugeProps {
  score: number;
  maxScore?: number;
  size?: number;
}

export function CreditGauge({ score, maxScore = 850, size = 220 }: CreditGaugeProps) {
  const colors = useColors();
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 18;
  const strokeWidth = 14;

  // Arc: 180° (left) → 360° (right) through the top — classic speedometer
  const START_DEG = 180;
  const END_DEG = 360;
  const SPAN = 180;

  // SVG height shows top-semicircle + center text + label pill — all contained
  const svgH = cy + 62;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(score / maxScore, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [score, maxScore]);

  const seg1End = START_DEG + SPAN * 0.33;
  const seg2End = START_DEG + SPAN * 0.66;

  const bgArc1 = describeArc(cx, cy, r, START_DEG, seg1End);
  const bgArc2 = describeArc(cx, cy, r, seg1End, seg2End);
  const bgArc3 = describeArc(cx, cy, r, seg2End, END_DEG);

  const animatedProps = useAnimatedProps(() => {
    'worklet';
    const endDeg = START_DEG + SPAN * progress.value;
    if (progress.value <= 0) return { d: '' };
    return { d: describeArc(cx, cy, r, START_DEG, endDeg) };
  });

  const label =
    score < 580 ? 'Poor' :
    score < 670 ? 'Fair' :
    score < 740 ? 'Good' :
    score < 800 ? 'Very Good' : 'Excellent';

  const color = scoreColor(score);

  // Label pill geometry — centered under the score text
  const pillW = 76;
  const pillH = 22;
  const pillX = cx - pillW / 2;
  const pillY = cy + 34;

  return (
    <View style={{ alignSelf: 'center', width: size, height: svgH }}>
      <Svg width={size} height={svgH}>
        {/* Background arc segments */}
        <Path d={bgArc1} stroke={Colors.error}   strokeWidth={strokeWidth} fill="none" strokeLinecap="round" opacity={0.25} />
        <Path d={bgArc2} stroke={Colors.warning} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" opacity={0.25} />
        <Path d={bgArc3} stroke={Colors.success} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" opacity={0.25} />

        {/* Animated progress arc */}
        <AnimatedPath
          animatedProps={animatedProps}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Score number */}
        <SvgText
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fill={colors.textPrimary}
          fontSize={38}
          fontFamily={FontFamily.bold}
        >
          {score}
        </SvgText>

        {/* "Credit Score" label */}
        <SvgText
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fill={colors.textSecondary}
          fontSize={11}
          fontFamily={FontFamily.regular}
        >
          Credit Score
        </SvgText>

        {/* End range labels */}
        <SvgText x={20} y={cy + 28} textAnchor="start" fill={colors.textTertiary} fontSize={10} fontFamily={FontFamily.regular}>Poor</SvgText>
        <SvgText x={size - 20} y={cy + 28} textAnchor="end" fill={colors.textTertiary} fontSize={10} fontFamily={FontFamily.regular}>Excellent</SvgText>

        {/* Score label pill — entirely inside SVG bounds */}
        <Rect x={pillX} y={pillY} width={pillW} height={pillH} rx={pillH / 2} fill={color + '18'} stroke={color + '45'} strokeWidth={1} />
        <SvgText
          x={cx}
          y={pillY + pillH * 0.72}
          textAnchor="middle"
          fill={color}
          fontSize={11}
          fontFamily={FontFamily.semibold}
        >
          {label}
        </SvgText>
      </Svg>
    </View>
  );
}
