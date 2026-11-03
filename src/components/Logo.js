// HelmLock logo from the Figma design.
// size="large": full logo (locker + HELMLOCK), size="small": locker icon + name, for headers
// To use a sharper logo, export it from Figma as PNG (3x) and replace assets/logo.png and assets/logo-mark.png
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

const LOGO = require('../../assets/logo.png'); // 792 × 576
const MARK = require('../../assets/logo-mark.png'); // 456 × 392

export default function Logo({ size = 'large', width = 260, tagline = true }) {
  if (size === 'small') {
    return (
      <View style={styles.row}>
        <View style={styles.markBox}>
          <Image source={MARK} style={styles.mark} resizeMode="contain" accessibilityIgnoresInvertColors />
        </View>
        <Text style={styles.nameSmall}>
          HELM<Text style={styles.red}>LOCK</Text>
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.stack} accessible accessibilityRole="image" accessibilityLabel="HelmLock">
      <Image source={LOGO} style={{ width, height: width * (576 / 792) }} resizeMode="contain" />
      {tagline ? <Text style={styles.tagline}>Your Helmet's Personal Space.</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  markBox: {
    borderRadius: 14,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  mark: { width: 40, height: 40 * (392 / 456) },
  nameSmall: { fontSize: 20, fontWeight: '900', color: colors.text, letterSpacing: 0.5 },
  red: { color: colors.brandBright },
  tagline: { marginTop: 6, fontSize: 13, color: colors.muted },
});