// Fig. 5, 6, 7: what happens after a scan (Helmet stored, Locker opened, Didn't open)
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import LcdDisplay from '../../components/LcdDisplay';
import { formatTime } from '../../utils/format';
import { peso } from '../../utils/pricing';
import { colors } from '../../theme';

function look(result) {
  if (result.action === 'store') return { icon: 'checkmark', color: colors.green, bg: colors.greenSoft, title: 'Helmet stored', text: `Your helmet is safe in Locker ${result.locker}. Close the door until it clicks.` };
  if (result.action === 'retrieve') {
    const late = result.late_fee ? ` (includes a ${peso(result.late_fee)} late fee)` : '';
    return { icon: 'lock-open-outline', color: colors.green, bg: colors.greenSoft, title: 'Locker opened', text: `You paid ${peso(result.paid)}${late}. Take your helmet and close the door. Ride safe!` };
  }
  return { icon: 'close', color: colors.brandText, bg: colors.brandSoft, title: "Locker didn't open", text: result.message };
}

export default function ScanResultScreen({ navigation, route }) {
  const result = route.params.result;
  const l = look(result);

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.center}>
        <View style={[styles.icon, { backgroundColor: l.bg }]}>
          <Ionicons name={l.icon} size={40} color={l.color} />
        </View>
        <Text style={styles.title}>{l.title}</Text>
        <Text style={styles.text}>{l.text}</Text>

        <Text style={styles.lcdLabel}>Locker screen</Text>
        <LcdDisplay lines={result.lcd} />
        <Text style={styles.time}>{formatTime(new Date())}{result.locker ? ` · Locker ${result.locker}` : ''}</Text>
      </View>

      <View style={styles.actions}>
        <Button title="Done" onPress={() => navigation.goBack()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  icon: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: 18, fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center' },
  text: { marginTop: 8, maxWidth: 320, fontSize: 15, lineHeight: 22, color: colors.muted, textAlign: 'center' },
  lcdLabel: { marginTop: 32, marginBottom: 8, fontSize: 11, fontWeight: '700', letterSpacing: 1, color: colors.faint, textTransform: 'uppercase' },
  time: { marginTop: 10, fontSize: 12, color: colors.faint },
  actions: { gap: 10, paddingBottom: 8 },
});