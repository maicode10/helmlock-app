// "Label ........ Value" row inside cards
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function InfoRow({ label, value, last }) {
  return (
    <View style={[styles.row, !last && styles.border]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 11 },
  border: { borderBottomWidth: 1, borderBottomColor: colors.line },
  label: { fontSize: 14, color: colors.muted },
  value: { flexShrink: 1, textAlign: 'right', fontSize: 14, fontWeight: '600', color: colors.text },
});
