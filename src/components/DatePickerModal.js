// Small calendar popup to pick one day (no extra library needed).
// Future days are greyed out, because there is no data for them yet.
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function sameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function DatePickerModal({ visible, title, value, onPick, onClose }) {
  const [month, setMonth] = useState(new Date((value || new Date()).getFullYear(), (value || new Date()).getMonth(), 1));
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // Jump to the chosen date's month every time the popup opens
  useEffect(() => {
    if (visible && value) setMonth(new Date(value.getFullYear(), value.getMonth(), 1));
  }, [visible, value]);

  const year = month.getFullYear();
  const m = month.getMonth();
  const firstWeekday = new Date(year, m, 1).getDay();
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, m, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const nextMonthStart = new Date(year, m + 1, 1);
  const canGoNext = nextMonthStart <= today;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {title ? <Text style={styles.title}>{title}</Text> : null}

          <View style={styles.header}>
            <Pressable onPress={() => setMonth(new Date(year, m - 1, 1))} hitSlop={10} style={styles.arrow} accessibilityLabel="Previous month">
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </Pressable>
            <Text style={styles.month}>
              {MONTHS[m]} {year}
            </Text>
            <Pressable onPress={() => canGoNext && setMonth(nextMonthStart)} hitSlop={10} style={[styles.arrow, !canGoNext && styles.off]} accessibilityLabel="Next month">
              <Ionicons name="chevron-forward" size={22} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.week}>
            {DAYS.map((d, i) => (
              <Text key={i} style={styles.weekday}>
                {d}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((day, i) => {
              if (!day) return <View key={i} style={styles.cell} />;
              const future = day > today;
              const selected = sameDay(day, value);
              const isToday = sameDay(day, new Date());
              return (
                <Pressable key={i} disabled={future} onPress={() => onPick(day)} style={styles.cell}>
                  <View style={[styles.dayCircle, selected && styles.selected, !selected && isToday && styles.today]}>
                    <Text style={[styles.dayText, future && styles.futureText, selected && styles.selectedText]}>{day.getDate()}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  sheet: { width: '100%', maxWidth: 380, borderRadius: radius.lg, padding: 16, backgroundColor: colors.surfaceSolid, borderWidth: 1, borderColor: colors.line },
  title: { fontSize: 13, fontWeight: '700', letterSpacing: 1, color: colors.muted, textAlign: 'center', marginBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  arrow: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  off: { opacity: 0.25 },
  month: { fontSize: 17, fontWeight: '800', color: colors.text },
  week: { flexDirection: 'row' },
  weekday: { width: `${100 / 7}%`, textAlign: 'center', fontSize: 12, fontWeight: '700', color: colors.faint, paddingVertical: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  selected: { backgroundColor: colors.brandBright },
  today: { borderWidth: 1, borderColor: colors.brandBorder },
  dayText: { fontSize: 14, fontWeight: '600', color: colors.text },
  futureText: { color: colors.faint, opacity: 0.4 },
  selectedText: { color: '#ffffff', fontWeight: '800' },
  cancel: { marginTop: 8, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 24 },
  cancelText: { fontSize: 15, fontWeight: '700', color: colors.brandText },
});
