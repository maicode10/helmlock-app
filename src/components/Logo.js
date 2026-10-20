// HelmLock logo. size="large" (stacked) or size="small" (side by side)
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

export default function Logo({ size = 'large' }) {
  if (size === 'small') {
    return (
      <View style={styles.row}>
        <View style={[styles.badge, styles.badgeSmall]}>
          <Ionicons name="lock-closed" size={20} color={colors.text} />
        </View>
        <Text style={styles.nameSmall}>
          Helm<Text style={styles.red}>Lock</Text>
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      <View style={styles.badge}>
        <Ionicons name="lock-closed" size={32} color={colors.text} />
      </View>
      <Text style={styles.name}>
        Helm<Text style={styles.red}>Lock</Text>
      </Text>
      <Text style={styles.tagline}>Your Helmet's Personal Parking Space.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { width: 64, height: 64, borderRadius: radius.lg, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center', shadowColor: colors.brand, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  badgeSmall: { width: 38, height: 38, borderRadius: radius.md },
  name: { marginTop: 12, fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  nameSmall: { fontSize: 20, fontWeight: '800', color: colors.text },
  red: { color: colors.brandBright },
  tagline: { marginTop: 2, fontSize: 12, color: colors.muted },
});
