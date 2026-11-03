// Tickable box with a label next to it
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export default function Checkbox({ checked, onChange, children }) {
  return (
    <Pressable onPress={() => onChange(!checked)} style={styles.row} accessibilityRole="checkbox" accessibilityState={{ checked }}>
      <View style={[styles.box, checked && styles.checked]}>
        {checked ? <Ionicons name="checkmark" size={14} color={colors.text} /> : null}
      </View>
      <View style={styles.label}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  box: { width: 20, height: 20, marginTop: 1, borderRadius: 5, borderWidth: 1.5, borderColor: colors.muted, backgroundColor: 'rgba(0, 0, 0, 0.25)', alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: colors.brand, borderColor: colors.brand },
  label: { flex: 1 },
});