// Pill-shaped option button (for choosing times, filters, etc.)
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

export default function Chip({ label, selected, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.chip, selected && styles.selected, disabled && styles.disabled, pressed && styles.pressed]}
      accessibilityState={{ selected, disabled }}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  selected: { borderColor: colors.brandBorder, backgroundColor: colors.brandSoft },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.8 },
  text: { fontSize: 13, fontWeight: '600', color: colors.muted },
  selectedText: { color: colors.text },
});
