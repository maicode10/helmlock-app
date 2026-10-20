// Soft colored notice: warning (amber), danger (red), info (grey)
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

const KINDS = {
  warning: { color: colors.amber, bg: colors.amberSoft, icon: 'alert-circle-outline' },
  danger: { color: colors.brandText, bg: colors.brandSoft, icon: 'warning-outline' },
  info: { color: colors.textSoft, bg: colors.surface, icon: 'information-circle-outline' },
  success: { color: colors.green, bg: colors.greenSoft, icon: 'checkmark-circle-outline' },
};

export default function Notice({ kind = 'info', children, style }) {
  const k = KINDS[kind];
  return (
    <View style={[styles.box, { backgroundColor: k.bg }, kind === 'info' && styles.infoBorder, style]}>
      <Ionicons name={k.icon} size={18} color={k.color} style={styles.icon} />
      <Text style={[styles.text, { color: k.color }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: radius.md },
  infoBorder: { borderWidth: 1, borderColor: colors.line },
  icon: { marginTop: 1 },
  text: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: '500' },
});
