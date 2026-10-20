import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import Chip from '../../components/Chip';
import Button from '../../components/Button';
import Flash from '../../components/Flash';
import SectionTitle from '../../components/SectionTitle';
import useLoad from '../../hooks/useLoad';
import api from '../../api';
import { colors, radius } from '../../theme';

const COMMON = ["Door won't open", 'Coin was not accepted', "QR code won't scan", 'Locker screen is not working', 'Door is damaged'];

export default function ReportScreen() {
  const { data } = useLoad(() => api.getReportLockers());
  const [lockerId, setLockerId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState('');
  const [busy, setBusy] = useState(false);

  async function send() {
    setError('');
    setSent('');
    setBusy(true);
    try {
      const res = await api.createReport({ locker_id: lockerId, message });
      setSent(res.message);
      setMessage('');
      setLockerId(null);
    } catch (e) {
      setError(e.errors?.message?.[0] || e.message);
    }
    setBusy(false);
  }

  return (
    <Screen>
      <ScreenHeader back title="Report a Problem" subtitle="Something wrong with a locker? Tell us and the HelmLock team will check it." />

      <Flash message={sent} />

      <SectionTitle>Which locker?</SectionTitle>
      <View style={styles.chips}>
        <Chip label="Not sure" selected={lockerId === null} onPress={() => setLockerId(null)} />
        {(data?.lockers || []).map((l) => (
          <Chip key={l.id} label={`Locker ${l.number}`} selected={lockerId === l.id} onPress={() => setLockerId(l.id)} />
        ))}
      </View>

      <SectionTitle>What happened?</SectionTitle>
      <View style={styles.chips}>
        {COMMON.map((c) => (
          <Chip key={c} label={c} selected={message.startsWith(c)} onPress={() => setMessage(c + '. ')} />
        ))}
      </View>

      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={message}
        onChangeText={setMessage}
        placeholder="Describe the problem. Include the time and what you saw on the locker screen."
        placeholderTextColor={colors.faint}
        multiline
        maxLength={1000}
        textAlignVertical="top"
      />
      {error ? <Text style={styles.error}>{error}</Text> : <Text style={styles.count}>{message.length}/1000</Text>}

      <Button title="Send report" icon="send-outline" onPress={send} loading={busy} style={styles.button} />
      <Text style={styles.note}>If your helmet is stuck inside, the team can open the locker with the manual key.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  input: { marginTop: 14, minHeight: 130, padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface2, color: colors.text, fontSize: 15, lineHeight: 21 },
  inputError: { borderColor: colors.brandBright },
  error: { marginTop: 6, fontSize: 12, color: colors.brandText },
  count: { marginTop: 6, fontSize: 12, color: colors.faint, textAlign: 'right' },
  button: { marginTop: 16 },
  note: { marginTop: 14, fontSize: 12, lineHeight: 18, color: colors.faint, textAlign: 'center' },
});
