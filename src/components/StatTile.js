// Number tile for the admin overview
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

export default function StatTile({ label, value, color = colors.text, icon }) {
  return (
    <View style={styles.tile}>
      <View style={styles.top}>
        <Text style={styles.label}>{label}</Text>
        {icon ? <Ionicons name={icon} size={16} color={colors.faint} /> : null}
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, minWidth: '45%', padding: 14, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 12, color: colors.muted },
  value: { marginTop: 6, fontSize: 26, fontWeight: '800' },
});
