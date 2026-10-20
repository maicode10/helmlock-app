// Fig. 5, 6, 7: what happens after a scan (Helmet stored, Locker opened, Time expired, Extension successful)
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import LcdDisplay from '../../components/LcdDisplay';
import Notice from '../../components/Notice';
import api from '../../api';
import { RULES } from '../../config';
import { formatTime } from '../../utils/format';
import { colors } from '../../theme';

function look(result) {
  if (result.action === 'store') return { icon: 'checkmark', color: colors.green, bg: colors.greenSoft, title: 'Helmet stored', text: `Your helmet is safe in Locker ${result.locker}. Close the door until it clicks.` };
  if (result.action === 'retrieve') return { icon: 'lock-open-outline', color: colors.green, bg: colors.greenSoft, title: 'Locker opened', text: 'Take your helmet and close the locker door. Ride safe!' };
  if (result.action === 'extend') return { icon: 'time-outline', color: colors.green, bg: colors.greenSoft, title: 'Extension successful', text: `You have ${RULES.extensionMinutes} more minutes. Scan your OUT QR again to get your helmet.` };
  if (result.code === 'extension_required') return { icon: 'hourglass-outline', color: colors.amber, bg: colors.amberSoft, title: 'Storage time expired', text: `Your retrieval time has passed. Insert the ₱${RULES.extensionFee} extension fee to continue.` };
  return { icon: 'close', color: colors.brandText, bg: colors.brandSoft, title: "Locker didn't open", text: result.message };
}

export default function ScanResultScreen({ navigation, route }) {
  const [result, setResult] = useState(route.params.result);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const l = look(result);

  async function payExtension() {
    setBusy(true);
    setError('');
    try {
      setResult(await api.simulateExtend());
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  }

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
        {error ? <Notice kind="danger" style={styles.error}>{error}</Notice> : null}
      </View>

      <View style={styles.actions}>
        {result.code === 'extension_required' ? <Button title={`Pay ₱${RULES.extensionFee} extension (testing)`} icon="cash-outline" onPress={payExtension} loading={busy} /> : null}
        <Button title="Done" variant={result.code === 'extension_required' ? 'secondary' : 'primary'} onPress={() => navigation.goBack()} />
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
  error: { marginTop: 14, alignSelf: 'stretch' },
  actions: { gap: 10, paddingBottom: 8 },
});
