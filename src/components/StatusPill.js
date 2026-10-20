// Small colored label for reservation and locker status
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

const STYLES = {
  reserved: ['Reserved', colors.amber, colors.amberSoft],
  stored: ['Helmet stored', colors.brandText, colors.brandSoft],
  completed: ['Completed', colors.green, colors.greenSoft],
  expired: ['Expired', colors.grey, colors.greySoft],
  cancelled: ['Cancelled', colors.grey, colors.greySoft],
  late: ['Late', colors.brandText, colors.brandSoft],
  available: ['Available', colors.green, colors.greenSoft],
  occupied: ['Occupied', colors.brandText, colors.brandSoft],
  out_of_service: ['Out of service', colors.grey, colors.greySoft],
  open: ['Open', colors.amber, colors.amberSoft],
  resolved: ['Resolved', colors.green, colors.greenSoft],
  blocked: ['Blocked', colors.brandText, colors.brandSoft],
  admin: ['Admin', colors.brandText, colors.brandSoft],
};

export default function StatusPill({ status, label }) {
  const [text, color, bg] = STYLES[status] || [status, colors.grey, colors.greySoft];
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label || text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 12, fontWeight: '600' },
});
