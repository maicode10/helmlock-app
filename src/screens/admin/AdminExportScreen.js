// Export data as CSV and share it (Messenger, Gmail, Drive...). Opens in Excel or Google Sheets.
// Simple flow: 1) pick the dates (or any From/To days)  2) pick ONE file  3) one Export button.
import { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import Button from '../../components/Button';
import Notice from '../../components/Notice';
import SectionTitle from '../../components/SectionTitle';
import DatePickerModal from '../../components/DatePickerModal';
import api from '../../api';
import { formatDate, toYmd } from '../../utils/format';
import { colors, radius } from '../../theme';

const RANGES = [
  ['Today', 0],
  ['Last 7 days', 6],
  ['Last 30 days', 29],
  ['This month', 'month'],
  ['Custom', 'custom'],
];

// [type, icon, title, short description, uses the dates?]
const FILES = [
  ['daily', 'calendar-outline', 'Daily summary', 'Uses and money per day', true],
  ['hours', 'time-outline', 'Peak hours', 'Busiest times of the day', true],
  ['activity', 'cash-outline', 'Payments', 'Every action and amount, to check the coin box', true],
  ['reservations', 'list-outline', 'Reservations', 'Every reservation and its status', true],
  ['students', 'people-outline', 'Students', 'All students and their no-shows', false],
];

function rangeFor(value) {
  const to = new Date();
  const from = new Date();
  if (value === 'month') from.setDate(1);
  else from.setDate(from.getDate() - value);
  return { from: toYmd(from), to: toYmd(to) };
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export default function AdminExportScreen() {
  const [rangeIndex, setRangeIndex] = useState(1);
  const [fileIndex, setFileIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  // Custom dates (used when "Custom" is picked)
  const [customFrom, setCustomFrom] = useState(daysAgo(6));
  const [customTo, setCustomTo] = useState(new Date());
  const [picking, setPicking] = useState(null); // 'from', 'to' or null

  const isCustom = RANGES[rangeIndex][1] === 'custom';
  const { from, to } = isCustom ? { from: toYmd(customFrom), to: toYmd(customTo) } : rangeFor(RANGES[rangeIndex][1]);
  const [type, , title, , usesDates] = FILES[fileIndex];

  function pickDate(day) {
    if (picking === 'from') {
      setCustomFrom(day);
      if (day > customTo) setCustomTo(day); // keep From before To
    } else {
      setCustomTo(day);
      if (day < customFrom) setCustomFrom(day);
    }
    setPicking(null);
  }

  async function exportFile() {
    setBusy(true);
    setNotice(null);
    try {
      const res = await api.adminExport({ type, from, to });
      await Share.share({ title: res.filename, message: res.csv });
      setNotice({ kind: 'success', text: `${res.filename} is ready (${res.rows} rows). Save it as a .csv file to open it in Excel.` });
    } catch (e) {
      setNotice({ kind: 'danger', text: e.message });
    }
    setBusy(false);
  }

  return (
    <Screen>
      <ScreenHeader back title="Export Data" subtitle="Get HelmLock records as a CSV file for Excel or Google Sheets." />

      {notice ? <Notice kind={notice.kind} style={styles.gap}>{notice.text}</Notice> : null}

      <SectionTitle>1. Dates</SectionTitle>
      <View style={[styles.chips, !usesDates && styles.dim]}>
        {RANGES.map(([label], i) => (
          <Chip key={label} label={label} selected={i === rangeIndex} disabled={!usesDates} onPress={() => setRangeIndex(i)} />
        ))}
      </View>
      {isCustom && usesDates ? (
        <View style={styles.custom}>
          <Pressable onPress={() => setPicking('from')} style={({ pressed }) => [styles.dateBox, pressed && styles.pressed]}>
            <Text style={styles.dateLabel}>FROM</Text>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.brandText} />
              <Text style={styles.dateValue}>{formatDate(from + 'T00:00:00')}</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => setPicking('to')} style={({ pressed }) => [styles.dateBox, pressed && styles.pressed]}>
            <Text style={styles.dateLabel}>TO</Text>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.brandText} />
              <Text style={styles.dateValue}>{formatDate(to + 'T00:00:00')}</Text>
            </View>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.range}>
          {usesDates ? `${formatDate(from + 'T00:00:00')} to ${formatDate(to + 'T00:00:00')}` : 'The Students file always includes everyone.'}
        </Text>
      )}

      <SectionTitle>2. File</SectionTitle>
      <Card style={styles.list}>
        {FILES.map(([key, icon, name, text], i) => {
          const selected = i === fileIndex;
          const last = i === FILES.length - 1;
          return (
            <Pressable
              key={key}
              onPress={() => setFileIndex(i)}
              style={({ pressed }) => [styles.row, !last && styles.divider, pressed && styles.pressed]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <View style={[styles.icon, selected && styles.iconOn]}>
                <Ionicons name={icon} size={18} color={selected ? colors.text : colors.brandText} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.title}>{name}</Text>
                <Text style={styles.text}>{text}</Text>
              </View>
              <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected ? colors.brandBright : colors.faint} />
            </Pressable>
          );
        })}
      </Card>

      <Button title={`Export ${title}`} icon="share-outline" onPress={exportFile} loading={busy} style={styles.button} />

      <Text style={styles.privacy}>These files contain student names. Keep them within the HelmLock team (Data Privacy Act of 2012).</Text>

      <DatePickerModal
        visible={picking !== null}
        title={picking === 'from' ? 'FROM DATE' : 'TO DATE'}
        value={picking === 'from' ? customFrom : customTo}
        onPick={pickDate}
        onClose={() => setPicking(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dim: { opacity: 0.5 },
  range: { marginTop: 10, fontSize: 13, color: colors.muted },
  custom: { flexDirection: 'row', gap: 10, marginTop: 12 },
  dateBox: { flex: 1, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.brandBorder, backgroundColor: colors.surface },
  dateLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: colors.faint },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  dateValue: { fontSize: 14, fontWeight: '700', color: colors.text },
  list: { paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.line },
  pressed: { opacity: 0.7 },
  icon: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2 },
  iconOn: { backgroundColor: colors.brand },
  flex: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  text: { marginTop: 2, fontSize: 13, lineHeight: 18, color: colors.muted },
  button: { marginTop: 20 },
  privacy: { marginTop: 16, marginBottom: 12, fontSize: 12, lineHeight: 18, color: colors.faint, textAlign: 'center' },
});
