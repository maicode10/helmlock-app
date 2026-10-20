// Tappable row with icon, title, subtitle, and an arrow (for menus)
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export default function ListItem({ icon, title, subtitle, onPress, danger, badge, last }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, !last && styles.border, pressed && styles.pressed]}>
      {icon ? (
        <View style={[styles.icon, danger && styles.iconDanger]}>
          <Ionicons name={icon} size={18} color={danger ? colors.brandText : colors.textSoft} />
        </View>
      ) : null}
      <View style={styles.flex}>
        <Text style={[styles.title, danger && styles.danger]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      {!danger ? <Ionicons name="chevron-forward" size={18} color={colors.faint} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  border: { borderBottomWidth: 1, borderBottomColor: colors.line },
  pressed: { opacity: 0.7 },
  icon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2 },
  iconDanger: { backgroundColor: colors.brandSoft },
  flex: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: colors.text },
  danger: { color: colors.brandText },
  subtitle: { marginTop: 2, fontSize: 12, color: colors.muted },
  badge: { minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand },
  badgeText: { fontSize: 12, fontWeight: '700', color: colors.text },
});
