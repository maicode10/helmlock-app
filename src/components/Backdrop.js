// The red-to-black background from the Figma design. Sits behind a screen's content.
// variant="plain" = solid black (used by the Welcome screen)
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { backgroundGradient, colors } from '../theme';

// Each background needs its own gradient id, or screens kept in memory can share a broken one
let count = 0;

export default function Backdrop({ variant = 'gradient' }) {
  const id = useRef('helmlockBg' + ++count).current;
  if (variant === 'plain') return <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.ink }]} />;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            {backgroundGradient.map((s) => (
              <Stop key={s.offset} offset={s.offset} stopColor={s.color} stopOpacity={1} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}