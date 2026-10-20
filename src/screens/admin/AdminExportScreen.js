// Export data as CSV and share it (Messenger, Gmail, Drive...). Opens in Excel or Google Sheets.
import { useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import Button from '../../components/Button';
import Notice from '../../components/Notice';
import SectionTitle from '../../components/SectionTitle';
import api from '../../api';
import { formatDate, toYmd } from '../../utils/format';
import { colors, radius } from '../../theme';

const RANGES = [
  ['Today', 0],
  ['Last 7 days', 6],
  ['Last 30 days', 29],
  ['This month', 'month'],
];

const FILES = [
  ['daily', 'calendar-outline', 'Daily summary', 'One row per day: reservations, stored, retrieved, extensions, no-shows, and money. Has a TOTAL row.'],
  ['hours', 'time-outline', 'Peak hours', 'Uses and money for each hour of the day. Shows the busiest times.'],
  ['activity', 'cash-outline', 'Activity and payments', 'Every action with date, time, student, admin, and amount. Use it to check the coin box.'],
  ['reservations', 'list-outline', 'Reservations', 'Every reservation with the student, locker, times, extensions, and status.'],
  ['students', 'people-outline', 'Students', 'All students with their reservations and no-shows. Ignores the dates.'],
];

function rangeFor(value) {
  const to = new Date();
  const from = new Date();
  if (value === 'month') from.setDate(1);
  else from.setDate(from.getDate() - value);
  return { from: toYmd(from), to: toYmd(to) };
}

export default function AdminExportScreen() {
  const [rangeIndex, setRangeIndex] = useState(1);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState(null);
  const { from, to } = rangeFor(RANGES[rangeIndex][1]);

  async function exportFile(type) {
    setBusy(type);
    setNotice(null);
    try {
      const res = await api.adminExport({ type, from, to });
      await Share.share({ title: res.filename, message: res.csv });
      setNotice({ kind: 'success', text: `${res.filename} is ready (${res.rows} rows). Save it as a .csv file to open it in Excel.` });
    } catch (e) {
      setNotice({ kind: 'danger', text: e.message });
    }
    setBusy('');
  }

  return (
    <Screen>
      <ScreenHeader back title="Export Data" subtitle="Share HelmLock records as CSV text. Paste or save it as a .csv file to open it in Excel or Google Sheets." />

      {notice ? <Notice kind={notice.kind}>{notice.text}</Notice> : null}

      <SectionTitle>1. Pick the dates</SectionTitle>
      <View style={styles.chips}>
        {RANGES.map(([label], i) => (
          <Chip key={label} label={label} selected={i === rangeIndex} onPress={() => setRangeIndex(i)} />
        ))}
      </View>
      <Text style={styles.range}>
        {formatDate(from + 'T00:00:00')} to {formatDate(to + 'T00:00:00')}
      </Text>

      <SectionTitle>2. Choose a file</SectionTitle>
      <View style={styles.list}>
        {FILES.map(([type, icon, title, text]) => (
          <Card key={type}>
            <View style={styles.row}>
              <View style={styles.icon}>
                <Ionicons name={icon} size={18} color={colors.brandText} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.text}>{text}</Text>
              </View>
            </View>
            <Button title="Export and share" variant="secondary" icon="share-outline" onPress={() => exportFile(type)} loading={busy === type} style={styles.button} />
          </Card>
        ))}
      </View>

      <Text style={styles.privacy}>These files contain student names and IDs. Keep them within the HelmLock team (Data Privacy Act of 2012).</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  range: { marginTop: 10, fontSize: 13, color: colors.muted },
  list: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  icon: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2 },
  flex: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  text: { marginTop: 3, fontSize: 13, lineHeight: 19, color: colors.muted },
  button: { marginTop: 12, minHeight: 42 },
  privacy: { marginTop: 18, marginBottom: 12, fontSize: 12, lineHeight: 18, color: colors.faint, textAlign: 'center' },
});
